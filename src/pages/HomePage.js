import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { launchPepperQuiz } from "../components/PepperQuizModal.js";
import { router } from "../router.js";

/**
 * HomePage Component
 * Uses Udodi reactive state, computed values, and composition.
 */
export const HomePage = createComponent({
  name: "HomePage",

  state() {
    return {
      searchQuery: "",
      selectedCategory: "All",
      selectedSpice: 0, // 0 means any
    };
  },

  computed: {
    filteredRecipes(ctx) {
      const query = (ctx.searchQuery || "").toLowerCase().trim();
      const cat = ctx.selectedCategory;
      const spice = ctx.selectedSpice;
      const all = foodStore.getAllRecipes();

      return all.filter((r) => {
        if (cat !== "All" && r.category !== cat) return false;
        if (spice > 0 && r.spiceLevel !== spice) return false;
        if (query) {
          const inTitle = (r.title || "").toLowerCase().includes(query);
          const inDesc = (r.description || "").toLowerCase().includes(query);
          const inTags = (r.tags || []).some((t) => t.toLowerCase().includes(query));
          return inTitle || inDesc || inTags;
        }
        return true;
      });
    },

    getFilteredCount(ctx) {
      return ctx.filteredRecipes.length;
    },

    getDishesNoun(ctx) {
      return ctx.getFilteredCount === 1 ? "dish" : "dishes";
    },

    isAllCat(ctx) {
      return ctx.selectedCategory === "All";
    },

    isRiceCat(ctx) {
      return ctx.selectedCategory === "Jollof & Rice";
    },

    isSoupCat(ctx) {
      return ctx.selectedCategory === "Soups & Swallows";
    },

    isStreetCat(ctx) {
      return ctx.selectedCategory === "Street Food & Grills";
    },

    isComfortCat(ctx) {
      return ctx.selectedCategory === "Comfort Bowls";
    },

    isBitesCat(ctx) {
      return ctx.selectedCategory === "Quick Bites";
    },

    hasNoResults(ctx) {
      return ctx.getFilteredCount === 0;
    },
  },

  methods: {
    setCategory(arg1, arg2) {
      const cat = (typeof arg1 === "object" && arg1 !== null) ? arg2 : arg1;
      this.selectedCategory = cat || "All";
    },

    setCategoryAll() {
      this.selectedCategory = "All";
    },

    setCategoryRice() {
      this.selectedCategory = "Jollof & Rice";
    },

    setCategorySoup() {
      this.selectedCategory = "Soups & Swallows";
    },

    setCategoryStreet() {
      this.selectedCategory = "Street Food & Grills";
    },

    setCategoryComfort() {
      this.selectedCategory = "Comfort Bowls";
    },

    setCategoryBites() {
      this.selectedCategory = "Quick Bites";
    },

    setSpice(_event, level) {
      this.selectedSpice = Number(level);
    },

    clearFilters() {
      this.searchQuery = "";
      this.selectedCategory = "All";
      this.selectedSpice = 0;
    },

    openQuiz() {
      launchPepperQuiz();
    },

    goToCreate() {
      router.push("/create");
    },

    isRecipeVisible(arg1, arg2) {
      const targetId = (typeof arg1 === "object" && arg1 !== null) ? arg2 : arg1;
      const numericId = Number(targetId);
      if (isNaN(numericId)) return true;
      const query = (this.searchQuery || "").toLowerCase().trim();
      const cat = this.selectedCategory;
      const spice = this.selectedSpice;
      const r = foodStore.getRecipeById(numericId);
      if (!r) return false;
      if (cat !== "All" && r.category !== cat) return false;
      if (spice > 0 && r.spiceLevel !== spice) return false;
      if (query) {
        const inTitle = (r.title || "").toLowerCase().includes(query);
        const inDesc = (r.description || "").toLowerCase().includes(query);
        const inTags = (r.tags || []).some((t) => t.toLowerCase().includes(query));
        return inTitle || inDesc || inTags;
      }
      return true;
    },

    spiceClass(lvl) {
      return this.selectedSpice === lvl ? "spice-pill active" : "spice-pill";
    },
  },

  style: css`
    :scope {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .hero-section {
      background: radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
                  var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 28px;
      padding: clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem);
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      letter-spacing: 0.02em;
    }

    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.8rem);
      font-weight: 900;
      line-height: 1.15;
      margin: 0 0 1.25rem 0;
      letter-spacing: -0.03em;
    }

    .gradient-text {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      color: var(--text-muted, #94a3b8);
      max-width: 680px;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .hero-cta-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    .btn-hero-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-size: 1rem;
      font-weight: 800;
      padding: 0.85rem 1.8rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.4);
      transition: all 0.2s ease;
    }

    .btn-hero-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -4px rgba(245, 158, 11, 0.5);
    }

    .btn-hero-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      color: var(--text-heading, #f8fafc);
      font-size: 1rem;
      font-weight: 700;
      padding: 0.85rem 1.8rem;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-hero-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1.25rem;
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: 900;
      color: var(--text-heading, #f8fafc);
    }

    .stat-label {
      font-size: 0.82rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .controls-bar {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .search-box-row {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 999px;
      padding: 0.85rem 1.25rem 0.85rem 2.85rem;
      font-size: 0.95rem;
      color: var(--text-heading, #f8fafc);
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .search-input:focus {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
    }

    .search-icon-deco {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.15rem;
      opacity: 0.6;
      pointer-events: none;
    }

    .filters-flex-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .category-pills, .spice-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
    }

    .filter-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted, #94a3b8);
      margin-right: 4px;
    }

    .cat-pill, .spice-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      color: var(--text-muted, #94a3b8);
      border-radius: 999px;
      padding: 0.35rem 0.85rem;
      font-size: 0.83rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .cat-pill:hover, .spice-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-heading, #f8fafc);
    }

    .cat-pill.active {
      background: #f59e0b;
      color: #0f172a;
      border-color: #f59e0b;
      font-weight: 700;
    }

    .spice-pill.active {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
      font-weight: 700;
    }

    .recipes-grid-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .section-heading {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
      margin: 0;
    }

    .results-counter {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
    }

    .no-results-box {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--card-bg, #1e293b);
      border-radius: 20px;
      border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
    }

    .no-results-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 0.5rem;
      color: var(--text-heading, #f8fafc);
    }

    .no-results-text {
      font-size: 0.95rem;
      color: var(--text-muted, #94a3b8);
      max-width: 420px;
      margin: 0 auto 1.5rem;
    }

    .btn-reset {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 700;
      padding: 0.65rem 1.4rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
    }
  `,

  template: () => {
    const all = foodStore.getAllRecipes();

    return html`
      <div class="homepage-root">
        <section class="hero-section">
          <div class="hero-badge">
            <span>🇳🇬</span> The Premier Nigerian Food Engine
          </div>

          <h1 class="hero-title">
            Belle Full, Heart Glad. <br />
            <span class="gradient-text">Chop Life to the Fullest.</span>
          </h1>

          <p class="hero-subtitle">
            Authentic step-by-step recipes, live portions scaler, Owambe party chow calculators, and instant pepper tolerance testing. Crafted with pure Udodi reactivity.
          </p>

          <div class="hero-cta-group">
            <button type="button" class="btn-hero-primary" @on="click=openQuiz">
              🌶️ Test Your Pepper Tolerance
            </button>
            <button type="button" class="btn-hero-secondary" @on="click=goToCreate">
              + Add Secret Family Recipe
            </button>
          </div>

          <div class="stats-strip">
            <div class="stat-card">
              <div class="stat-number">6+</div>
              <div class="stat-label">Heritage Dishes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">0ms</div>
              <div class="stat-label">Virtual DOM Lag</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">100%</div>
              <div class="stat-label">Naija Approved</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">4.9★</div>
              <div class="stat-label">Foodie Rating</div>
            </div>
          </div>
        </section>

        <section class="controls-bar">
          <div class="search-box-row">
            <span class="search-icon-deco">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search by dish name, ingredient (egusi, suya, crayfish), or tag..."
              @bind="searchQuery"
            />
          </div>

          <div class="filters-flex-row">
            <div class="category-pills">
              <span class="filter-label">Dish:</span>
              <button type="button" class="cat-pill" @class="isAllCat=>'active'" @on="click=setCategoryAll">All</button>
              <button type="button" class="cat-pill" @class="isRiceCat=>'active'" @on="click=setCategoryRice">Jollof & Rice</button>
              <button type="button" class="cat-pill" @class="isSoupCat=>'active'" @on="click=setCategorySoup">Soups & Swallows</button>
              <button type="button" class="cat-pill" @class="isStreetCat=>'active'" @on="click=setCategoryStreet">Street Food</button>
              <button type="button" class="cat-pill" @class="isComfortCat=>'active'" @on="click=setCategoryComfort">Comfort Bowls</button>
              <button type="button" class="cat-pill" @class="isBitesCat=>'active'" @on="click=setCategoryBites">Quick Bites</button>
            </div>

            <div class="spice-pills">
              <span class="filter-label">Heat:</span>
              <button type="button" @class="spiceClass:0" @on="click=setSpice:0">All</button>
              <button type="button" @class="spiceClass:1" @on="click=setSpice:1">Mild 🧊</button>
              <button type="button" @class="spiceClass:2" @on="click=setSpice:2">Medium 🌶️</button>
              <button type="button" @class="spiceClass:3" @on="click=setSpice:3">Hot 🔥</button>
              <button type="button" @class="spiceClass:4" @on="click=setSpice:4">Volcanic 🌋</button>
            </div>
          </div>
        </section>

        <section class="recipes-display-section">
          <div class="recipes-grid-header">
            <h2 class="section-heading">Featured Kitchen Showcase</h2>
            <span class="results-counter">
              Showing <strong @text="getFilteredCount"></strong> <span @text="getDishesNoun"></span>
            </span>
          </div>

          <div class="recipes-grid">
            ${all.map((item) => `
              <div class="recipe-card-slot" @show="isRecipeVisible:${item.id}">
                ${RecipeCard({ recipe: item })}
              </div>
            `).join("\n")}
          </div>

          <div class="no-results-box" @show="hasNoResults">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍲💨</div>
            <h3 class="no-results-title">No dishes match your filter</h3>
            <p class="no-results-text">
              Try clearing your search query or picking a different spice heat level.
            </p>
            <button type="button" class="btn-reset" @on="click=clearFilters">Reset All Filters</button>
          </div>
        </section>
      </div>
    `;
  },
});

/**
 * Backward compatibility helper
 */
export function createHomePage() {
  return HomePage();
}
