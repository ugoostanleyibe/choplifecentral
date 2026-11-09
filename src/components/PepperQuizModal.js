import { createComponent, html, css, openModal, closeTopModal } from "udodi";
import { router } from "../router.js";

/**
 * QuizModalContent Component
 * Receives optional `close` prop passed from openModal render function.
 */
export const QuizModalContent = createComponent({
  name: "PepperQuizModal",

  state() {
    return {
      selectedLevel: null,
      recommendation: null,
    };
  },

  computed: {
    hasRecommendation(ctx) {
      return !!ctx.recommendation;
    },

    getRecTitle(ctx) {
      return ctx.recommendation ? ctx.recommendation.title : "";
    },

    getRecReason(ctx) {
      return ctx.recommendation ? ctx.recommendation.reason : "";
    },

    getRecEmoji(ctx) {
      return ctx.recommendation ? ctx.recommendation.emoji : "🍲";
    },
  },

  methods: {
    choose(level) {
      this.selectedLevel = level;
      if (level === 1) {
        this.recommendation = {
          id: 5,
          title: "Golden Puff-Puff with Cinnamon Glaze",
          emoji: "🍩",
          reason: "Soft life only! Sweet, fluffy dough with zero pepper pressure. Perfect for chilling.",
        };
      } else if (level === 2) {
        this.recommendation = {
          id: 1,
          title: "Smoky Firewood Party Jollof Rice",
          emoji: "🍛",
          reason: "Proper Owambe balance! Sweet tomato base with just enough Scotch bonnet heat to keep you smiling.",
        };
      } else {
        this.recommendation = {
          id: 6,
          title: "Fiery Goat Meat Pepper Soup",
          emoji: "🥣",
          reason: "Veterans only! This one will clear your nostrils, awaken your ancestors, and heal all cold in 5 minutes.",
        };
      }
    },

    chooseMild() {
      this.choose(1);
    },

    chooseMedium() {
      this.choose(2);
    },

    chooseHot() {
      this.choose(3);
    },

    goToRecipe() {
      if (this.recommendation) {
        const targetId = this.recommendation.id;
        this.closeDialog();
        router.push(`/recipes/${targetId}`);
      }
    },

    closeDialog() {
      if (typeof this.close === "function") {
        this.close();
      } else {
        closeTopModal(false);
      }
    },
  },

  style: css`
    :scope {
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-heading, #f8fafc);
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 4px;
    }

    .close-btn:hover {
      color: #ffffff;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      margin-top: 0;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .option-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s ease;
      color: inherit;
    }

    .option-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: #f59e0b;
      transform: translateX(4px);
    }

    .option-icon {
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .option-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .option-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-heading, #f8fafc);
    }

    .option-desc {
      font-size: 0.82rem;
      color: #94a3b8;
      line-height: 1.4;
    }

    .result-box {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid #10b981;
      border-radius: 16px;
      padding: 1.25rem;
      text-align: center;
      animation: fadeIn 0.3s ease;
    }

    .rec-emoji {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .rec-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #34d399;
      margin-bottom: 0.5rem;
    }

    .rec-reason {
      font-size: 0.88rem;
      color: #cbd5e1;
      line-height: 1.45;
      margin-bottom: 1rem;
    }

    .view-btn {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.5rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .view-btn:hover {
      background: #059669;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,

  template: () => html`
    <div udodi-overlay-panel class="pepper-quiz-modal">
      <header class="modal-header">
        <h3 class="modal-title">🌶️ Naija Pepper Meter Quiz</h3>
        <button type="button" class="close-btn" @on="click=closeDialog">×</button>
      </header>

      <div class="modal-body">
        <p class="subtitle">
          Tell us how much pepper you fit tolerate, make we recommend your next holy meal!
        </p>

        <div class="quiz-options">
          <button type="button" class="option-btn" @on="click=chooseMild">
            <span class="option-icon">🧊</span>
            <div class="option-info">
              <span class="option-title">Level 1: Soft Life / Butter Boy</span>
              <span class="option-desc">Small drop of pepper and you are drinking 2 bottles of water.</span>
            </div>
          </button>

          <button type="button" class="option-btn" @on="click=chooseMedium">
            <span class="option-icon">🌶️</span>
            <div class="option-info">
              <span class="option-title">Level 2: Standard Lagos Owambe</span>
              <span class="option-desc">You appreciate the heat, you sweat gently, your heart is glad.</span>
            </div>
          </button>

          <button type="button" class="option-btn" @on="click=chooseHot">
            <span class="option-icon">🔥</span>
            <div class="option-info">
              <span class="option-title">Level 3: Fire & Brimstone (Buka Warrior)</span>
              <span class="option-desc">Scotch bonnet is your salad dressing. Ears must ring!</span>
            </div>
          </button>
        </div>

        <div class="result-box" @show="hasRecommendation">
          <div class="rec-emoji" @text="getRecEmoji"></div>
          <div class="rec-title" @text="getRecTitle"></div>
          <div class="rec-reason" @text="getRecReason"></div>
          <button type="button" class="view-btn" @on="click=goToRecipe">
            Go To Recipe ➔
          </button>
        </div>
      </div>
    </div>
  `,
});

export function launchPepperQuiz() {
  return openModal((close) => QuizModalContent({ close }), {
    renderBackdrop: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    lockScroll: true,
  });
}
