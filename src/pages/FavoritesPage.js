import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";
import { createRecipeCard } from "../components/RecipeCard.js";

export function createFavoritesPage(router) {
  return createComponent({
    name: "FavoritesPage",

    methods: {
      getSavedRecipes() {
        return foodStore.getFavoriteRecipes();
      },

      getCount() {
        return foodStore.getFavoritesCount();
      },

      hasFavorites() {
        return this.getCount() > 0;
      },

      isEmpty() {
        return this.getCount() === 0;
      },

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
        padding: 2.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .fav-title {
        font-size: clamp(1.8rem, 3.5vw, 2.4rem);
        font-weight: 900;
        margin: 0 0 0.5rem;
        color: var(--text-heading, #f8fafc);
      }

      .fav-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted, #94a3b8);
        margin: 0;
      }

      .btn-copy-list {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0f172a;
        font-weight: 800;
        border: none;
        padding: 0.8rem 1.6rem;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
        transition: transform 0.2s;
      }

      .btn-copy-list:hover {
        transform: translateY(-2px);
      }

      .fav-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.75rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--card-bg, #1e293b);
        border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
        border-radius: 24px;
      }

      .empty-emoji {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .empty-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-heading, #f8fafc);
        margin: 0 0 0.5rem;
      }

      .empty-desc {
        color: var(--text-muted, #94a3b8);
        font-size: 0.95rem;
        max-width: 440px;
        margin: 0 auto 1.5rem;
        line-height: 1.5;
      }

      .btn-find-food {
        background: #10b981;
        color: white;
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
                ${favorites.map((r) => createRecipeCard(r, router)).join("\n")}
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
  })();
}
