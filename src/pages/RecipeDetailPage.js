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

export function createRecipeDetailPage(router) {
  return createComponent({
    name: "RecipeDetailPage",

    state() {
      const recipeId = router.route.params?.id || 1;
      const recipe = router.route.data || foodStore.getRecipeById(recipeId) || foodStore.getAllRecipes()[0];
      const baseServings = recipe.servings || 4;

      return {
        recipeId: recipe.id,
        currentRecipe: recipe,
        baseServings: baseServings,
        servingsMultiplier: 1,
        activeServings: baseServings,
        scaledIngredients: computeScaledIngredients(recipe.ingredients, 1),
        isFav: foodStore.isFavorite(recipe.id),
        completedSteps: [],
        timerSeconds: 300, // 5 min default
        timerRunning: false,
        timerInitial: 300,
      };
    },

    interceptors: {
      activeServings(val) {
        return Math.max(1, Math.min(50, Number(val) || 1));
      },
    },

    onMount(_root, ctx) {
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
      recomputeScaled() {
        this.scaledIngredients = computeScaledIngredients(
          this.currentRecipe.ingredients,
          this.servingsMultiplier
        );
      },

      increaseServings() {
        const base = this.baseServings || 4;
        this.activeServings = Math.min(50, this.activeServings + 1);
        this.servingsMultiplier = this.activeServings / base;
        this.recomputeScaled();
      },

      decreaseServings() {
        const base = this.baseServings || 4;
        if (this.activeServings > 1) {
          this.activeServings = Math.max(1, this.activeServings - 1);
          this.servingsMultiplier = this.activeServings / base;
          this.recomputeScaled();
        }
      },

      resetServings() {
        const base = this.baseServings || 4;
        this.activeServings = base;
        this.servingsMultiplier = 1;
        this.recomputeScaled();
      },

      toggleFavorite() {
        foodStore.toggleFavorite(this.recipeId);
        this.isFav = foodStore.isFavorite(this.recipeId);
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

      formatTimer() {
        const m = Math.floor(this.timerSeconds / 60);
        const s = this.timerSeconds % 60;
        const mm = String(m).padStart(2, "0");
        const ss = String(s).padStart(2, "0");
        return `${mm}:${ss}`;
      },

      favIcon() {
        return this.isFav ? "❤️ In Your ChopList" : "🤍 Add to ChopList";
      },

      favTooltip() {
        return this.isFav ? "Remove from ChopList" : "Add to ChopList";
      },

      goBack() {
        router.push("/");
      },

      getScaledAmount(baseAmount) {
        if (!baseAmount || isNaN(baseAmount)) return baseAmount;
        const scaled = baseAmount * this.servingsMultiplier;
        return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
      },

      getProgressPercent() {
        const total = this.currentRecipe.instructions?.length || 1;
        const done = this.completedSteps.length;
        return Math.round((done / total) * 100);
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
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background 0.2s;
      }

      .btn-back:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .btn-fav-large {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 0.5rem 1.2rem;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-fav-large:hover {
        background: rgba(239, 68, 68, 0.22);
      }

      .recipe-hero-card {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 24px;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.35);
      }

      @media (max-width: 850px) {
        .recipe-hero-card {
          grid-template-columns: 1fr;
        }
      }

      .hero-image-wrap {
        height: 100%;
        min-height: 340px;
        position: relative;
        overflow: hidden;
      }

      .hero-image-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .hero-meta-body {
        padding: 2.2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .category-pill-tag {
        display: inline-block;
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        font-weight: 800;
        font-size: 0.8rem;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 0.8rem;
        width: fit-content;
      }

      .recipe-title {
        font-size: clamp(1.8rem, 3.5vw, 2.5rem);
        font-weight: 900;
        line-height: 1.2;
        margin: 0 0 1rem;
        color: var(--text-heading, #f8fafc);
      }

      .recipe-intro-text {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--text-muted, #94a3b8);
        margin-bottom: 1.5rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        padding-top: 1.25rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .metric-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 0.75rem;
        text-align: center;
      }

      .metric-val {
        font-size: 1.1rem;
        font-weight: 800;
        color: #f59e0b;
      }

      .metric-lbl {
        font-size: 0.75rem;
        color: var(--text-muted, #94a3b8);
        margin-top: 2px;
      }

      .chef-note-card {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(16, 185, 129, 0.05));
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 18px;
        padding: 1.25rem 1.5rem;
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }

      .chef-avatar {
        font-size: 2rem;
      }

      .chef-note-title {
        font-weight: 800;
        font-size: 0.95rem;
        color: #f59e0b;
        margin: 0 0 0.3rem;
      }

      .chef-note-text {
        font-size: 0.88rem;
        color: var(--text-heading, #f1f5f9);
        margin: 0;
        line-height: 1.5;
      }

      .detail-columns-layout {
        display: grid;
        grid-template-columns: 1fr 1.6fr;
        gap: 2rem;
        align-items: start;
      }

      @media (max-width: 900px) {
        .detail-columns-layout {
          grid-template-columns: 1fr;
        }
      }

      .ingredients-panel, .instructions-panel {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 20px;
        padding: 1.75rem;
      }

      .scaler-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .scaler-title {
        font-size: 1.2rem;
        font-weight: 800;
        color: var(--text-heading, #f8fafc);
        margin: 0;
      }

      .servings-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(15, 23, 42, 0.6);
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .btn-scale {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: var(--text-heading, #f8fafc);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        font-size: 1.1rem;
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
        font-weight: 800;
        font-size: 0.9rem;
        min-width: 60px;
        text-align: center;
        color: #f59e0b;
      }

      .ingredients-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ingredient-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 0.8rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.04);
        font-size: 0.9rem;
      }

      .ing-item {
        color: var(--text-heading, #f1f5f9);
        font-weight: 500;
      }

      .ing-amount {
        font-weight: 800;
        color: #10b981;
        white-space: nowrap;
      }

      .timer-widget {
        margin-top: 1.5rem;
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 16px;
        padding: 1.25rem;
        text-align: center;
      }

      .timer-label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #f59e0b;
        letter-spacing: 0.05em;
        margin-bottom: 0.4rem;
      }

      .timer-digits {
        font-size: 2.4rem;
        font-weight: 900;
        font-family: ui-monospace, monospace;
        color: var(--text-heading, #f8fafc);
        margin: 0.2rem 0 0.8rem;
      }

      .timer-buttons {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 0.8rem;
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

    template: () => {
      const recipeId = router.route.params?.id || 1;
      const recipe = router.route.data || foodStore.getRecipeById(recipeId) || foodStore.getAllRecipes()[0];

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
              <img src="${recipe.heroImage}" alt="${recipe.title}" />
            </div>

            <div class="hero-meta-body">
              <span class="category-pill-tag">${recipe.category}</span>
              <h1 class="recipe-title">${recipe.emoji} ${recipe.title}</h1>
              <p class="recipe-intro-text">${recipe.description}</p>

              <div class="metrics-grid">
                <div class="metric-box">
                  <div class="metric-val">${recipe.prepTime}m</div>
                  <div class="metric-lbl">Prep Time</div>
                </div>
                <div class="metric-box">
                  <div class="metric-val">${recipe.cookTime}m</div>
                  <div class="metric-lbl">Cook Time</div>
                </div>
                <div class="metric-box">
                  <div class="metric-val">🌶️ ${recipe.spiceLevel}/4</div>
                  <div class="metric-lbl">Spice Heat</div>
                </div>
              </div>
            </div>
          </section>

          <section class="chef-note-card">
            <span class="chef-avatar">👨🏾‍🍳</span>
            <div>
              <h4 class="chef-note-title">Naija Chef's Golden Rule</h4>
              <p class="chef-note-text">${recipe.chefNote || "Always fry your spices on gentle heat to coax out their pure essential oils."}</p>
            </div>
          </section>

          <div class="detail-columns-layout">
            <!-- Left Column: Scalable Ingredients & Timer -->
            <aside class="ingredients-panel">
              <div class="scaler-header">
                <h3 class="scaler-title">Ingredients</h3>
                <div class="servings-controls">
                  <button type="button" class="btn-scale" @on="click=decreaseServings">-</button>
                  <span class="servings-display"><span @text="activeServings"></span> pers.</span>
                  <button type="button" class="btn-scale" @on="click=increaseServings">+</button>
                </div>
              </div>

              <ul class="ingredients-list">
                <li class="ingredient-row" @for="ing scaledIngredients" @key="ing.id">
                  <span class="ing-item" @text="ing.item"></span>
                  <span class="ing-amount" @text="ing.displayAmount"></span>
                </li>
              </ul>

              <!-- Kitchen Timer Widget -->
              <div class="timer-widget">
                <div class="timer-label">⏱️ Cook-Along Timer</div>
                <div class="timer-digits" @text="formatTimer"></div>
                <div class="timer-buttons">
                  <button type="button" class="btn-timer-action btn-timer-start" @on="click=startTimer">Start</button>
                  <button type="button" class="btn-timer-action btn-timer-pause" @on="click=pauseTimer">Pause</button>
                  <button type="button" class="btn-timer-action btn-timer-reset" @on="click=resetTimer">Reset</button>
                </div>
                <div class="timer-presets">
                  <button type="button" class="btn-preset" @on="click=setTimerMinutes:1">1m</button>
                  <button type="button" class="btn-preset" @on="click=setTimerMinutes:5">5m</button>
                  <button type="button" class="btn-preset" @on="click=setTimerMinutes:15">15m</button>
                  <button type="button" class="btn-preset" @on="click=setTimerMinutes:30">30m</button>
                </div>
              </div>
            </aside>

            <!-- Right Column: Step by step instructions with checkoff -->
            <main class="instructions-panel">
              <div class="progress-card">
                <span class="progress-text">Cooking Progress: <strong @text="getProgressPercent"></strong>% completed</span>
                <span>🔥 Pot is bubbling</span>
              </div>

              <div class="steps-list">
                ${(recipe.instructions || []).map((step, idx) => `
                  <div @class="stepClass:${idx}" @on="click=toggleStep:${idx}">
                    <div class="step-checkbox">✓</div>
                    <div class="step-content">
                      <div class="step-number">Step ${idx + 1}</div>
                      <p class="step-desc">${step}</p>
                    </div>
                  </div>
                `).join("")}
              </div>
            </main>
          </div>
        </div>
      `;
    },
  })();
}
