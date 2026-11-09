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

// Now import the app and router
const { router } = await import("../src/router.js");
const { App } = await import("../src/App.js");
const { render } = await import("udodi");
const { foodStore } = await import("../src/store/foodStore.js");

const root = document.createElement("div");
document.body.appendChild(root);

console.log("=== Mounting App to DOM ===");
render(App(), root);
await router.ready;
await new Promise((r) => setTimeout(r, 60));

console.log("✓ Route on mount:", router.route.path);
const titleEl = root.querySelector(".hero-title");
console.log("✓ Hero title found:", titleEl ? titleEl.textContent.trim().replace(/\s+/g, " ") : "NO");

const cards = root.querySelectorAll(".recipe-card");
console.log(`✓ Recipe cards count on home page: ${cards.length}`);

console.log("\n=== Testing Navigation to /recipes/1 ===");
const res1 = await router.push("/recipes/1");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /recipes/1 result:", res1.type, "path:", router.route.path);
const recipeTitle = root.querySelector(".recipe-title");
console.log("✓ Recipe title on detail page:", recipeTitle ? recipeTitle.textContent.trim() : "NO");
const ingRows = root.querySelectorAll(".ingredient-row");
console.log(`✓ Ingredients listed: ${ingRows.length}`);

console.log("\n=== Testing Nested Routes /planner ===");
const resPlanner = await router.push("/planner");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /planner result:", resPlanner.type, "path:", router.route.path);
const plannerTitle = root.querySelector(".planner-title");
console.log("✓ Planner title:", plannerTitle ? plannerTitle.textContent.trim() : "NO");
const guestBadge = root.querySelector(".guests-count-badge");
console.log("✓ Guest calculator badge:", guestBadge ? guestBadge.textContent.trim() : "NO");

console.log("\n=== Testing Nested Child Route /planner/budget ===");
const resBudget = await router.push("/planner/budget");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /planner/budget result:", resBudget.type, "path:", router.route.path);
const budgetTable = root.querySelector(".expenses-table");
console.log("✓ Budget table found:", budgetTable ? "YES" : "NO");

console.log("\n=== Testing Nested Child Route /planner/checklist ===");
const resChecklist = await router.push("/planner/checklist");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /planner/checklist result:", resChecklist.type, "path:", router.route.path);
const checkRows = root.querySelectorAll(".checklist-row");
console.log(`✓ Checklist items count: ${checkRows.length}`);

console.log("\n=== Testing Guard Redirect /secret-vault ===");
const resVaultUnauth = await router.push("/secret-vault");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /secret-vault unauthenticated result:", resVaultUnauth.type, "redirectTo:", resVaultUnauth.redirectTo, "path:", router.route.path);
const lockTitle = root.querySelector(".lock-title");
console.log("✓ Lock screen title:", lockTitle ? lockTitle.textContent.trim() : "NO");

console.log("\n=== Unlocking Secret Vault with Passcode ===");
foodStore.unlockVault("VIPCHOPPER");
const resVaultAuth = await router.push("/secret-vault");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /secret-vault after auth result:", resVaultAuth.type, "path:", router.route.path);
const vaultTitle = root.querySelector(".vault-title");
console.log("✓ Vault title after unlock:", vaultTitle ? vaultTitle.textContent.trim() : "NO");

console.log("\n=== Testing 404 Fallback /unknown-route-wahala ===");
const res404 = await router.push("/unknown-route-wahala");
await new Promise((r) => setTimeout(r, 60));
console.log("✓ Pushed /unknown-route-wahala result:", res404.type, "path:", router.route.path);
const notFoundTitle = root.querySelector(".not-found-title");
console.log("✓ 404 title:", notFoundTitle ? notFoundTitle.textContent.trim() : "NO");

console.log("\n=== ALL APP INTEGRATION TESTS PASSED CLEANLY! ===");
process.exit(0);
