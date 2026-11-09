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

const { foodStore } = await import("../src/store/foodStore.js");
const { createRecipeDetailPage } = await import("../src/pages/RecipeDetailPage.js");
const { render } = await import("udodi");

console.log("=== 1. Testing FoodStore Reactivity & Storage ===");
const initialFavs = foodStore.getFavoriteRecipes().length;
console.log("Initial favorites count:", initialFavs);

foodStore.toggleFavorite(1);
console.log("Is recipe 1 favorite:", foodStore.isFavorite(1));
if (foodStore.isFavorite(1)) throw new Error("Expected recipe 1 to be toggled off (was initially in [1, 2])");

foodStore.toggleFavorite(1);
console.log("After second toggle, is recipe 1 favorite:", foodStore.isFavorite(1));
if (!foodStore.isFavorite(1)) throw new Error("Expected recipe 1 to be toggled on");

console.log("=== 2. Testing Recipe Filtering ===");
const allRecipes = foodStore.getAllRecipes();
const jollofResults = allRecipes.filter(r => r.title.toLowerCase().includes("jollof"));
console.log("Found recipes matching 'jollof':", jollofResults.length);
if (jollofResults.length !== 1) throw new Error("Expected 1 result for jollof query");

const soupResults = allRecipes.filter(r => r.category === "Soups & Swallows");
console.log("Found recipes matching 'Soups & Swallows':", soupResults.length);
if (soupResults.length !== 2) throw new Error("Expected 2 soup recipes");

console.log("=== 3. Testing Adding Custom Recipe to Store ===");
const custom = foodStore.addRecipe({
  title: "Boli & Spicy Grilled Fish",
  category: "Street Food & Grills",
  prepTime: 20,
  cookTime: 35,
  spiceLevel: 3,
  servings: 2,
  emoji: "🍌",
  ingredients: [{ item: "Ripe plantain", amount: "3", unit: "fingers" }],
  instructions: ["Roast plantain over hot coals until golden."],
});
console.log("Created custom recipe with id:", custom.id);
const foundCustom = foodStore.getRecipeById(custom.id);
console.log("Retrieved custom recipe title:", foundCustom ? foundCustom.title : "NO");
if (!foundCustom || foundCustom.title !== "Boli & Spicy Grilled Fish") {
  throw new Error("Failed to find newly added custom recipe");
}

console.log("=== 4. Testing Recipe Detail Interceptors & Servings Scaling ===");
const mockRouter = {
  route: {
    params: { id: 1 },
    data: foodStore.getRecipeById(1),
  },
  push: () => {},
};

const detailRoot = document.createElement("div");
const detailInstance = createRecipeDetailPage(mockRouter);
render(detailInstance, detailRoot);

const servingsDisplay = detailRoot.querySelector(".servings-display");
console.log("Initial active servings:", servingsDisplay ? servingsDisplay.textContent.trim() : "NO");

const firstIng = detailRoot.querySelector(".ingredient-row .ing-amount");
console.log("Initial first ingredient amount:", firstIng ? firstIng.textContent.trim() : "NO");

// Click "+" button to increase servings
const btnPlus = detailRoot.querySelectorAll(".btn-scale")[1];
btnPlus.click();
await new Promise((r) => setTimeout(r, 60));

console.log("After '+' click active servings:", servingsDisplay ? servingsDisplay.textContent.trim() : "NO");
console.log("After '+' click first ingredient amount:", firstIng ? firstIng.textContent.trim() : "NO");

if (servingsDisplay.textContent.trim() !== "7 pers.") {
  throw new Error(`Expected servings to be '7 pers.', got '${servingsDisplay.textContent.trim()}'`);
}

console.log("=== 5. Testing Toast Component Visibility ===");
const { Toast } = await import("../src/components/Toast.js");
const toastRoot = document.createElement("div");
render(Toast(), toastRoot);

const initialToastPill = toastRoot.querySelector(".toast-container");
console.log("Toast pill present when hidden:", !!initialToastPill);
if (initialToastPill) {
  throw new Error("Expected toast-container to not be in DOM when visible is false");
}

console.log("=== 6. Testing Favorite Button Tooltip ===");
const { createRecipeCard } = await import("../src/components/RecipeCard.js");
const cardRoot = document.createElement("div");
const mockCardRouter = { push: () => {} };
// Recipe 1 is initially favorited
const cardInstance = createRecipeCard(foodStore.getRecipeById(1), mockCardRouter);
render(cardInstance, cardRoot);

const favBtn = cardRoot.querySelector(".fav-btn");
console.log("Favorite button tooltip when favorited:", favBtn.getAttribute("title"));
if (favBtn.getAttribute("title") !== "Remove from ChopList") {
  throw new Error(`Expected 'Remove from ChopList', got '${favBtn.getAttribute("title")}'`);
}

// Click to unfavorite
favBtn.click();
await new Promise((r) => setTimeout(r, 60));
console.log("Favorite button tooltip after unfavorite:", favBtn.getAttribute("title"));
if (favBtn.getAttribute("title") !== "Add to ChopList") {
  throw new Error(`Expected 'Add to ChopList', got '${favBtn.getAttribute("title")}'`);
}

// Restore favorite state
favBtn.click();
await new Promise((r) => setTimeout(r, 60));

console.log("=== 7. Testing Category Pill Highlighting & Pluralization ===");
const { createHomePage } = await import("../src/pages/HomePage.js");
const homeRoot = document.createElement("div");
const homePage = createHomePage({ push: () => {} });
render(homePage, homeRoot);

const catPills = Array.from(homeRoot.querySelectorAll(".category-pills button"));
const counterEl = homeRoot.querySelector(".results-counter");

// Initial check: "All" pill is active, count says "Showing X dishes"
const totalCount = foodStore.getAllRecipes().length;
if (!catPills[0].classList.contains("active")) {
  throw new Error("Expected 'All' category pill to have 'active' class initially");
}
if (counterEl.textContent.trim().replace(/\s+/g, " ") !== `Showing ${totalCount} dishes`) {
  throw new Error(`Expected 'Showing ${totalCount} dishes', got '${counterEl.textContent.trim().replace(/\s+/g, " ")}'`);
}

// Click "Jollof & Rice" pill (Pill 1)
catPills[1].click();
await new Promise((r) => setTimeout(r, 60));

if (!catPills[1].classList.contains("active")) {
  throw new Error("Expected 'Jollof & Rice' category pill to be active after click");
}
if (catPills[0].classList.contains("active")) {
  throw new Error("Expected 'All' category pill to no longer be active");
}
if (counterEl.textContent.trim().replace(/\s+/g, " ") !== "Showing 1 dish") {
  throw new Error(`Expected 'Showing 1 dish', got '${counterEl.textContent.trim().replace(/\s+/g, " ")}'`);
}

// Click "Soups & Swallows" pill (Pill 2)
catPills[2].click();
await new Promise((r) => setTimeout(r, 60));

if (!catPills[2].classList.contains("active")) {
  throw new Error("Expected 'Soups & Swallows' category pill to be active after click");
}
if (catPills[1].classList.contains("active")) {
  throw new Error("Expected 'Jollof & Rice' category pill to no longer be active");
}
if (counterEl.textContent.trim().replace(/\s+/g, " ") !== "Showing 2 dishes") {
  throw new Error(`Expected 'Showing 2 dishes', got '${counterEl.textContent.trim().replace(/\s+/g, " ")}'`);
}

console.log("✓ Category pills highlight correctly when clicked");
console.log("✓ Pluralization correctly handles singular '1 dish' and plural 'X dishes'");

console.log("\n=== ALL UNIT & STORE TESTS PASSED CLEANLY! ===");
process.exit(0);
