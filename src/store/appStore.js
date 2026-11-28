import { defineStore } from "udodi";

function setToast(ctx, message, type = "info") {
  ctx.set("toast", { message, type, visible: true, timestamp: Date.now() });
}

/**
 * ChopLife Central App & UI Settings Store Module
 * Manages theme, VIP vault unlock state, and global toast notifications.
 */
export const appStore = defineStore("app", {
  state: {
    theme: "dark",
    vaultUnlocked: false,
    toast: { message: "", type: "info", visible: false },
  },

  actions: {
    toggleTheme(ctx) {
      const current = ctx.get("theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      ctx.set("theme", next);
      return next;
    },

    setTheme(ctx, theme) {
      const next = theme === "light" ? "light" : "dark";
      ctx.set("theme", next);
      return next;
    },

    unlockVault(ctx, passcode) {
      if ((passcode || "").trim().toUpperCase() === "VIPCHOPPER") {
        ctx.set("vaultUnlocked", true);
        setToast(ctx, "Odogwu! VIP Kitchen unlocked successfully!", "success");
        return true;
      }
      setToast(ctx, "Invalid secret passcode! Only true foodies enter here.", "error");
      return false;
    },

    showToast(ctx, payload) {
      const { message = "", type = "info" } =
        typeof payload === "string" ? { message: payload } : payload || {};
      setToast(ctx, message, type);
    },

    dismissToast(ctx) {
      ctx.set("toast", { message: "", type: "info", visible: false });
    },
  },
});

// Sync theme attribute to DOM reactively (guarded for non-DOM test environments)
appStore.subscribe("theme", (theme) => {
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.dataset.theme = theme || "dark";
  }
});

// Persist theme preference in IndexedDB
export const appPersistController = appStore.persist(["theme"], {
  dbName: "choplife-store",
  storeName: "app-state",
  debounce: 50,
});

// Reactive derived selector
appStore.isDarkTheme = appStore.select((state) => (state.theme || "dark") === "dark");

/**
 * Non-reactive imperative getter for the current theme.
 * Prefer `appStore.isDarkTheme()` or `appStore.subscribe("theme", ...)` in reactive contexts.
 */
appStore.getTheme = () => appStore.get("theme") || "dark";

/**
 * Non-reactive imperative getter for VIP vault unlock state.
 */
appStore.isVaultUnlocked = () => appStore.get("vaultUnlocked") === true;

// Thin action dispatch wrappers
appStore.toggleTheme = () => appStore.dispatch("toggleTheme");
appStore.setTheme = (theme) => appStore.dispatch("setTheme", theme);
appStore.unlockVault = (passcode) => appStore.dispatch("unlockVault", passcode);
appStore.showToast = (message, type = "info") => appStore.dispatch("showToast", { message, type });
appStore.dismissToast = () => appStore.dispatch("dismissToast");
