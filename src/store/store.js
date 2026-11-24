import {
	computed,
	effect,
	reactive,
	touch as touchReactive,
} from "udodi";

import { persistStore } from "./persist.js";

/**
 * Context passed to every store action.
 *
 * @typedef {Object} ActionContext
 * @property {Object} state Reactive state proxy.
 * @property {Function} get Read a state value.
 * @property {Function} set Set a state value.
 * @property {Function} update Update a state value.
 * @property {Function} touch Notify subscribers after mutating a value in place.
 * @property {Function} select Create a computed selector.
 */

/**
 * @typedef {Object} StoreEntry
 * @property {{ value: any }} state Reactive holder for subscriber tracking.
 * @property {any} value Current raw store value used for non-tracking reads.
 * @property {boolean} present Whether the key currently exists in the store.
 */

/** @type {Map<string, StoreEntry>} */
const state = new Map();

/** @type {Map<string, Function>} */
const actions = new Map();

/** @type {Map<string, Set<Object>>} */
const persistence = new Map();

/** @type {Set<Function>} */
const clearListeners = new Set();

/**
 * Register an internal listener invoked when `store.clear()` runs.
 *
 * @param {Function} listener
 * @returns {Function} Unregister function.
 */
export function onStoreClear(listener) {
	clearListeners.add(listener);

	return () => {
		clearListeners.delete(listener);
	};
}

/**
 * Emit devtools events dynamically so late-attached devtools receive events.
 *
 * @param {string} event
 * @param {any} [payload]
 */
function emit(event, payload) {
	globalThis.__STORE_DEVTOOLS__?.emit?.(event, payload);
}

/**
 * Handles dispatch attempts for actions that have not been registered.
 *
 * @param {string} name
 * @param {{ throwOnMissing?: boolean, strict?: boolean }=} options
 * @returns {undefined}
 */
function missingAction(name, options) {
	const message = `[store] Missing action: ${name}`;

	emit("action:missing", {
		name,
	});

	if (options?.throwOnMissing || options?.strict) {
		throw new Error(message);
	}

	globalThis.console?.warn?.(message);

	return undefined;
}

/**
 * Check whether a value is a thenable / Promise-like object.
 *
 * @param {any} value
 * @returns {boolean}
 */
function isThenable(value) {
	return (
		value !== null &&
		(typeof value === "object" || typeof value === "function") &&
		typeof value.then === "function"
	);
}

// Batching
let batchDepth = 0;

/** @type {Map<string, any>} */
const pendingValues = new Map();

/** @type {Set<string>} */
const pendingDeletes = new Set();

/** @type {Set<string>} */
const pendingTouches = new Set();

/**
 * Creates a reactive holder for a store value.
 *
 * @param {any} value
 * @param {boolean} [present=false]
 * @returns {StoreEntry}
 */
function createEntry(value, present = false) {
	const holder = reactive({ value });

	return {
		state: holder,
		value: holder.value,
		present,
	};
}

/**
 * Create a proxy that maps property access to the global store.
 * Used as the `state` field of {@link ActionContext} for global actions.
 *
 * @returns {Object}
 */
function createGlobalStateProxy() {
	return new Proxy(
		{},
		{
			get(_, key) {
				if (typeof key === "symbol") {
					return undefined;
				}

				return store.get(key);
			},

			set(_, key, value) {
				if (typeof key === "symbol") {
					return true;
				}

				store.set(key, value);

				return true;
			},

			deleteProperty(_, key) {
				if (typeof key === "symbol") {
					return true;
				}

				store.delete(key);

				return true;
			},

			has(_, key) {
				return typeof key === "string" && store.has(key);
			},

			ownKeys() {
				return store.keys();
			},

			getOwnPropertyDescriptor(_, key) {
				if (typeof key === "string" && store.has(key)) {
					return {
						enumerable: true,
						configurable: true,
						writable: true,
						value: store.get(key),
					};
				}

				return undefined;
			},
		},
	);
}

/**
 * Reads the currently staged or committed value for a key without tracking.
 *
 * @param {string} key
 * @returns {any}
 */
function peek(key) {
	if (pendingDeletes.has(key)) {
		return undefined;
	}

	if (pendingValues.has(key)) {
		return pendingValues.get(key);
	}

	const entry = state.get(key);

	return entry?.present ? entry.value : undefined;
}

/**
 * Commits a value to the reactive holder.
 *
 * @param {string} key
 * @param {any} value
 * @param {boolean} [present=true]
 * @returns {StoreEntry}
 */
function commit(key, value, present = true) {
	let entry = state.get(key);

	if (!entry) {
		entry = createEntry(value, present);
		state.set(key, entry);

		return entry;
	}

	entry.present = present;
	entry.state.value = value;
	entry.value = entry.state.value;

	return entry;
}

/**
 * Commits all staged batch changes.
 */
function flushBatch() {
	const values = Array.from(pendingValues.entries());
	const deletes = new Set(pendingDeletes);
	const touches = new Set(pendingTouches);

	pendingValues.clear();
	pendingDeletes.clear();
	pendingTouches.clear();

	for (const key of deletes) {
		stopPersistence(key);

		if (state.has(key)) {
			commit(key, undefined, false);
			state.delete(key);
		}
	}

	for (const [key, value] of values) {
		commit(key, value, true);
	}

	for (const key of touches) {
		const entry = state.get(key);

		if (entry && entry.present) {
			touchReactive(entry.state, "value");
		}
	}
}

/**
 * Batch updates within a single transaction.
 *
 * @param {Function} fn
 * @returns {any}
 */
export function batch(fn) {
	batchDepth++;

	try {
		return fn();
	} finally {
		batchDepth--;

		if (batchDepth === 0) {
			flushBatch();
		}
	}
}

/**
 * Register a persistence controller for a state key.
 *
 * @param {string} key
 * @param {Object} controller
 */
function registerPersistence(key, controller) {
	let controllers = persistence.get(key);

	if (!controllers) {
		controllers = new Set();
		persistence.set(key, controllers);
	}

	controllers.add(controller);
}

/**
 * Stop persistence controllers associated with a key.
 *
 * @param {string} key
 */
function stopPersistence(key) {
	const controllers = persistence.get(key);

	if (!controllers) {
		return;
	}

	for (const controller of controllers) {
		controller.stop();
	}

	persistence.delete(key);
}

// Store Core
export const store = {
	/**
	 * Get value.
	 *
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		let entry = state.get(key);

		if (!entry) {
			entry = createEntry(undefined, false);
			state.set(key, entry);
		}

		// Always read through the reactive holder so active computations track this key.
		const committed = entry.state.value;

		if (pendingDeletes.has(key)) {
			return undefined;
		}

		if (pendingValues.has(key)) {
			return pendingValues.get(key);
		}

		return committed;
	},

	/**
	 * Set value.
	 *
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
		const wasPresent = this.has(key);
		const prev = peek(key);

		if (wasPresent && Object.is(prev, value)) {
			return;
		}

		if (batchDepth > 0) {
			pendingValues.set(key, value);
			pendingDeletes.delete(key);
			pendingTouches.delete(key);
		} else {
			commit(key, value, true);
		}

		emit("set", {
			key,
			prev,
			value,
		});
	},

	/**
	 * Update value from its previous value.
	 *
	 * @param {string} key
	 * @param {Function} fn
	 */
	update(key, fn) {
		this.set(key, fn(peek(key)));
	},

	/**
	 * Notify subscribers after mutating a stored object in place.
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	touch(key) {
		if (!this.has(key)) {
			return false;
		}

		if (batchDepth > 0) {
			pendingTouches.add(key);

			emit("touch", { key });

			return true;
		}

		const entry = state.get(key);

		if (!entry || !entry.present) {
			return false;
		}

		const notified = touchReactive(entry.state, "value");

		if (notified) {
			emit("touch", { key });
		}

		return notified;
	},

	/**
	 * Persist one or more store keys into IndexedDB.
	 *
	 * @param {string|string[]} keys
	 * @param {import("./persist.js").PersistOptions} [options]
	 * @returns {import("./persist.js").PersistController}
	 */
	persist(keys, options) {
		const controller = persistStore(
			this,
			keys,
			options,
		);

		for (const key of controller.keys) {
			registerPersistence(key, controller);
		}

		return controller;
	},

	/**
	 * Create a namespaced store helper.
	 *
	 * @param {string} ns
	 * @returns {object}
	 */
	createNamespace(ns) {
		const prefix = `${ns}:`;
		const k = (key) => `${prefix}${key}`;

		const api = {
			get: (key) => store.get(k(key)),

			set: (key, value) => store.set(k(key), value),

			update: (key, fn) => store.update(k(key), fn),

			touch: (key) => store.touch(k(key)),

			subscribe: (key, callback) => store.subscribe(k(key), callback),

			dispatch: (action, payload, options) =>
				store.dispatch(
					`${prefix}${action}`,
					payload,
					options,
				),

			select: (selector, scope) =>
				computed(
					() => selector(api),
					scope,
				),

			persist(keys, options = {}) {
				const targetApi =
					this &&
					typeof this.get === "function" &&
					typeof this.set === "function" &&
					typeof this.subscribe === "function"
						? this
						: api;

				const localKeys = Array.isArray(keys)
					? keys
					: [keys];

				const controller = persistStore(
					targetApi,
					localKeys,
					{
						...options,
						_prefix: ns,
					},
				);

				for (const key of controller.keys) {
					registerPersistence(
						k(key),
						controller,
					);
				}

				return controller;
			},

			delete: (key) => store.delete(k(key)),

			has: (key) => store.has(k(key)),

			keys: () =>
				store
					.keys()
					.filter((key) => key.startsWith(prefix))
					.map((key) => key.slice(prefix.length)),

			hasAction: (action) => store.hasAction(`${prefix}${action}`),
		};

		return api;
	},

	/**
	 * Register an action handler.
	 *
	 * @param {string} name
	 * @param {(ctx: ActionContext, payload: any) => any} fn
	 */
	defineAction(name, fn) {
		actions.set(
			name,

			(payload) => {
				emit("action:start", {
					name,
				});

				const ctx = {
					state: createGlobalStateProxy(),
					get: (key) => store.get(key),
					set: (key, value) => store.set(key, value),
					update: (key, updater) =>
						store.update(key, updater),
					touch: (key) => store.touch(key),
					select: (selector, scope) =>
						store.select(selector, scope),
				};

				try {
					const result = fn(ctx, payload);

					if (isThenable(result)) {
						return Promise.resolve(result).then(
							(resolved) => {
								emit("action:end", {
									name,
								});

								return resolved;
							},
							(err) => {
								emit("action:error", {
									name,
									err,
								});

								throw err;
							},
						);
					}

					emit("action:end", {
						name,
					});

					return result;
				} catch (err) {
					emit("action:error", {
						name,
						err,
					});

					throw err;
				}
			},
		);
	},

	/**
	 * Dispatch an action by name.
	 *
	 * @param {string} name
	 * @param {any} [payload]
	 * @param {{ throwOnMissing?: boolean, strict?: boolean }=} [options]
	 * @returns {any}
	 */
	dispatch(name, payload, options) {
		const action = actions.get(name);

		if (!action) {
			return missingAction(name, options);
		}

		return action(payload);
	},

	/**
	 * Create a lazily computed store selector.
	 *
	 * @param {Function} selector
	 * @param {{ effects: Function[] }=} [scope]
	 * @returns {Function}
	 */
	select(selector, scope) {
		return computed(() => selector(store), scope);
	},

	/**
	 * Subscribe to a store key.
	 *
	 * @param {string} key
	 * @param {Function} cb
	 * @returns {Function}
	 */
	subscribe(key, cb) {
		let prev;
		let initialized = false;

		return effect(() => {
			const next = this.get(key);

			if (!initialized) {
				initialized = true;

				if (next !== undefined) {
					cb(next, prev);
				}

				prev = next;

				return;
			}

			cb(next, prev);
			prev = next;
		});
	},

	/**
	 * Get all present state keys.
	 *
	 * @returns {string[]}
	 */
	keys() {
		const keys = new Set();

		for (const [key, entry] of state.entries()) {
			if (entry.present) {
				keys.add(key);
			}
		}

		for (const key of pendingValues.keys()) {
			if (pendingDeletes.has(key)) {
				keys.delete(key);
			} else {
				keys.add(key);
			}
		}

		for (const key of pendingDeletes) {
			keys.delete(key);
		}

		return Array.from(keys);
	},

	/**
	 * Remove state key.
	 *
	 * @param {string} key
	 */
	delete(key) {
		if (!this.has(key)) {
			return;
		}

		if (batchDepth > 0) {
			pendingValues.delete(key);
			pendingTouches.delete(key);
			pendingDeletes.add(key);
		} else {
			stopPersistence(key);

			if (state.has(key)) {
				commit(key, undefined, false);
				state.delete(key);
			}
		}

		emit("delete", { key });
	},

	/**
	 * Remove action.
	 *
	 * @param {string} name
	 */
	deleteAction(name) {
		actions.delete(name);

		emit("action:delete", {
			name,
		});
	},

	/**
	 * Check state existence.
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	has(key) {
		if (pendingDeletes.has(key)) {
			return false;
		}

		if (pendingValues.has(key)) {
			return true;
		}

		return Boolean(state.get(key)?.present);
	},

	/**
	 * Check action existence.
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	hasAction(name) {
		return actions.has(name);
	},

	/**
	 * Clear all state and actions.
	 */
	clear() {
		for (const key of Array.from(persistence.keys())) {
			stopPersistence(key);
		}

		for (const key of Array.from(state.keys())) {
			commit(key, undefined, false);
		}

		state.clear();
		actions.clear();
		pendingValues.clear();
		pendingDeletes.clear();
		pendingTouches.clear();
		persistence.clear();

		for (const listener of Array.from(clearListeners)) {
			try {
				listener();
			} catch {}
		}

		emit("clear");
	},
};
