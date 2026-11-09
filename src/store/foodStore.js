import { defineStore } from "udodi";
import { INITIAL_RECIPES } from "../data/recipesData.js";

function triggerToast(ctx, message, type = "info") {
  ctx.set("toast", { message, type, visible: true, timestamp: Date.now() });
}

/**
 * ChopLife Central Food Store Module
 * Built with Udodi's defineStore registry and native IndexedDB persistence.
 */
export const foodStore = defineStore("food", {
  state: {
    customRecipes: [],
    favorites: [1, 2],
    theme: "dark",
    vaultUnlocked: false,
    toast: { message: "", type: "info", visible: false },
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
      triggerToast(ctx, `Oya! "${newRecipe.title}" has been added to the kitchen!`, "success");
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
      triggerToast(
        ctx,
        exists ? "Removed from your ChopList" : "Added to your ChopList! Sweet belly!",
        exists ? "info" : "success"
      );
      return !exists;
    },

    toggleTheme(ctx) {
      const current = ctx.get("theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      ctx.set("theme", next);
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.dataset.theme = next;
      }
      return next;
    },

    unlockVault(ctx, passcode) {
      if ((passcode || "").trim().toUpperCase() === "VIPCHOPPER") {
        ctx.set("vaultUnlocked", true);
        triggerToast(ctx, "Odogwu! VIP Kitchen unlocked successfully!", "success");
        return true;
      }
      triggerToast(ctx, "Invalid secret passcode! Only true foodies enter here.", "error");
      return false;
    },

    showToast(ctx, { message, type = "info" }) {
      triggerToast(ctx, message, type);
    },

    dismissToast(ctx) {
      ctx.set("toast", { message: "", type: "info", visible: false });
    },
  },
});

// Enable native Udodi persistence via IndexedDB for offline-first resilience
foodStore.persist(["favorites", "customRecipes", "theme"], {
  dbName: "choplife-store",
  storeName: "food-state",
  debounce: 50,
});

// Domain getters and convenience action helpers
foodStore.getAllRecipes = () => {
  const custom = foodStore.get("customRecipes") || [];
  return [...INITIAL_RECIPES, ...custom];
};

foodStore.getRecipeById = (id) => {
  const numericId = Number(id);
  const all = foodStore.getAllRecipes();
  return all.find((r) => r.id === numericId) || null;
};

foodStore.isFavorite = (id) => {
  const numericId = Number(id);
  const current = foodStore.get("favorites") || [];
  return current.includes(numericId);
};

foodStore.getFavoritesCount = () => {
  const current = foodStore.get("favorites") || [];
  return current.length;
};

foodStore.getFavoriteRecipes = () => {
  const favIds = foodStore.get("favorites") || [];
  const all = foodStore.getAllRecipes();
  return all.filter((r) => favIds.includes(r.id));
};

foodStore.getTheme = () => {
  return foodStore.get("theme") || "dark";
};

foodStore.isVaultUnlocked = () => {
  return foodStore.get("vaultUnlocked") === true;
};

foodStore.addRecipe = (recipeData) => {
  const custom = foodStore.get("customRecipes") || [];
  const newRecipe = {
    ...recipeData,
    id: Date.now(),
    isCustom: true,
    rating: 5.0,
    reviewsCount: 1,
    image:
      recipeData.image ||
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    tags: recipeData.tags || ["Custom", "ChopLife VIP"],
    createdAt: new Date().toISOString(),
  };

  const updated = [newRecipe, ...custom];
  foodStore.set("customRecipes", updated);
  triggerToast(foodStore, `Oya! "${newRecipe.title}" has been added to the kitchen!`, "success");
  return newRecipe;
};

foodStore.toggleFavorite = (id) => {
  return foodStore.dispatch("toggleFavorite", id);
};

foodStore.toggleTheme = () => {
  return foodStore.dispatch("toggleTheme");
};

foodStore.unlockVault = (passcode) => {
  return foodStore.dispatch("unlockVault", passcode);
};

foodStore.showToast = (message, type = "info") => {
  return foodStore.dispatch("showToast", { message, type });
};

foodStore.dismissToast = () => {
  foodStore.set("toast", { message: "", type: "info", visible: false });
};
