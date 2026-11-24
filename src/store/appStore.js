import {
	batch,
	defineStore,
	destroyStore,
	onStoreClear,
	store,
	useStore,
} from "./index.js";

const DB_NAME = "choplife-app-store";
const APP_PERSIST_KEYS = ["theme", "spiceTolerance", "servingsMultiplier", "soundEffects", "activeFilter"];
const PLANNER_PERSIST_KEYS = ["eventName", "guestCount", "budgetTotal", "expenses", "prepNotes", "draft"];

const MAX_EVENTS = 50;
const devtoolsLog = [];
const logListeners = new Set();

function notifyLogListeners() {
	for (const listener of logListeners) {
		try {
			listener(devtoolsLog);
		} catch {}
	}
}

function recordEvent(event, payload) {
	const stamp = new Date().toISOString().slice(11, 19);
	let detail = "";

	if (payload && typeof payload === "object") {
		if ("key" in payload && "value" in payload) {
			detail = `${payload.key} = ${summarizeValue(payload.value)}`;
		} else if ("key" in payload) {
			detail = String(payload.key);
		} else if ("name" in payload && "err" in payload) {
			detail = `${payload.name} (${payload.err?.message || payload.err})`;
		} else if ("name" in payload) {
			detail = String(payload.name);
		} else if ("message" in payload) {
			detail = String(payload.message);
		}
	}

	devtoolsLog.unshift(
		detail ? `[${stamp}] ${event}: ${detail}` : `[${stamp}] ${event}`,
	);

	if (devtoolsLog.length > MAX_EVENTS) {
		devtoolsLog.length = MAX_EVENTS;
	}

	notifyLogListeners();
}

function summarizeValue(value) {
	if (typeof value === "string") {
		return value.length > 30 ? `"${value.slice(0, 30)}…"` : `"${value}"`;
	}

	if (Array.isArray(value)) {
		return `Array(${value.length})`;
	}

	if (value && typeof value === "object") {
		try {
			const text = JSON.stringify(value);
			return text.length > 45 ? `${text.slice(0, 45)}…` : text;
		} catch {
			return "[Object]";
		}
	}

	return String(value);
}

// Attach non-destructive DevTools hook
const previousDevtools = globalThis.__STORE_DEVTOOLS__;
globalThis.__STORE_DEVTOOLS__ = {
	emit(event, payload) {
		recordEvent(event, payload);
		previousDevtools?.emit?.(event, payload);
	},
};

export function getStoreEvents() {
	return devtoolsLog.slice();
}

export function clearStoreEvents() {
	devtoolsLog.length = 0;
	notifyLogListeners();
}

export function onStoreEvents(listener) {
	logListeners.add(listener);
	return () => logListeners.delete(listener);
}

// ---------------------------------------------------------------------------
// 1. Application-Level Global State
// ---------------------------------------------------------------------------

const DEFAULT_APP_STATE = {
	theme: "dark",
	spiceTolerance: 2, // 1: Mild, 2: Medium, 3: Hot, 4: Firewood Peppeh
	servingsMultiplier: 1,
	soundEffects: false,
	activeFilter: "All",
	cartDrawerOpen: false,
	vaultUnlocked: false,
	toast: { message: "", type: "info", visible: false, timestamp: 0 },
};

function initAppDefaults() {
	batch(() => {
		for (const [key, value] of Object.entries(DEFAULT_APP_STATE)) {
			if (!store.has(key)) {
				store.set(key, value);
			}
		}
	});
}

function registerAppActions() {
	store.defineAction("app:setTheme", (ctx, theme) => {
		const next = theme === "light" ? "light" : "dark";
		ctx.set("theme", next);
		if (typeof document !== "undefined" && document.documentElement) {
			document.documentElement.dataset.theme = next;
		}
		return next;
	});

	store.defineAction("app:toggleTheme", (ctx) => {
		const current = ctx.get("theme") || "dark";
		const next = current === "dark" ? "light" : "dark";
		ctx.set("theme", next);
		if (typeof document !== "undefined" && document.documentElement) {
			document.documentElement.dataset.theme = next;
		}
		return next;
	});

	store.defineAction("app:setSpiceTolerance", (ctx, level) => {
		const clamped = Math.max(1, Math.min(4, Number(level) || 2));
		ctx.set("spiceTolerance", clamped);
		return clamped;
	});

	store.defineAction("app:setServingsMultiplier", (ctx, mult) => {
		const clamped = Math.max(0.5, Math.min(10, Number(mult) || 1));
		ctx.set("servingsMultiplier", clamped);
		return clamped;
	});

	store.defineAction("app:toggleSound", (ctx) => {
		const next = !ctx.get("soundEffects");
		ctx.set("soundEffects", next);
		return next;
	});

	store.defineAction("app:setActiveFilter", (ctx, filter) => {
		ctx.set("activeFilter", String(filter || "All"));
		return ctx.get("activeFilter");
	});

	store.defineAction("app:showToast", (ctx, { message, type = "info" }) => {
		const payload = {
			message: String(message || ""),
			type,
			visible: true,
			timestamp: Date.now(),
		};
		ctx.set("toast", payload);
		return payload;
	});

	store.defineAction("app:dismissToast", (ctx) => {
		const current = ctx.get("toast") || {};
		ctx.set("toast", { ...current, visible: false });
	});

	store.defineAction("app:unlockVault", (ctx, passcode) => {
		if ((passcode || "").trim().toUpperCase() === "VIPCHOPPER") {
			ctx.set("vaultUnlocked", true);
			return true;
		}
		return false;
	});

	store.defineAction("app:applyPartyPreset", (ctx, partyType = "owambe") => {
		const presets = {
			owambe: { spiceTolerance: 3, servingsMultiplier: 4, soundEffects: true },
			family: { spiceTolerance: 2, servingsMultiplier: 2, soundEffects: false },
			solo: { spiceTolerance: 1, servingsMultiplier: 1, soundEffects: false },
		};
		const chosen = presets[partyType] || presets.owambe;
		batch(() => {
			ctx.set("spiceTolerance", chosen.spiceTolerance);
			ctx.set("servingsMultiplier", chosen.servingsMultiplier);
			ctx.set("soundEffects", chosen.soundEffects);
		});
		return chosen;
	});

	store.defineAction("app:asyncSyncKitchenTelemetry", async (ctx, delayMs = 150) => {
		await new Promise((resolve) => setTimeout(resolve, delayMs));
		const summary = `Theme: ${ctx.get("theme")}, Peppeh Level: ${ctx.get("spiceTolerance")}`;
		return `Kitchen synced (${summary}) at ${new Date().toISOString().slice(11, 19)}`;
	});
}

initAppDefaults();
registerAppActions();

onStoreClear(() => {
	initAppDefaults();
	registerAppActions();
});

// Derived Global Selectors
export const isDarkTheme = store.select((s) => s.get("theme") === "dark");

export const themeSummary = store.select((s) => {
	const theme = s.get("theme") || "dark";
	const spice = s.get("spiceTolerance") || 2;
	const mult = s.get("servingsMultiplier") || 1;
	const spiceLabels = ["", "Mild", "Medium", "Hot", "Firewood Hot"];
	return `${theme.toUpperCase()} · Peppeh: ${spiceLabels[spice] || "Medium"} · Scale: ${mult}x`;
});

export const vipAccessStatus = store.select((s) => {
	const unlocked = s.get("vaultUnlocked") === true;
	return unlocked ? "VIP Chef Access Granted" : "VIP Kitchen Locked";
});

// Sync theme changes to document dataset if in browser
if (typeof document !== "undefined") {
	store.subscribe("theme", (theme) => {
		if (document.documentElement) {
			document.documentElement.dataset.theme = theme || "dark";
		}
	});
}

// ---------------------------------------------------------------------------
// 2. Owambe Event Planner Feature Module (defineStore / useStore / destroyStore)
// ---------------------------------------------------------------------------

function createInitialExpenses() {
	return [
		{ id: 1, item: "Smoky Firewood Jollof Rice (2 bags)", amount: 180000, category: "Rice & Grains" },
		{ id: 2, item: "Assorted Meat & Goat Meat for Pepper Soup", amount: 140000, category: "Proteins" },
		{ id: 3, item: "Egusi Soup Stock, Crayfish & Dry Fish", amount: 95000, category: "Soups & Swallows" },
		{ id: 4, item: "Puff-Puff, Small Chops & Boli Grills", amount: 65000, category: "Chops & Drinks" },
	];
}

function createInitialPrepNotes() {
	return [
		{ id: 1, text: "Season meat with onions, scotch bonnets and thyme overnight", done: true },
		{ id: 2, text: "Blend tatase, rodo, and tomatoes for firewood Jollof base", done: true },
		{ id: 3, text: "Set up heavy cast iron firewood pots outdoors", done: false },
		{ id: 4, text: "Fry plantain for Dodo and test spice balance in Pepper Soup", done: false },
	];
}

let plannerSelectors = null;
let plannerPersistence = null;
let globalPersistence = null;

const persistenceState = {
	globalStatus: "hydrating",
	plannerStatus: "hydrating",
	lastError: "",
};

const persistenceListeners = new Set();

function notifyPersistenceListeners() {
	const snapshot = getPersistenceStatus();
	for (const listener of persistenceListeners) {
		try {
			listener(snapshot);
		} catch {}
	}
}

export function getPersistenceStatus() {
	return { ...persistenceState };
}

export function onPersistenceStatus(listener) {
	persistenceListeners.add(listener);
	return () => persistenceListeners.delete(listener);
}

function attachGlobalPersistence() {
	globalPersistence?.stop();
	persistenceState.globalStatus = "hydrating";
	persistenceState.lastError = "";
	notifyPersistenceListeners();

	const controller = store.persist(APP_PERSIST_KEYS, {
		dbName: DB_NAME,
		debounce: 100,
		onError(error) {
			persistenceState.globalStatus = "error";
			persistenceState.lastError = error?.message || String(error);
			recordEvent("persist:error", { message: persistenceState.lastError });
			notifyPersistenceListeners();
		},
	});

	globalPersistence = controller;

	controller.ready.then((ok) => {
		if (globalPersistence !== controller) return;
		persistenceState.globalStatus = ok ? "hydrated" : "inactive";
		recordEvent("persist:ready", {
			message: `global (${persistenceState.globalStatus})`,
		});
		notifyPersistenceListeners();
	});

	return controller;
}

function attachPlannerPersistence(planner) {
	plannerPersistence?.stop();

	if (!planner) {
		plannerPersistence = null;
		persistenceState.plannerStatus = "stopped";
		notifyPersistenceListeners();
		return null;
	}

	persistenceState.plannerStatus = "hydrating";
	persistenceState.lastError = "";
	notifyPersistenceListeners();

	const controller = planner.persist(PLANNER_PERSIST_KEYS, {
		dbName: DB_NAME,
		debounce: 100,
		onError(error) {
			persistenceState.plannerStatus = "error";
			persistenceState.lastError = error?.message || String(error);
			recordEvent("persist:error", { message: persistenceState.lastError });
			notifyPersistenceListeners();
		},
	});

	plannerPersistence = controller;

	controller.ready.then((ok) => {
		if (plannerPersistence !== controller) return;
		persistenceState.plannerStatus = ok ? "hydrated" : "inactive";
		recordEvent("persist:ready", {
			message: `planner (${persistenceState.plannerStatus})`,
		});
		notifyPersistenceListeners();
	});

	return controller;
}

function buildPlannerSelectors(planner) {
	const expenseTotal = planner.select((s) => {
		const list = Array.isArray(s.expenses) ? s.expenses : [];
		return list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
	});

	const remainingBudget = planner.select((s) => {
		const total = Number(s.budgetTotal) || 0;
		const list = Array.isArray(s.expenses) ? s.expenses : [];
		const spent = list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
		return total - spent;
	});

	const completedNotesCount = planner.select((s) => {
		const list = Array.isArray(s.prepNotes) ? s.prepNotes : [];
		return list.filter((item) => item.done).length;
	});

	const plannerSummary = planner.select((s) => {
		const name = s.eventName || "Owambe Party";
		const guests = s.guestCount || 50;
		const list = Array.isArray(s.expenses) ? s.expenses : [];
		const spent = list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
		const notes = Array.isArray(s.prepNotes) ? s.prepNotes : [];
		const done = notes.filter((item) => item.done).length;
		return `${name} · ${guests} guests · ₦${spent.toLocaleString()} spent · ${done}/${notes.length} prep tasks complete`;
	});

	return { expenseTotal, remainingBudget, completedNotesCount, plannerSummary };
}

/**
 * Ensure the "eventPlanner" store module is registered and persisted.
 */
export function ensurePlannerStore() {
	const existing = useStore("eventPlanner");
	if (existing) {
		if (!plannerSelectors) {
			plannerSelectors = buildPlannerSelectors(existing);
		}
		return existing;
	}

	const planner = defineStore("eventPlanner", {
		state: {
			eventName: "December Mega Lagos Owambe",
			guestCount: 150,
			budgetTotal: 750000,
			expenses: createInitialExpenses(),
			prepNotes: createInitialPrepNotes(),
			draft: "",
		},

		actions: {
			setEventName(ctx, name) {
				const trimmed = String(name || "").trim();
				if (trimmed) {
					ctx.set("eventName", trimmed);
				}
				return ctx.get("eventName");
			},

			setGuestCount(ctx, count) {
				const numeric = Math.max(1, Number(count) || 50);
				ctx.set("guestCount", numeric);
				return numeric;
			},

			setBudgetTotal(ctx, total) {
				const numeric = Math.max(0, Number(total) || 0);
				ctx.set("budgetTotal", numeric);
				return numeric;
			},

			addExpense(ctx, { item, amount, category = "General Food" }) {
				const text = String(item || "").trim();
				if (!text) return null;
				const expense = {
					id: Date.now() + Math.floor(Math.random() * 1000),
					item: text,
					amount: Number(amount) || 0,
					category: String(category || "General Food"),
				};
				ctx.update("expenses", (list) => [...(list || []), expense]);
				return expense;
			},

			removeExpense(ctx, id) {
				ctx.update("expenses", (list) =>
					(list || []).filter((item) => item.id !== Number(id)),
				);
			},

			addPrepNote(ctx, text) {
				const trimmed = String(text || "").trim();
				if (!trimmed) return null;
				const note = {
					id: Date.now() + Math.floor(Math.random() * 1000),
					text: trimmed,
					done: false,
				};
				ctx.update("prepNotes", (list) => [...(list || []), note]);
				return note;
			},

			togglePrepNote(ctx, id) {
				const notes = ctx.get("prepNotes") || [];
				const target = notes.find((item) => item.id === Number(id));
				if (!target) return false;
				// Demonstrates mutating a nested item inside a stored collection + touch()
				target.done = !target.done;
				ctx.touch("prepNotes");
				return target.done;
			},

			removePrepNote(ctx, id) {
				ctx.update("prepNotes", (list) =>
					(list || []).filter((item) => item.id !== Number(id)),
				);
			},

			setDraft(ctx, text) {
				ctx.set("draft", String(text ?? ""));
			},

			applyPresetBudget(ctx) {
				batch(() => {
					ctx.set("eventName", "Grand Royal Coronation Owambe");
					ctx.set("guestCount", 300);
					ctx.set("budgetTotal", 1500000);
					ctx.set("draft", "VIP Owambe catering contract signed!");
				});
			},

			resetPlanner(ctx) {
				batch(() => {
					ctx.set("eventName", "December Mega Lagos Owambe");
					ctx.set("guestCount", 150);
					ctx.set("budgetTotal", 750000);
					ctx.set("expenses", createInitialExpenses());
					ctx.set("prepNotes", createInitialPrepNotes());
					ctx.set("draft", "");
				});
			},
		},

		cleanup() {
			plannerSelectors = null;
			plannerPersistence = null;
			persistenceState.plannerStatus = "stopped";
			recordEvent("module:cleanup", {
				message: "eventPlanner module destroyed",
			});
			notifyPersistenceListeners();
		},
	});

	plannerSelectors = buildPlannerSelectors(planner);
	attachPlannerPersistence(planner);
	return planner;
}

export function getPlannerStore() {
	return useStore("eventPlanner");
}

export function getPlannerSelectors() {
	return plannerSelectors;
}

export function destroyPlannerStore() {
	destroyStore("eventPlanner");
}

export async function flushAppPersistence() {
	const results = await Promise.all([
		globalPersistence ? globalPersistence.flush() : Promise.resolve(true),
		plannerPersistence ? plannerPersistence.flush() : Promise.resolve(true),
	]);
	recordEvent("persist:flush", {
		message: results.every(Boolean) ? "flushed to IndexedDB" : "flush incomplete",
	});
	return results.every(Boolean);
}

export async function clearAppPersistence() {
	const results = await Promise.all([
		globalPersistence ? globalPersistence.clear() : Promise.resolve(true),
		plannerPersistence ? plannerPersistence.clear() : Promise.resolve(true),
	]);
	recordEvent("persist:clear", {
		message: "cleared IndexedDB entries (sync stays active)",
	});
	return results.every(Boolean);
}

export function stopAppPersistence() {
	globalPersistence?.stop();
	plannerPersistence?.stop();
	persistenceState.globalStatus = "stopped";
	persistenceState.plannerStatus = "stopped";
	recordEvent("persist:stop", {
		message: "stopped syncing (IndexedDB data preserved)",
	});
	notifyPersistenceListeners();
}

export function restartAppPersistence() {
	attachGlobalPersistence();
	const planner = useStore("eventPlanner");
	if (planner) {
		attachPlannerPersistence(planner);
	}
}

// Initialize persistence & planner module on startup
attachGlobalPersistence();
ensurePlannerStore();

export const appStore = {
	store,
	batch,
	isDarkTheme,
	themeSummary,
	vipAccessStatus,
	ensurePlannerStore,
	getPlannerStore,
	getPlannerSelectors,
	destroyPlannerStore,
	getPersistenceStatus,
	onPersistenceStatus,
	flushPersistence: flushAppPersistence,
	clearPersistence: clearAppPersistence,
	stopPersistence: stopAppPersistence,
	restartPersistence: restartAppPersistence,
	getEvents: getStoreEvents,
	clearEvents: clearStoreEvents,
	onEvents: onStoreEvents,
};
