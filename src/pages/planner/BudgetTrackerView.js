import { createComponent, html, css } from "udodi";

const INITIAL_EXPENSES = [
  { id: 1, name: "1 Quarter Cow & Goat Meat (Mile 12)", category: "Meat", amount: 350000 },
  { id: 2, name: "2 Bags of Royal Stallion Rice", category: "Grains", amount: 190000 },
  { id: 3, name: "Fresh Tomatoes, Tatashe & Rodo Basket", category: "Market", amount: 65000 },
  { id: 4, name: "Groundnut Oil & Palm Oil (25L Jerrycans)", category: "Oils", amount: 95000 },
  { id: 5, name: "Soft Drinks, Malts & Water (Wholesale)", category: "Drinks", amount: 140000 },
  { id: 6, name: "Block Ice & Drum Cooling Service", category: "Logistics", amount: 30000 },
];

export const BudgetTrackerView = createComponent({
  name: "BudgetTrackerView",

  state() {
    return {
      budgetCap: 1200000,
      expenses: [...INITIAL_EXPENSES],
      newItemName: "",
      newItemCategory: "Market",
      newItemAmount: 25000,
    };
  },

  computed: {
    getTotalSpent(ctx) {
      return (ctx.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    },

    getTotalSpentFormatted(ctx) {
      return "₦" + ctx.getTotalSpent.toLocaleString("en-NG");
    },

    getBudgetCapFormatted(ctx) {
      return "₦" + Number(ctx.budgetCap).toLocaleString("en-NG");
    },

    getRemainingBudgetFormatted(ctx) {
      const remaining = Number(ctx.budgetCap) - ctx.getTotalSpent;
      return "₦" + remaining.toLocaleString("en-NG");
    },

    getPercentUsed(ctx) {
      const cap = Number(ctx.budgetCap) || 1;
      return Math.min(100, Math.round((ctx.getTotalSpent / cap) * 100));
    },

    getProgressWidth(ctx) {
      return `width: ${ctx.getPercentUsed}%;`;
    },

    getBudgetStatus(ctx) {
      const p = ctx.getPercentUsed;
      if (p < 75) return "Healthy! Plenty change left.";
      if (p <= 95) return "Caution: Approaching your budget ceiling.";
      return "Alert: You have reached or exceeded your budget limit!";
    },
  },

  methods: {
    addExpense() {
      const name = (this.newItemName || "").trim();
      const amount = Number(this.newItemAmount);
      if (!name || isNaN(amount) || amount <= 0) return;

      const newEntry = {
        id: Date.now(),
        name,
        category: this.newItemCategory,
        amount,
      };

      this.expenses = [newEntry, ...this.expenses];
      this.newItemName = "";
      this.newItemAmount = 25000;
    },

    removeExpense(_event, id) {
      const numericId = Number(id);
      this.expenses = this.expenses.filter((e) => e.id !== numericId);
    },

    formatNaira(amount) {
      return "₦" + Number(amount).toLocaleString("en-NG");
    },
  },

  style: css`
    :scope {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 20px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
      margin: 0;
    }

    .budget-summary-banner {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .summary-metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-label {
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--text-heading, #f8fafc);
    }

    .summary-val.spent {
      color: #f59e0b;
    }

    .summary-val.remaining {
      color: #10b981;
    }

    .progress-bar-wrap {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .progress-track {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #f59e0b);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .add-expense-form {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 0.75rem;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.25rem;
    }

    @media (max-width: 750px) {
      .add-expense-form {
        grid-template-columns: 1fr;
      }
    }

    .expense-input, .expense-select {
      padding: 0.65rem 0.9rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: var(--text-heading, #f8fafc);
      font-size: 0.9rem;
      outline: none;
    }

    .btn-add-item {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.7rem 1.4rem;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-add-item:hover {
      background: #059669;
    }

    .expenses-table-wrap {
      overflow-x: auto;
    }

    .expenses-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    .expenses-table th {
      color: var(--text-muted, #94a3b8);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .expenses-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-heading, #f1f5f9);
    }

    .category-badge-table {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      color: #cbd5e1;
    }

    .btn-del-expense {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
    }

    .btn-del-expense:hover {
      opacity: 1;
    }
  `,

  template: () => html`
    <div class="budget-tracker-root">
      <h2 class="section-title">💰 Owambe Budget & Vendor Tracker</h2>

      <div class="budget-summary-banner">
        <div class="summary-metric">
          <span class="summary-label">Total Allocated Cap</span>
          <span class="summary-val" @text="getBudgetCapFormatted"></span>
        </div>

        <div class="summary-metric">
          <span class="summary-label">Committed Expenses</span>
          <span class="summary-val spent" @text="getTotalSpentFormatted"></span>
        </div>

        <div class="summary-metric">
          <span class="summary-label">Safe Balance Left</span>
          <span class="summary-val remaining" @text="getRemainingBudgetFormatted"></span>
        </div>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-track">
          <div class="progress-fill" @style="getProgressWidth"></div>
        </div>
        <div class="progress-meta">
          <span><span @text="getPercentUsed"></span>% of cap spent</span>
          <span @text="getBudgetStatus"></span>
        </div>
      </div>

      <div class="add-expense-form">
        <input
          type="text"
          class="expense-input"
          placeholder="e.g. 50kg Bags of Semovita"
          @bind="newItemName"
        />

        <select class="expense-select" @bind="newItemCategory">
          <option value="Market">Market Produce</option>
          <option value="Meat">Meat & Protein</option>
          <option value="Grains">Grains & Rice</option>
          <option value="Oils">Cooking Oils</option>
          <option value="Drinks">Drinks & Water</option>
          <option value="Logistics">Logistics & Gas</option>
        </select>

        <input
          type="number"
          class="expense-input"
          placeholder="Amount (₦)"
          @bind="newItemAmount"
        />

        <button type="button" class="btn-add-item" @on="click=addExpense">
          + Add Line Item
        </button>
      </div>

      <div class="expenses-table-wrap">
        <table class="expenses-table">
          <thead>
            <tr>
              <th>Expense Item</th>
              <th>Category</th>
              <th>Estimated Cost</th>
              <th style="width: 50px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr @for="exp expenses" @key="exp.id">
              <td><strong @text="exp.name"></strong></td>
              <td><span class="category-badge-table" @text="exp.category"></span></td>
              <td style="font-weight: 800; color: #f59e0b;" @text="formatNaira:exp.amount"></td>
              <td>
                <button type="button" class="btn-del-expense" @on="click=removeExpense:exp.id" title="Delete expense">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
});
