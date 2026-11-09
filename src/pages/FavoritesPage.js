import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { router } from "../router.js";

/**
 * FavoritesPage Component (ChopList)
 */
export const FavoritesPage = createComponent({
  name: "FavoritesPage",

  computed: {
    savedRecipes() {
      return foodStore.getFavoriteRecipes();
    },

    count(ctx) {
      return ctx.savedRecipes.length;
    },

    hasFavorites(ctx) {
      return ctx.count > 0;
    },

    isEmpty(ctx) {
      return ctx.count === 0;
    },
  },

  methods: {
    goToDiscover() {
      router.push("/");
    },

    copyGroceryList() {
      const favs = foodStore.getFavoriteRecipes();
      if (favs.length === 0) return;

      let listText = "🍲 CHOPLIFE GROCERY SHOPPING LIST 🍲\n\n";
      favs.forEach((r) => {
        listText += `=== ${r.title} ===\n`;
        (r.ingredients || []).forEach((ing) => {
          listText += `• ${ing.item} (${ing.amount ? ing.amount + " " : ""}${ing.unit})\n`;
        });
        listText += "\n";
      });

      try {
        navigator.clipboard.writeText(listText);
        foodStore.showToast("📋 All ingredients copied to your clipboard! Ready for the market!", "success");
      } catch {
        foodStore.showToast("Ingredients compiled!", "info");
      }
    },
  },

  style: css`
    :scope {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .fav-header-card {
      background: radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.15), transparent 40%),
                  var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 24px;
      padding: 2.25rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
    }

    .fav-title {
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      font-weight: 900;
      margin: 0 0 0.5rem;
      color: var(--text-heading, #f8fafc);
    }

    .fav-subtitle {
      font-size: 0.95rem;
      color: var(--text-muted, #94a3b8);
      max-width: 580px;
      margin: 0;
      line-height: 1.5;
    }

    .btn-copy-list {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.85rem 1.6rem;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }

    .btn-copy-list:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -4px rgba(16, 185, 129, 0.5);
    }

    .fav-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      background: var(--card-bg, #1e293b);
      border-radius: 24px;
      border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
    }

    .empty-emoji {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-title {
      font-size: 1.4rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      color: var(--text-heading, #f8fafc);
    }

    .empty-desc {
      font-size: 0.95rem;
      color: var(--text-muted, #94a3b8);
      max-width: 440px;
      margin: 0 auto 1.75rem;
      line-height: 1.5;
    }

    .btn-find-food {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 0.75rem 1.6rem;
      border-radius: 999px;
      font-weight: 800;
      cursor: pointer;
    }
  `,

  template: () => {
    const favorites = foodStore.getFavoriteRecipes();

    return html`
      <div class="favorites-page-root">
        <header class="fav-header-card">
          <div>
            <h1 class="fav-title">❤️ My ChopList</h1>
            <p class="fav-subtitle">
              Your personal stash of saved Nigerian dishes. All ingredients can be exported to your shopping list with one tap.
            </p>
          </div>

          <div>
            <button type="button" class="btn-copy-list" @on="click=copyGroceryList">
              📋 Export Market Shopping List
            </button>
          </div>
        </header>

        <div>
          ${favorites.length > 0 ? html`
            <div class="fav-grid">
              ${favorites.map((r) => RecipeCard({ recipe: r })).join("\n")}
            </div>
          ` : html`
            <div class="empty-state">
              <div class="empty-emoji">🍲💨</div>
              <h3 class="empty-title">Your ChopList is completely empty!</h3>
              <p class="empty-desc">
                You never save any dish yet! Go back to discovery make you tap the heart icon on your favorite dishes.
              </p>
              <button type="button" class="btn-find-food" @on="click=goToDiscover">
                Discover Delicious Dishes ➔
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  },
});

/**
 * Backward compatibility helper
 */
export function createFavoritesPage() {
  return FavoritesPage();
}
