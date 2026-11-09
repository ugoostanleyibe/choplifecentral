import { createRouter, createWebHistory } from "udodi-router";
import { foodStore } from "./store/foodStore.js";
import { createHomePage } from "./pages/HomePage.js";
import { createRecipeDetailPage } from "./pages/RecipeDetailPage.js";
import { createRecipeCreatePage } from "./pages/RecipeCreatePage.js";
import { createFavoritesPage } from "./pages/FavoritesPage.js";
import { createPlannerLayout } from "./pages/planner/PlannerLayout.js";
import { GuestCalculatorView } from "./pages/planner/GuestCalculatorView.js";
import { BudgetTrackerView } from "./pages/planner/BudgetTrackerView.js";
import { ChecklistView } from "./pages/planner/ChecklistView.js";
import { createSecretVaultPage } from "./pages/SecretVaultPage.js";
import { createSecretUnlockPage } from "./pages/SecretUnlockPage.js";
import { createNotFoundPage } from "./pages/NotFoundPage.js";

// Export router instance
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => createHomePage(router),
      meta: {
        title: "ChopLife Central — Discover Authentic Nigerian Cuisine",
        description: "Explore traditional Nigerian recipes, firewood Jollof secrets, and Owambe event party planning.",
      },
    },
    {
      path: "/recipes/:id(\\d+)",
      component: () => createRecipeDetailPage(router),
      loader: async ({ params }) => {
        const recipe = foodStore.getRecipeById(params.id);
        if (!recipe) {
          throw new Error(`Recipe with ID "${params.id}" not found.`);
        }
        return recipe;
      },
      meta: ({ data }) => ({
        title: data ? `${data.emoji} ${data.title} — ChopLife Recipe` : "Recipe Details — ChopLife Central",
        description: data ? data.description : "Step-by-step cooking instructions and portion scaler.",
      }),
    },
    {
      path: "/create",
      component: () => createRecipeCreatePage(router),
      meta: {
        title: "Add Signature Dish — ChopLife Kitchen Studio",
        description: "Register your family secret recipe using Udodi's live validation form engine.",
      },
    },
    {
      path: "/favorites",
      component: () => createFavoritesPage(router),
      meta: {
        title: "My ChopList — Saved Nigerian Favorites",
        description: "Your saved dishes with one-click grocery shopping list export.",
      },
    },
    {
      path: "/planner",
      component: () => createPlannerLayout(router, "calculator"),
      meta: {
        title: "Guest Chow Calculator — Owambe Party Hub",
        description: "Calculate bags of rice, meat kilos, and drinks for your Owambe party.",
      },
    },
    {
      path: "/planner/budget",
      component: () => createPlannerLayout(router, "budget"),
      meta: {
        title: "Party Budget & Vendor Tracker — Owambe Hub",
        description: "Track event food expenses, vendor deposits, and party budget balance.",
      },
    },
    {
      path: "/planner/checklist",
      component: () => createPlannerLayout(router, "checklist"),
      meta: {
        title: "Kitchen Prep Checklist — Owambe Hub",
        description: "Interactive party prep timeline and cooking task checklist.",
      },
    },
    {
      path: "/secret-vault",
      component: () => createSecretVaultPage(router),
      beforeEnter: ({ context }) => {
        if (!foodStore.isVaultUnlocked()) {
          return {
            path: "/secret-vault/unlock",
            query: { redirect: "/secret-vault" },
          };
        }
        return true;
      },
      meta: {
        title: "Grand Chef's Vault 🔒 — ChopLife VIP Secrets",
      },
    },
    {
      path: "/secret-vault/unlock",
      component: () => createSecretUnlockPage(router),
      meta: {
        title: "Unlock VIP Kitchen — ChopLife Passcode",
      },
    },
    {
      path: "*",
      component: () => createNotFoundPage(router),
      meta: {
        title: "404 — Dish Not Found | ChopLife Central",
      },
    },
  ],
});
