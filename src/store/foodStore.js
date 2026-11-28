import { defineStore } from "udodi";
import { INITIAL_RECIPES } from "../data/recipesData.js";
import { appStore } from "./appStore.js";

/**
 * ChopLife Central Food Store Module
 * Built with Udodi's defineStore registry and native IndexedDB persistence.
 * Strictly focused on recipes and favorites domain state.
 */
export const foodStore = defineStore("food", {
  state: {
    customRecipes: [],
    favorites: [1, 2],
  },

  actions: {
    addRecipe(ctx, recipeData) {
      const custom = ctx.get("customRecipes") || [];
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
      ctx.set("customRecipes", updated);
      appStore.dispatch("showToast", {
        message: `Oya! "${newRecipe.title}" has been added to the kitchen!`,
        type: "success",
      });
      return newRecipe;
    },

    toggleFavorite(ctx, id) {
      const numericId = Number(id);
      const current = ctx.get("favorites") || [];
      const exists = current.includes(numericId);
      const updated = exists
        ? current.filter((item) => item !== numericId)
        : [...current, numericId];

      ctx.set("favorites", updated);
      appStore.dispatch("showToast", {
        message: exists ? "Removed from your ChopList" : "Added to your ChopList! Sweet belly!",
        type: exists ? "info" : "success",
      });
      return !exists;
    },
  },
});

// Enable native Udodi persistence via IndexedDB for offline-first resilience
export const foodPersistController = foodStore.persist(["favorites", "customRecipes"], {
  dbName: "choplife-store",
  storeName: "food-state",
  debounce: 50,
});

// Reactive derived selectors (use inside computed/effects for automatic dependency tracking)
foodStore.allRecipes = foodStore.select((state) => {
  const custom = state.customRecipes || [];
  return [...INITIAL_RECIPES, ...custom];
});

foodStore.favoriteRecipes = foodStore.select((state) => {
  const favIds = state.favorites || [];
  const custom = state.customRecipes || [];
  const all = [...INITIAL_RECIPES, ...custom];
  return all.filter((r) => favIds.includes(r.id));
});

foodStore.favoritesCount = foodStore.select((state) => {
  const current = state.favorites || [];
  return current.length;
});

/**
 * Non-reactive imperative helper to read all recipes (initial + custom).
 * Prefer `foodStore.allRecipes()` in reactive contexts.
 */
foodStore.getAllRecipes = () => {
  const custom = foodStore.get("customRecipes") || [];
  return [...INITIAL_RECIPES, ...custom];
};

/**
 * Non-reactive imperative helper to find a recipe by numeric ID.
 */
foodStore.getRecipeById = (id) => {
  const numericId = Number(id);
  const all = foodStore.getAllRecipes();
  return all.find((r) => r.id === numericId) || null;
};

/**
 * Non-reactive imperative helper to check if a recipe ID is favorited.
 */
foodStore.isFavorite = (id) => {
  const numericId = Number(id);
  const current = foodStore.get("favorites") || [];
  return current.includes(numericId);
};

/**
 * Non-reactive imperative helper to read the current favorites count.
 * Prefer `foodStore.favoritesCount()` in reactive contexts.
 */
foodStore.getFavoritesCount = () => {
  const current = foodStore.get("favorites") || [];
  return current.length;
};

/**
 * Non-reactive imperative helper to read the favorited recipe objects.
 * Prefer `foodStore.favoriteRecipes()` in reactive contexts.
 */
foodStore.getFavoriteRecipes = () => {
  const favIds = foodStore.get("favorites") || [];
  const all = foodStore.getAllRecipes();
  return all.filter((r) => favIds.includes(r.id));
};

// Thin action dispatch wrappers
foodStore.addRecipe = (data) => foodStore.dispatch("addRecipe", data);
foodStore.toggleFavorite = (id) => foodStore.dispatch("toggleFavorite", id);
