import { store } from "udodi";
import { INITIAL_RECIPES } from "../data/recipesData.js";

// Initialize store keys if not already set
const storedCustom = (() => {
  try {
    const raw = localStorage.getItem("choplife_custom_recipes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
})();

const storedFavorites = (() => {
  try {
    const raw = localStorage.getItem("choplife_favorites");
    return raw ? JSON.parse(raw) : [1, 2];
  } catch {
    return [1, 2];
  }
})();

const storedTheme = (() => {
  try {
    return localStorage.getItem("choplife_theme") || "dark";
  } catch {
    return "dark";
  }
})();

store.set("theme", storedTheme);
store.set("favorites", storedFavorites);
store.set("customRecipes", storedCustom);
store.set("vaultUnlocked", false);
store.set("toast", { message: "", type: "info", visible: false });

export const foodStore = {
  // Get all recipes combining initial and user created
  getAllRecipes() {
    const custom = store.get("customRecipes") || [];
    return [...INITIAL_RECIPES, ...custom];
  },

  getRecipeById(id) {
    const numericId = Number(id);
    const all = this.getAllRecipes();
    return all.find((r) => r.id === numericId) || null;
  },

  addRecipe(recipeData) {
    const custom = store.get("customRecipes") || [];
    const newId = 100 + custom.length + 1;
    const newRecipe = {
      ...recipeData,
      id: newId,
      rating: 5.0,
      reviewCount: 1,
      emoji: recipeData.emoji || "🍲",
      heroImage: recipeData.heroImage || "/images/jollof.jpg",
      tags: recipeData.tags || ["Community Recipe", "New"],
    };

    const updated = [newRecipe, ...custom];
    store.set("customRecipes", updated);
    try {
      localStorage.setItem("choplife_custom_recipes", JSON.stringify(updated));
    } catch {}

    this.showToast(`Oya! "${newRecipe.title}" has been added to the kitchen!`, "success");
    return newRecipe;
  },

  toggleFavorite(id) {
    const numericId = Number(id);
    const current = store.get("favorites") || [];
    let updated;
    const exists = current.includes(numericId);

    if (exists) {
      updated = current.filter((item) => item !== numericId);
      this.showToast("Removed from your ChopList", "info");
    } else {
      updated = [...current, numericId];
      this.showToast("Added to your ChopList! Sweet belly!", "success");
    }

    store.set("favorites", updated);
    try {
      localStorage.setItem("choplife_favorites", JSON.stringify(updated));
    } catch {}
  },

  isFavorite(id) {
    const numericId = Number(id);
    const current = store.get("favorites") || [];
    return current.includes(numericId);
  },

  getFavoritesCount() {
    const current = store.get("favorites") || [];
    return current.length;
  },

  getFavoriteRecipes() {
    const favIds = store.get("favorites") || [];
    const all = this.getAllRecipes();
    return all.filter((r) => favIds.includes(r.id));
  },

  getTheme() {
    return store.get("theme") || "dark";
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === "dark" ? "light" : "dark";
    store.set("theme", next);
    try {
      localStorage.setItem("choplife_theme", next);
    } catch {}
    document.documentElement.dataset.theme = next;
    return next;
  },

  unlockVault(passcode) {
    if (passcode.trim().toUpperCase() === "VIPCHOPPER") {
      store.set("vaultUnlocked", true);
      this.showToast("Odogwu! VIP Kitchen unlocked successfully!", "success");
      return true;
    }
    this.showToast("Invalid secret passcode! Only true foodies enter here.", "error");
    return false;
  },

  isVaultUnlocked() {
    return store.get("vaultUnlocked") === true;
  },

  showToast(message, type = "info") {
    store.set("toast", { message, type, visible: true });
    setTimeout(() => {
      const current = store.get("toast");
      if (current && current.message === message) {
        store.set("toast", { message: "", type: "info", visible: false });
      }
    }, 3500);
  },

  dismissToast() {
    store.set("toast", { message: "", type: "info", visible: false });
  }
};
