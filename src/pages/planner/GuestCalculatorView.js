import { createComponent, html, css } from "udodi";

export const GuestCalculatorView = createComponent({
  name: "GuestCalculatorView",

  state() {
    return {
      guests: 50,
      menuType: "jollof", // 'jollof', 'full', 'grill'
    };
  },

  methods: {
    setGuests(event) {
      this.guests = Number(event.target.value) || 10;
    },

    setMenuType(_event, type) {
      this.menuType = type;
    },

    setPreset(_event, count) {
      this.guests = Number(count);
    },

    menuClass(type) {
      return this.menuType === type ? "menu-card active" : "menu-card";
    },

    // Calculated metrics
    getRiceAmount() {
      const g = this.guests;
      if (this.menuType === "grill") return "5 kg (Side Jollof)";
      const kg = Math.ceil(g * 0.28);
      const bags = (kg / 50).toFixed(1);
      return `${kg} kg (~${bags} bag of 50kg)`;
    },

    getMeatAmount() {
      const g = this.guests;
      const kg = Math.ceil(g * 0.35);
      return `${kg} kg (Beef / Assorted / Goat)`;
    },

    getOilAmount() {
      const g = this.guests;
      const liters = Math.ceil(g * 0.1);
      return `${liters} Liters (Groundnut / Palm oil)`;
    },

    getDrinksAmount() {
      const g = this.guests;
      const crates = Math.ceil(g * 1.5 / 24);
      return `${crates} Crates of Malt / Soft Drinks`;
    },

    getWaterAmount() {
      const g = this.guests;
      const packs = Math.ceil(g * 2 / 12);
      return `${packs} Packs of Bottled Water`;
    },

    getEstimatedCost() {
      const g = this.guests;
      let costPerHead = 3500;
      if (this.menuType === "full") costPerHead = 5500;
      if (this.menuType === "grill") costPerHead = 4200;
      const total = g * costPerHead;
      return "₦" + total.toLocaleString("en-NG");
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
      gap: 1.75rem;
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
      margin: 0;
    }

    .slider-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .slider-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .guests-count-badge {
      font-size: 2rem;
      font-weight: 900;
      color: #f59e0b;
    }

    .range-input {
      width: 100%;
      height: 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.15);
      outline: none;
      cursor: pointer;
      accent-color: #f59e0b;
    }

    .presets-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .preset-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #cbd5e1);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 999px;
      cursor: pointer;
    }

    .preset-btn:hover {
      background: #f59e0b;
      color: #0f172a;
    }

    .menu-options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .menu-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .menu-card:hover {
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-2px);
    }

    .menu-card.active {
      background: rgba(245, 158, 11, 0.1);
      border-color: #f59e0b;
    }

    .menu-card-title {
      font-weight: 800;
      font-size: 1rem;
      color: var(--text-heading, #f8fafc);
      margin: 0 0 0.3rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .menu-card-desc {
      font-size: 0.82rem;
      color: var(--text-muted, #94a3b8);
      margin: 0;
      line-height: 1.4;
    }

    .results-dashboard {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.7));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 18px;
      padding: 1.5rem;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
      margin-top: 1rem;
    }

    .result-item {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .res-label {
      font-size: 0.78rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .res-val {
      font-size: 1.15rem;
      font-weight: 900;
      color: #34d399;
    }

    .cost-highlight-box {
      margin-top: 1.5rem;
      padding: 1rem 1.25rem;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid #f59e0b;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cost-title {
      font-weight: 800;
      color: #f59e0b;
      font-size: 0.95rem;
    }

    .cost-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: #f59e0b;
    }
  `,

  template: () => html`
    <div class="guest-calculator-root">
      <h2 class="section-title">⚖️ Owambe Guest Food & Quantity Calculator</h2>

      <div class="slider-card">
        <div class="slider-header-row">
          <div>
            <div style="font-weight: 700; color: #cbd5e1;">Expected Guest Count:</div>
            <div style="font-size: 0.8rem; color: #94a3b8;">Adjust the slider or pick a preset</div>
          </div>
          <div class="guests-count-badge">
            <span @text="guests"></span> <span>People</span>
          </div>
        </div>

        <input
          type="range"
          min="10"
          max="500"
          step="5"
          class="range-input"
          @bind="guests"
        />

        <div class="presets-row">
          <span style="font-size: 0.75rem; color: #94a3b8;">Quick Presets:</span>
          <button type="button" class="preset-btn" @on="click=setPreset:20">Family Gathering (20)</button>
          <button type="button" class="preset-btn" @on="click=setPreset:50">Intimate Party (50)</button>
          <button type="button" class="preset-btn" @on="click=setPreset:100">Standard Owambe (100)</button>
          <button type="button" class="preset-btn" @on="click=setPreset:250">Big Wedding (250)</button>
          <button type="button" class="preset-btn" @on="click=setPreset:500">Odogwu Feast (500)</button>
        </div>
      </div>

      <div>
        <div style="font-weight: 700; margin-bottom: 0.75rem; color: #cbd5e1;">Select Menu Theme:</div>
        <div class="menu-options-grid">
          <div @class="menuClass:'jollof'" @on="click=setMenuType:'jollof'">
            <div class="menu-card-title">🍛 Party Jollof & Dodo</div>
            <p class="menu-card-desc">The crowd favorite. Firewood Jollof, fried plantains, salad, and peppered chicken.</p>
          </div>

          <div @class="menuClass:'full'" @on="click=setMenuType:'full'">
            <div class="menu-card-title">🍲 Full Feast (Rice + Swallows)</div>
            <p class="menu-card-desc">Jollof, Fried Rice, Pounded Yam, Egusi, Seafood Okro, and assorted meats.</p>
          </div>

          <div @class="menuClass:'grill'" @on="click=setMenuType:'grill'">
            <div class="menu-card-title">🍢 Night Suya & Small Chops</div>
            <p class="menu-card-desc">Lagos night vibe! Beef suya skewers, peppered gizzard, and golden puff-puff.</p>
          </div>
        </div>
      </div>

      <div class="results-dashboard">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #f8fafc;">
          📦 Market Procurement Estimate
        </h3>

        <div class="results-grid">
          <div class="result-item">
            <span class="res-label">🍚 Long Grain Rice</span>
            <span class="res-val" @text="getRiceAmount"></span>
          </div>

          <div class="result-item">
            <span class="res-label">🥩 Assorted Meat & Poultry</span>
            <span class="res-val" @text="getMeatAmount"></span>
          </div>

          <div class="result-item">
            <span class="res-label">🛢️ Cooking Oil & Palm Oil</span>
            <span class="res-val" @text="getOilAmount"></span>
          </div>

          <div class="result-item">
            <span class="res-label">🍾 Chilled Soft Drinks</span>
            <span class="res-val" @text="getDrinksAmount"></span>
          </div>

          <div class="result-item">
            <span class="res-label">💧 Pure Water / Bottled</span>
            <span class="res-val" @text="getWaterAmount"></span>
          </div>
        </div>

        <div class="cost-highlight-box">
          <span class="cost-title">Estimated Market Raw Food Budget:</span>
          <span class="cost-val" @text="getEstimatedCost"></span>
        </div>
      </div>
    </div>
  `,
});
