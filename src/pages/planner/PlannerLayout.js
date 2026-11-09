import { createComponent, html, css } from "udodi";
import { GuestCalculatorView } from "./GuestCalculatorView.js";
import { BudgetTrackerView } from "./BudgetTrackerView.js";
import { ChecklistView } from "./ChecklistView.js";

export function createPlannerLayout(router, activeView = "calculator") {
  return createComponent({
    name: "PlannerLayout",

    state: () => ({
      activeView,
    }),

    computed: {
      isCalculator(ctx) {
        return ctx.activeView === "calculator";
      },
      isBudget(ctx) {
        return ctx.activeView === "budget";
      },
      isChecklist(ctx) {
        return ctx.activeView === "checklist";
      },
    },

    style: css`
      :scope {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .planner-header-card {
        background: radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.15), transparent 50%),
                    var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 24px;
        padding: 2.25rem;
        box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
      }

      .planner-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
        font-weight: 800;
        font-size: 0.8rem;
        padding: 4px 12px;
        border-radius: 999px;
        margin-bottom: 0.75rem;
      }

      .planner-title {
        font-size: clamp(1.8rem, 3.5vw, 2.5rem);
        font-weight: 900;
        margin: 0 0 0.5rem;
        color: var(--text-heading, #f8fafc);
      }

      .planner-subtitle {
        font-size: 1rem;
        color: var(--text-muted, #94a3b8);
        max-width: 650px;
        margin: 0 0 1.5rem;
        line-height: 1.5;
      }

      .planner-nav-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1.25rem;
      }

      .planner-tab-link {
        text-decoration: none;
        color: var(--text-muted, #94a3b8);
        font-weight: 700;
        font-size: 0.92rem;
        padding: 0.6rem 1.2rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .planner-tab-link:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-heading, #f8fafc);
      }

      .planner-tab-link.active {
        background: #f59e0b;
        color: #0f172a;
        border-color: #f59e0b;
        font-weight: 800;
      }

      .nested-view-container {
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,

    template: () => html`
      <div class="planner-layout-root">
        <header class="planner-header-card">
          <span class="planner-badge">🎉 Owambe Event Engine</span>
          <h1 class="planner-title">Naija Party Chow & Budget Hub</h1>
          <p class="planner-subtitle">
            Planning a traditional wedding, 50th birthday, or Sunday family feast? Calculate bags of rice, meat kilos, vendor budgets, and kitchen prep tasks with zero stress.
          </p>

          <nav class="planner-nav-tabs" aria-label="Planner sections">
            ${router.Link({ to: "/planner", exact: true }, html`
              <a @class="isActive=>'active' 'planner-tab-link'">
                <span>⚖️</span> Guest Chow Calculator
              </a>
            `)}

            ${router.Link({ to: "/planner/budget" }, html`
              <a @class="isActive=>'active' 'planner-tab-link'">
                <span>💰</span> Budget & Vendor Tracker
              </a>
            `)}

            ${router.Link({ to: "/planner/checklist" }, html`
              <a @class="isActive=>'active' 'planner-tab-link'">
                <span>📋</span> Event Prep Checklist
              </a>
            `)}
          </nav>
        </header>

        <!-- Dynamic content view based on active tab -->
        <main class="nested-view-container">
          <div @if="isCalculator">
            ${GuestCalculatorView()}
          </div>
          <div @elseif="isBudget">
            ${BudgetTrackerView()}
          </div>
          <div @else>
            ${ChecklistView()}
          </div>
        </main>
      </div>
    `,
  })();
}
