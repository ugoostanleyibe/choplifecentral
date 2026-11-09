import { createComponent, html, css, openModal, closeTopModal } from "udodi";

export function launchPepperQuiz(router) {
  const QuizContent = createComponent({
    name: "PepperQuizModal",

    state() {
      return {
        selectedLevel: null,
        recommendation: null,
      };
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
          closeTopModal(true);
          router.push(`/recipes/${targetId}`);
        }
      },

      closeDialog() {
        closeTopModal(false);
      },

      hasRecommendation() {
        return !!this.recommendation;
      },

      getRecTitle() {
        return this.recommendation ? this.recommendation.title : "";
      },

      getRecReason() {
        return this.recommendation ? this.recommendation.reason : "";
      },

      getRecEmoji() {
        return this.recommendation ? this.recommendation.emoji : "🍲";
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
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f59e0b;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.6rem;
        line-height: 1;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
      }

      .close-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }

      .modal-body {
        padding: 1.5rem;
      }

      .subtitle {
        color: #cbd5e1;
        font-size: 0.95rem;
        margin-bottom: 1.25rem;
        line-height: 1.5;
      }

      .quiz-options {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .option-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
        padding: 1rem 1.2rem;
        border-radius: 12px;
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .option-btn:hover {
        background: rgba(245, 158, 11, 0.12);
        border-color: #f59e0b;
        transform: translateY(-2px);
      }

      .option-icon {
        font-size: 1.6rem;
      }

      .option-info {
        display: flex;
        flex-direction: column;
      }

      .option-title {
        font-size: 1rem;
        font-weight: 700;
      }

      .option-desc {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 2px;
      }

      .result-box {
        margin-top: 1.5rem;
        background: linear-gradient(135deg, rgba(5, 150, 105, 0.2), rgba(15, 23, 42, 0.6));
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

  return openModal(() => QuizContent(), {
    renderBackdrop: true,
    closeOnBackdrop: true,
    closeOnEscape: true,
    lockScroll: true,
  });
}
