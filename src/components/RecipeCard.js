import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";

export function createRecipeCard(recipe, router) {
  return createComponent({
    name: "RecipeCard",

    state() {
      return {
        recipeId: recipe.id,
        isFav: foodStore.isFavorite(recipe.id),
      };
    },

    methods: {
      toggleFav(event) {
        event.stopPropagation();
        foodStore.toggleFavorite(this.recipeId);
        this.isFav = foodStore.isFavorite(this.recipeId);
      },

      viewDetails() {
        router.push(`/recipes/${this.recipeId}`);
      },

      favClass() {
        return this.isFav ? "fav-btn active" : "fav-btn";
      },

      favIcon() {
        return this.isFav ? "❤️" : "🤍";
      },

      favTooltip() {
        return this.isFav ? "Remove from ChopList" : "Add to ChopList";
      },

      getSpiceDisplay() {
        const lvl = recipe.spiceLevel || 2;
        return "🌶️".repeat(lvl);
      },

      getTimeDisplay() {
        return `${recipe.prepTime + recipe.cookTime} mins`;
      },
    },

    style: css`
      :scope {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        position: relative;
        cursor: pointer;
      }

      :scope:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.4);
        border-color: rgba(245, 158, 11, 0.35);
      }

      .card-media {
        position: relative;
        height: 190px;
        width: 100%;
        overflow: hidden;
        background: #0f172a;
      }

      .card-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      :scope:hover .card-img {
        transform: scale(1.05);
      }

      .category-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        color: #f59e0b;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .fav-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.1rem;
        transition: transform 0.15s ease, background 0.2s;
        z-index: 2;
      }

      .fav-btn:hover {
        transform: scale(1.15);
        background: rgba(15, 23, 42, 0.9);
      }

      .fav-btn.active {
        border-color: #ef4444;
      }

      .card-content {
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .card-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.4rem;
      }

      .rating-tag {
        font-size: 0.8rem;
        font-weight: 700;
        color: #f59e0b;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .reviews-count {
        color: var(--text-muted, #94a3b8);
        font-size: 0.75rem;
        font-weight: 400;
      }

      .card-title {
        margin: 0 0 0.5rem 0;
        font-size: 1.15rem;
        font-weight: 800;
        line-height: 1.35;
        color: var(--text-heading, #f8fafc);
      }

      .card-desc {
        font-size: 0.85rem;
        line-height: 1.5;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
      }

      .card-meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
        font-size: 0.8rem;
        color: var(--text-muted, #cbd5e1);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .view-action {
        color: #10b981;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: transform 0.15s ease;
      }

      :scope:hover .view-action {
        transform: translateX(4px);
      }
    `,

    template: () => html`
      <article class="recipe-card" @on="click=viewDetails">
        <div class="card-media">
          <img class="card-img" src="${recipe.heroImage}" alt="${recipe.title}" loading="lazy" />
          <span class="category-badge">${recipe.category}</span>
          <button type="button" @class="favClass" @on="click=toggleFav" @attr="title=favTooltip">
            <span @text="favIcon"></span>
          </button>
        </div>

        <div class="card-content">
          <div class="card-header-row">
            <span class="rating-tag">★ ${recipe.rating} <span class="reviews-count">(${recipe.reviewCount})</span></span>
            <span class="spice-meter" @text="getSpiceDisplay" title="Heat level"></span>
          </div>

          <h3 class="card-title">${recipe.emoji} ${recipe.title}</h3>
          <p class="card-desc">${recipe.description}</p>

          <div class="card-meta-bar">
            <div class="meta-item">
              <span>⏱️</span>
              <span @text="getTimeDisplay"></span>
            </div>
            <div class="meta-item">
              <span>👥</span>
              <span>${recipe.servings} servings</span>
            </div>
            <span class="view-action">Cook ➔</span>
          </div>
        </div>
      </article>
    `,
  })();
}
