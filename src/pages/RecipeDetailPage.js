import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";

function formatScaledAmount(baseAmount, multiplier) {
  if (baseAmount === undefined || baseAmount === null || baseAmount === "") {
    return "";
  }
  const str = String(baseAmount).trim();
  const match = str.match(/^([\d.]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num)) {
      const scaled = num * multiplier;
      const formatted = Number.isInteger(scaled) ? String(scaled) : String(scaled.toFixed(1));
      const rest = match[2] ? ` ${match[2]}` : "";
      return `${formatted}${rest}`;
    }
  }
  const num = parseFloat(str);
  if (!isNaN(num)) {
    const scaled = num * multiplier;
    return Number.isInteger(scaled) ? String(scaled) : String(scaled.toFixed(1));
  }
  return str;
}

function computeScaledIngredients(rawIngredients, multiplier) {
  return (rawIngredients || []).map((ing, idx) => {
    const amtStr = formatScaledAmount(ing.amount, multiplier);
    const unitStr = ing.unit ? ` ${ing.unit}` : "";
    const display = amtStr ? `${amtStr}${unitStr}` : (ing.unit || "");
    return {
      id: idx,
      item: ing.item,
      displayAmount: display,
    };
  });
}

/**
 * RecipeDetailPage Component
 * Uses Udodi router params/data, computed scaling, and reactive timers.
 */
export const RecipeDetailPage = createComponent({
  name: "RecipeDetailPage",

  state() {
    return {
      activeServings: 4,
      completedSteps: [],
      timerSeconds: 300,
      timerRunning: false,
      timerInitial: 300,
    };
  },

  computed: {
    recipe(ctx) {
      if (ctx.props?.recipe) return ctx.props.recipe;
      const activeRouter = ctx.props?.router || (typeof globalThis !== "undefined" && globalThis.__choplife_router);
      const recipeId = activeRouter?.route?.params?.id || 1;
      return activeRouter?.route?.data || foodStore.getRecipeById(recipeId) || foodStore.getAllRecipes()[0];
    },

    servingsMultiplier(ctx) {
      const base = ctx.recipe?.servings || 4;
      return ctx.activeServings / base;
    },

    scaledIngredients(ctx) {
      const r = ctx.recipe;
      if (!r || !r.ingredients) return [];
      return computeScaledIngredients(r.ingredients, ctx.servingsMultiplier);
    },

    isFav(ctx) {
      const id = ctx.recipe?.id;
      return id ? foodStore.isFavorite(id) : false;
    },

    favIcon(ctx) {
      return ctx.isFav ? "❤️ In Your ChopList" : "🤍 Add to ChopList";
    },

    favTooltip(ctx) {
      return ctx.isFav ? "Remove from ChopList" : "Add to ChopList";
    },

    formatTimer(ctx) {
      const m = Math.floor(ctx.timerSeconds / 60);
      const s = ctx.timerSeconds % 60;
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      return `${mm}:${ss}`;
    },

    getProgressPercent(ctx) {
      const total = ctx.recipe?.instructions?.length || 1;
      const done = ctx.completedSteps.length;
      return Math.round((done / total) * 100);
    },
  },

  interceptors: {
    activeServings(val) {
      return Math.max(1, Math.min(50, Number(val) || 1));
    },
  },

  onMount(_root, ctx) {
    if (ctx.recipe?.servings) {
      ctx.activeServings = ctx.recipe.servings;
    }

    let interval = null;

    const updateTimer = () => {
      if (ctx.timerRunning && ctx.timerSeconds > 0) {
        ctx.timerSeconds = ctx.timerSeconds - 1;
        if (ctx.timerSeconds === 0) {
          ctx.timerRunning = false;
          foodStore.showToast("⏰ Food don ready! Kitchen timer finished!", "success");
        }
      }
    };

    interval = setInterval(updateTimer, 1000);
    ctx.cleanup(() => clearInterval(interval));
  },

  methods: {
    increaseServings() {
      this.activeServings = Math.min(50, this.activeServings + 1);
    },

    decreaseServings() {
      if (this.activeServings > 1) {
        this.activeServings = Math.max(1, this.activeServings - 1);
      }
    },

    resetServings() {
      const base = this.recipe?.servings || 4;
      this.activeServings = base;
    },

    toggleFavorite() {
      const id = this.recipe?.id;
      if (id) {
        foodStore.toggleFavorite(id);
      }
    },

    toggleStep(_event, index) {
      const idx = Number(index);
      const steps = [...this.completedSteps];
      const pos = steps.indexOf(idx);
      if (pos > -1) {
        steps.splice(pos, 1);
      } else {
        steps.push(idx);
      }
      this.completedSteps = steps;
    },

    isStepDone(index) {
      return this.completedSteps.includes(Number(index));
    },

    stepClass(index) {
      return this.isStepDone(index) ? "step-card done" : "step-card";
    },

    startTimer() {
      this.timerRunning = true;
    },

    pauseTimer() {
      this.timerRunning = false;
    },

    resetTimer() {
      this.timerRunning = false;
      this.timerSeconds = this.timerInitial;
    },

    setTimerMinutes(_event, mins) {
      const s = Number(mins) * 60;
      this.timerInitial = s;
      this.timerSeconds = s;
      this.timerRunning = false;
    },

    goBack(ctx) {
      const activeRouter = ctx?.props?.router || (typeof globalThis !== "undefined" && globalThis.__choplife_router);
      if (activeRouter && typeof activeRouter.push === "function") {
        activeRouter.push("/");
      } else if (typeof window !== "undefined" && window.history) {
        window.history.back();
      }
    },
  },

  style: css`
    :scope {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .back-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-back {
      background: transparent;
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      color: var(--text-heading, #f8fafc);
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .btn-fav-large {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      color: var(--text-heading, #f8fafc);
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-fav-large:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #ef4444;
    }

    .recipe-hero-card {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 24px;
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
    }

    @media (min-width: 850px) {
      .recipe-hero-card {
        grid-template-columns: 1.1fr 1fr;
      }
    }

    .hero-image-wrap {
      min-height: 320px;
      max-height: 480px;
      position: relative;
      background: #0f172a;
    }

    .hero-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-meta-body {
      padding: 2.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .category-pill-tag {
      align-self: flex-start;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }

    .recipe-title {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 900;
      line-height: 1.2;
      margin: 0 0 1rem;
      color: var(--text-heading, #f8fafc);
    }

    .recipe-intro-text {
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text-muted, #94a3b8);
      margin-bottom: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    }

    .metric-box {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-val {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
    }

    .metric-lbl {
      font-size: 0.78rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .chef-note-card {
      background: rgba(245, 158, 11, 0.08);
      border-left: 4px solid #f59e0b;
      padding: 1.25rem 1.5rem;
      border-radius: 0 16px 16px 0;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .chef-emoji {
      font-size: 1.8rem;
      line-height: 1;
    }

    .chef-quote {
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--text-heading, #f8fafc);
      margin: 0;
      font-style: italic;
    }

    .recipe-details-columns {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 900px) {
      .recipe-details-columns {
        grid-template-columns: 360px 1fr;
      }
    }

    .ingredients-panel, .instructions-panel {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 24px;
      padding: 1.75rem;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
    }

    .panel-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-heading, #f8fafc);
    }

    .scaler-control-group {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      padding: 4px 8px;
      border-radius: 999px;
    }

    .btn-scale {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .btn-scale:hover {
      background: #f59e0b;
      color: #0f172a;
    }

    .servings-display {
      font-size: 0.85rem;
      font-weight: 700;
      color: #f59e0b;
      padding: 0 4px;
      min-width: 55px;
      text-align: center;
    }

    .ingredients-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .ingredient-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.92rem;
    }

    .ing-name {
      color: var(--text-heading, #f8fafc);
      font-weight: 500;
    }

    .ing-amount {
      font-weight: 700;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.82rem;
    }

    .timer-widget-card {
      margin-top: 1.5rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      padding: 1.25rem;
      text-align: center;
    }

    .timer-header-lbl {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted, #94a3b8);
      margin-bottom: 0.5rem;
    }

    .timer-digits {
      font-size: 2.25rem;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
      color: #34d399;
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
    }

    .timer-buttons-row {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .btn-timer-action {
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      border: none;
    }

    .btn-timer-start {
      background: #10b981;
      color: white;
    }

    .btn-timer-pause {
      background: #f59e0b;
      color: #0f172a;
    }

    .btn-timer-reset {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #94a3b8);
    }

    .timer-presets {
      display: flex;
      justify-content: center;
      gap: 6px;
      font-size: 0.75rem;
    }

    .btn-preset {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #94a3b8);
      padding: 3px 8px;
      border-radius: 999px;
      cursor: pointer;
    }

    .btn-preset:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .progress-card {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 0.85rem 1.2rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .progress-text {
      font-size: 0.88rem;
      font-weight: 700;
      color: #34d399;
    }

    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .step-card {
      padding: 1.1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .step-card:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .step-card.done {
      background: rgba(16, 185, 129, 0.06);
      border-color: rgba(16, 185, 129, 0.3);
      opacity: 0.75;
    }

    .step-checkbox {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 900;
      color: #10b981;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .step-card.done .step-checkbox {
      background: #10b981;
      border-color: #10b981;
      color: #ffffff;
    }

    .step-content {
      flex: 1;
    }

    .step-number {
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #f59e0b;
      letter-spacing: 0.05em;
      margin-bottom: 0.3rem;
    }

    .step-desc {
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--text-heading, #f1f5f9);
      margin: 0;
    }

    .step-card.done .step-desc {
      text-decoration: line-through;
      color: var(--text-muted, #94a3b8);
    }
  `,

  template: (ctx) => {
    const recipe = ctx.recipe || {};
    const instructions = recipe.instructions || [];

    return html`
      <div class="recipe-detail-root">
        <div class="back-nav-bar">
          <button type="button" class="btn-back" @on="click=goBack">
            ← Back to Discovery
          </button>
          <button type="button" class="btn-fav-large" @on="click=toggleFavorite" @attr="title=favTooltip">
            <span @text="favIcon"></span>
          </button>
        </div>

        <section class="recipe-hero-card">
          <div class="hero-image-wrap">
            <img src="${recipe.heroImage || '/images/jollof.jpg'}" alt="${recipe.title || 'Recipe'}" />
          </div>

          <div class="hero-meta-body">
            <span class="category-pill-tag">${recipe.category || 'Heritage Dish'}</span>
            <h1 class="recipe-title">${recipe.emoji || '🍲'} ${recipe.title || ''}</h1>
            <p class="recipe-intro-text">${recipe.description || ''}</p>

            <div class="metrics-grid">
              <div class="metric-box">
                <div class="metric-val">${recipe.prepTime || 15}m</div>
                <div class="metric-lbl">Prep Time</div>
              </div>
              <div class="metric-box">
                <div class="metric-val">${recipe.cookTime || 30}m</div>
                <div class="metric-lbl">Cook Time</div>
              </div>
              <div class="metric-box">
                <div class="metric-val">🌶️ ${recipe.spiceLevel || 2}/4</div>
                <div class="metric-lbl">Spice Heat</div>
              </div>
            </div>
          </div>
        </section>

        <section class="chef-note-card">
          <span class="chef-emoji">👩🏾‍🍳</span>
          <div>
            <p class="chef-quote">"${recipe.chefNote || 'Cook with love and patience.'}"</p>
          </div>
        </section>

        <div class="recipe-details-columns">
          <section class="ingredients-panel">
            <div class="panel-header">
              <h2 class="panel-title">🛒 Ingredients</h2>
              <div class="scaler-control-group">
                <button type="button" class="btn-scale" @on="click=decreaseServings">−</button>
                <div class="servings-display"><span @text="activeServings"></span> pers.</div>
                <button type="button" class="btn-scale" @on="click=increaseServings">+</button>
              </div>
            </div>

            <div class="ingredients-list">
              <div class="ingredient-row" @for="ing scaledIngredients" @key="ing.id">
                <span class="ing-name" @text="ing.item"></span>
                <span class="ing-amount" @text="ing.displayAmount"></span>
              </div>
            </div>

            <div class="timer-widget-card">
              <div class="timer-header-lbl">⏱️ Kitchen Cooking Timer</div>
              <div class="timer-digits" @text="formatTimer">05:00</div>
              <div class="timer-buttons-row">
                <button type="button" class="btn-timer-action btn-timer-start" @on="click=startTimer">Start</button>
                <button type="button" class="btn-timer-action btn-timer-pause" @on="click=pauseTimer">Pause</button>
                <button type="button" class="btn-timer-action btn-timer-reset" @on="click=resetTimer">Reset</button>
              </div>
              <div class="timer-presets">
                <button type="button" class="btn-preset" @on="click=setTimerMinutes:5">5m</button>
                <button type="button" class="btn-preset" @on="click=setTimerMinutes:15">15m</button>
                <button type="button" class="btn-preset" @on="click=setTimerMinutes:30">30m</button>
                <button type="button" class="btn-preset" @on="click=setTimerMinutes:45">45m</button>
              </div>
            </div>
          </section>

          <section class="instructions-panel">
            <div class="panel-header">
              <h2 class="panel-title">👩🏾‍🍳 Step-by-Step Cooking Guide</h2>
            </div>

            <div class="progress-card">
              <span class="progress-text">Progress: <span @text="getProgressPercent">0</span>% Completed</span>
              <span>Tap step when done</span>
            </div>

            <div class="steps-list">
              ${instructions.map((step, idx) => `
                <div @class="stepClass:${idx}" @on="click=toggleStep:${idx}">
                  <div class="step-checkbox">
                    <span>✓</span>
                  </div>
                  <div class="step-content">
                    <div class="step-number">Step ${idx + 1}</div>
                    <p class="step-desc">${step}</p>
                  </div>
                </div>
              `).join("\n")}
            </div>
          </section>
        </div>
      </div>
    `;
  },
});

/**
 * Backward compatibility helper
 */
export function createRecipeDetailPage(customRouter) {
  return RecipeDetailPage({ router: customRouter });
}
