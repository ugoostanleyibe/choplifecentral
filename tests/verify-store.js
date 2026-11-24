import { Window } from "happy-dom";

const window = new Window({ url: "https://localhost:3000/" });
globalThis.window = window;
globalThis.document = window.document;
globalThis.Node = window.Node;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.location = window.location;
globalThis.history = window.history;
globalThis.MutationObserver = window.MutationObserver;

const {
  store,
  batch,
  defineStore,
  useStore,
  destroyStore,
} = await import("../src/store/index.js");

const { appStore } = await import("../src/store/appStore.js");

const nextMicrotask = () => Promise.resolve();

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("=== 1. Testing Core Store Reactivity & Presence ===");
store.clear();

// Unseen key must return undefined, has() is false, keys() does not contain it
assert(store.get("unseen") === undefined, "unseen get must be undefined");
assert(store.has("unseen") === false, "unseen has() must be false");
assert(!store.keys().includes("unseen"), "keys() must not contain unseen");
assert(store.touch("unseen") === false, "touch(unseen) must be false");

// Explicitly set undefined: has() must be true, keys() contains it
store.set("explicitUndefined", undefined);
assert(store.has("explicitUndefined") === true, "has(explicitUndefined) must be true");
assert(store.get("explicitUndefined") === undefined, "get(explicitUndefined) must be undefined");
assert(store.keys().includes("explicitUndefined"), "keys() must include explicitUndefined");
assert(store.touch("explicitUndefined") === true, "touch(explicitUndefined) must be true");

// Set normal values
store.set("count", 10);
assert(store.get("count") === 10, "count should be 10");
store.update("count", (n) => n + 5);
assert(store.get("count") === 15, "count should be 15 after update");

// Deletion
store.delete("count");
assert(store.has("count") === false, "count should not exist after delete");
assert(!store.keys().includes("count"), "keys() should not include count after delete");

console.log("✓ Core get/set/update/touch/delete/has/keys passed");

console.log("=== 2. Testing Synchronous & Asynchronous Actions and Strict Errors ===");
store.clear();
store.set("val", 100);

store.defineAction("addSync", (ctx, amount = 1) => {
  ctx.update("val", (n) => n + amount);
  return ctx.get("val");
});

store.defineAction("addAsync", async (ctx, amount = 1) => {
  await Promise.resolve();
  ctx.update("val", (n) => n + amount);
  return ctx.get("val");
});

const syncRes = store.dispatch("addSync", 20);
assert(syncRes === 120, `Expected syncRes 120, got ${syncRes}`);
assert(!(syncRes instanceof Promise), "Sync action must return direct value, not Promise");

const asyncRes = store.dispatch("addAsync", 30);
assert(asyncRes instanceof Promise, "Async action must return Promise");
const resolvedAsync = await asyncRes;
assert(resolvedAsync === 150, `Expected resolvedAsync 150, got ${resolvedAsync}`);

// Missing action warnings vs strict throw
let warned = false;
const originalWarn = console.warn;
console.warn = () => { warned = true; };
const missingRes = store.dispatch("nonExistentAction");
console.warn = originalWarn;
assert(warned === true, "Missing action without options must warn");
assert(missingRes === undefined, "Missing action without options must return undefined");

let threwStrict = false;
try {
  store.dispatch("nonExistentAction", null, { strict: true });
} catch (err) {
  threwStrict = true;
  assert(err.message.includes("Missing action: nonExistentAction"), "Error message should match");
}
assert(threwStrict === true, "Missing action with { strict: true } must throw");

let threwMissing = false;
try {
  store.dispatch("nonExistentAction", null, { throwOnMissing: true });
} catch (err) {
  threwMissing = true;
}
assert(threwMissing === true, "Missing action with { throwOnMissing: true } must throw");

console.log("✓ Synchronous, asynchronous, and strict missing action tests passed");

console.log("=== 3. Testing Nested Batches and Staging Semantics ===");
store.clear();
store.set("a", 1);
store.set("b", 10);
store.set("temp", "stays");

batch(() => {
  store.update("a", (n) => n + 1); // a = 2
  assert(store.get("a") === 2, "Staged update must be visible within batch");

  batch(() => {
    store.update("a", (n) => n + 3); // a = 5
    store.set("b", 20);
    store.delete("temp");
    assert(store.get("a") === 5, "Nested staged update must be visible");
    assert(store.has("temp") === false, "Staged deletion must reflect has() === false in batch");
    assert(!store.keys().includes("temp"), "keys() in batch must omit staged delete");
  });

  // Back in outer batch
  assert(store.get("a") === 5, "Outer batch sees nested staged value");
  assert(store.get("b") === 20, "Outer batch sees nested staged value for b");
  assert(store.has("temp") === false, "Outer batch sees staged delete");
});

// After outermost batch commit
assert(store.get("a") === 5, "Committed value for a must be 5");
assert(store.get("b") === 20, "Committed value for b must be 20");
assert(store.has("temp") === false, "temp must remain deleted");

console.log("✓ Nested batch staging and commitment passed");

console.log("=== 4. Testing Subscriptions & Deduplication in Batches ===");
store.clear();
store.set("theme", "light");
const seen = [];
const unsub = store.subscribe("theme", (next, prev) => {
  seen.push([next, prev]);
});

batch(() => {
  store.set("theme", "dark");
  store.set("theme", "system");
});
await nextMicrotask();
unsub();

// Initial run saw ["light", undefined], and batch deduplicated intermediate "dark" so final seen is ["system", "light"]
assert(seen.length === 2, `Expected 2 subscription calls, got ${seen.length}`);
assert(seen[0][0] === "light" && seen[0][1] === undefined, "Initial subscription must see initial value");
assert(seen[1][0] === "system" && seen[1][1] === "light", "Batched update must see final value");

console.log("✓ Subscription and batch deduplication passed");

console.log("=== 5. Testing In-Place Mutations & touch() ===");
store.clear();
store.set("profile", { name: "Adanna", skills: ["Egusi", "Jollof"] });

const profileUpdates = [];
const unsubProfile = store.subscribe("profile", (prof) => {
  profileUpdates.push(prof.name);
});

// Mutate nested property in place
store.get("profile").name = "Chef Adanna";
const touchRes = store.touch("profile");
assert(touchRes === true, "touch(profile) should return true");
await nextMicrotask();
unsubProfile();

assert(profileUpdates.length === 2, `Expected 2 profile updates, got ${profileUpdates.length}`);
assert(profileUpdates[1] === "Chef Adanna", "touch() must notify reactive subscribers of in-place mutation");

console.log("✓ In-place mutation with touch() passed");

console.log("=== 6. Testing Selectors (Global & Module-Scoped) ===");
store.clear();
store.set("unitPrice", 2500);
store.set("quantity", 4);

const totalCost = store.select((s) => s.get("unitPrice") * s.get("quantity"));
assert(totalCost() === 10000, `Expected 10000, got ${totalCost()}`);

store.set("quantity", 5);
await nextMicrotask();
assert(totalCost() === 12500, `Expected 12500, got ${totalCost()}`);

console.log("✓ Selectors passed");

console.log("=== 7. Testing defineStore Module Lifecycle & Cleanup ===");
store.clear();
let cleanupRan = false;

const kitchenModule = defineStore("kitchen", {
  state: {
    station: "Puff-Puff Fryer",
    oilTemp: 180,
  },
  actions: {
    heatUp(ctx, degrees = 10) {
      ctx.update("oilTemp", (t) => t + degrees);
      return ctx.get("oilTemp");
    },
  },
  cleanup() {
    cleanupRan = true;
  },
});

assert(useStore("kitchen") === kitchenModule, "useStore('kitchen') must return module instance");
assert(kitchenModule.state.station === "Puff-Puff Fryer", "Module state proxy must read station");

const tempSelector = kitchenModule.select((s) => `Temp: ${s.oilTemp}°C`);
assert(tempSelector() === "Temp: 180°C", "Module selector must derive correctly");

const newTemp = kitchenModule.dispatch("heatUp", 15);
assert(newTemp === 195, `Expected 195, got ${newTemp}`);
await nextMicrotask();
assert(tempSelector() === "Temp: 195°C", "Module selector must update reactively");

// Test destroyStore
destroyStore("kitchen");
assert(cleanupRan === true, "Module definition cleanup() must run on destroy");
assert(useStore("kitchen") === undefined, "useStore('kitchen') must be undefined after destroy");
assert(store.has("kitchen:station") === false, "Global namespaced key must be deleted");

console.log("✓ defineStore module lifecycle and cleanup passed");

console.log("=== 8. Testing store.clear() Hook & Clean Teardown ===");
store.clear();
const counterModule = defineStore("counterTest", {
  state: { num: 42 },
});
assert(useStore("counterTest") !== undefined, "Module should exist before clear");
store.clear();
assert(useStore("counterTest") === undefined, "store.clear() must unregister all modules");
assert(store.has("counterTest:num") === false, "store.clear() must remove namespaced keys");

console.log("✓ store.clear() passed");

console.log("=== 9. Testing appStore Integration & Event Logging ===");
appStore.clearEvents();

appStore.store.dispatch("app:setTheme", "dark");
await nextMicrotask();
assert(appStore.isDarkTheme() === true, "isDarkTheme selector must be true");

appStore.store.dispatch("app:applyPartyPreset", "owambe");
assert(appStore.store.get("servingsMultiplier") === 4, "Party preset must scale servings to 4x");
assert(appStore.store.get("spiceTolerance") === 3, "Party preset must set spice to 3");

const planner = appStore.ensurePlannerStore();
assert(planner !== undefined, "Planner module must be initialized");

const selectors = appStore.getPlannerSelectors();
assert(selectors.expenseTotal() > 0, "Expenses total selector must calculate non-zero");

// Test touch() on prep notes in planner
const initialDone = selectors.completedNotesCount();
planner.dispatch("togglePrepNote", 3);
await nextMicrotask();
const updatedDone = selectors.completedNotesCount();
assert(updatedDone === initialDone + 1, "Toggling prep note must update completed notes selector via touch()");

const events = appStore.getEvents();
assert(events.length > 0, "Events log must record store actions and sets");

console.log("✓ appStore integration passed");

console.log("\n=== ALL UPGRADED STORE UNIT & INTEGRATION TESTS PASSED CLEANLY! ===");
process.exit(0);
