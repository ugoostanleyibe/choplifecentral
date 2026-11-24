import { createComponent, html, css, effect } from "udodi";
import { appStore } from "../store/appStore.js";
import { router } from "../router.js";

/**
 * StorePlaygroundPage Component
 * Live interactive laboratory showcasing Choplifecentral's upgraded Store implementation:
 * - Reactive global state, actions (sync + async), selectors, subscriptions, and batch()
 * - Missing action error/warning handling (throwOnMissing / strict)
 * - Owambe Event Planner feature module (defineStore / useStore / destroyStore) with state proxy & touch()
 * - IndexedDB persistence with hydration status, flush, clear, stop, restart
 * - Live DevTools event stream
 */
export const StorePlaygroundPage = createComponent({
  name: "StorePlaygroundPage",

  state() {
    return {
      // Global store mirrors
      theme: appStore.store.get("theme") || "dark",
      spiceTolerance: appStore.store.get("spiceTolerance") || 2,
      servingsMultiplier: appStore.store.get("servingsMultiplier") || 1,
      themeSummaryText: appStore.themeSummary(),
      vipStatusText: appStore.vipAccessStatus(),
      globalKeyCount: appStore.store.keys().length,
      dispatchFeedback: "Ready — test any action, batch, or selector below.",

      // Planner module mirrors
      moduleActive: Boolean(appStore.getPlannerStore()),
      eventName: appStore.getPlannerStore()?.state.eventName || "",
      guestCount: appStore.getPlannerStore()?.state.guestCount || 50,
      budgetTotal: appStore.getPlannerStore()?.state.budgetTotal || 0,
      expenses: appStore.getPlannerStore()?.state.expenses || [],
      prepNotes: appStore.getPlannerStore()?.state.prepNotes || [],
      draft: appStore.getPlannerStore()?.state.draft || "",
      newExpenseItem: "",
      newExpenseAmount: "",
      newNoteText: "",
      totalSpent: 0,
      remainingBudget: 0,
      completedNotesCount: 0,
      plannerSummaryText: "Planner module inactive",

      // Persistence mirrors
      globalPersistStatus: appStore.getPersistenceStatus().globalStatus,
      plannerPersistStatus: appStore.getPersistenceStatus().plannerStatus,
      persistError: appStore.getPersistenceStatus().lastError,

      // Live events
      eventsText: appStore.getEvents().join("\n") || "(no store events recorded yet)",
    };
  },

  methods: {
    syncFromStore() {
      this.theme = appStore.store.get("theme") || "dark";
      this.spiceTolerance = appStore.store.get("spiceTolerance") || 2;
      this.servingsMultiplier = appStore.store.get("servingsMultiplier") || 1;
      this.themeSummaryText = appStore.themeSummary();
      this.vipStatusText = appStore.vipAccessStatus();
      this.globalKeyCount = appStore.store.keys().length;

      const planner = appStore.getPlannerStore();
      const selectors = appStore.getPlannerSelectors();
      this.moduleActive = Boolean(planner);

      if (planner && selectors) {
        this.eventName = planner.state.eventName || "";
        this.guestCount = planner.state.guestCount || 50;
        this.budgetTotal = planner.state.budgetTotal || 0;
        this.expenses = Array.isArray(planner.state.expenses)
          ? planner.state.expenses.map((e) => ({ ...e }))
          : [];
        this.prepNotes = Array.isArray(planner.state.prepNotes)
          ? planner.state.prepNotes.map((n) => ({ ...n }))
          : [];
        this.draft = planner.state.draft || "";
        this.totalSpent = selectors.expenseTotal();
        this.remainingBudget = selectors.remainingBudget();
        this.completedNotesCount = selectors.completedNotesCount();
        this.plannerSummaryText = selectors.plannerSummary();
      } else {
        this.expenses = [];
        this.prepNotes = [];
        this.draft = "";
        this.totalSpent = 0;
        this.remainingBudget = 0;
        this.completedNotesCount = 0;
        this.plannerSummaryText = "Owambe Planner module is destroyed (useStore('eventPlanner') is undefined)";
      }
    },

    syncPersistence(status) {
      const next = status || appStore.getPersistenceStatus();
      this.globalPersistStatus = next.globalStatus;
      this.plannerPersistStatus = next.plannerStatus;
      this.persistError = next.lastError;
    },

    syncEvents(events) {
      const list = events || appStore.getEvents();
      this.eventsText = list.length ? list.join("\n") : "(no store events recorded yet)";
    },

    // Global action dispatchers
    setTheme(_event, theme) {
      const next = appStore.store.dispatch("app:setTheme", theme);
      this.dispatchFeedback = `Dispatched "app:setTheme" → "${next}"`;
      this.syncFromStore();
    },

    toggleTheme() {
      const next = appStore.store.dispatch("app:toggleTheme");
      this.dispatchFeedback = `Dispatched "app:toggleTheme" → "${next}"`;
      this.syncFromStore();
    },

    setSpice(_event, level) {
      const next = appStore.store.dispatch("app:setSpiceTolerance", Number(level));
      this.dispatchFeedback = `Dispatched "app:setSpiceTolerance" → ${next}`;
      this.syncFromStore();
    },

    setMultiplier(_event, mult) {
      const next = appStore.store.dispatch("app:setServingsMultiplier", Number(mult));
      this.dispatchFeedback = `Dispatched "app:setServingsMultiplier" → ${next}x`;
      this.syncFromStore();
    },

    applyPartyPreset(_event, preset) {
      const res = appStore.store.dispatch("app:applyPartyPreset", preset);
      this.dispatchFeedback = `Batched update "app:applyPartyPreset" (${preset}) → Scale: ${res.servingsMultiplier}x, Spice: ${res.spiceTolerance}`;
      this.syncFromStore();
    },

    async runAsyncTelemetry() {
      this.dispatchFeedback = 'Async dispatching "app:asyncSyncKitchenTelemetry"…';
      const res = await appStore.store.dispatch("app:asyncSyncKitchenTelemetry", 150);
      this.dispatchFeedback = `Async result: ${res}`;
      this.syncFromStore();
    },

    testMissingActionWarn() {
      const res = appStore.store.dispatch("app:nonExistentAction");
      this.dispatchFeedback = `Missing action (default): logged warning & returned ${String(res)}`;
    },

    testMissingActionStrict() {
      try {
        appStore.store.dispatch("app:nonExistentAction", null, { strict: true });
      } catch (err) {
        this.dispatchFeedback = `Missing action ({ strict: true }): threw "${err.message}"`;
      }
    },

    // Planner module methods
    isModuleActive() {
      return this.moduleActive;
    },

    isModuleDestroyed() {
      return !this.moduleActive;
    },

    updateEventName() {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("setEventName", this.eventName);
      this.syncFromStore();
    },

    updateGuestCount(_event, amount) {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("setGuestCount", (Number(this.guestCount) || 50) + Number(amount));
      this.syncFromStore();
    },

    addExpense() {
      const planner = appStore.getPlannerStore();
      if (!planner || !this.newExpenseItem.trim()) return;
      planner.dispatch("addExpense", {
        item: this.newExpenseItem,
        amount: Number(this.newExpenseAmount) || 0,
      });
      this.newExpenseItem = "";
      this.newExpenseAmount = "";
      this.syncFromStore();
    },

    removeExpense(_event, id) {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("removeExpense", Number(id));
      this.syncFromStore();
    },

    addPrepNote() {
      const planner = appStore.getPlannerStore();
      if (!planner || !this.newNoteText.trim()) return;
      planner.dispatch("addPrepNote", this.newNoteText);
      this.newNoteText = "";
      this.syncFromStore();
    },

    togglePrepNote(_event, id) {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("togglePrepNote", Number(id));
      this.syncFromStore();
    },

    removePrepNote(_event, id) {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("removePrepNote", Number(id));
      this.syncFromStore();
    },

    saveDraft(event) {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      const value = event?.target?.value ?? this.draft;
      this.draft = value;
      planner.dispatch("setDraft", value);
    },

    applyPresetBudget() {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("applyPresetBudget");
      this.syncFromStore();
    },

    resetPlanner() {
      const planner = appStore.getPlannerStore();
      if (!planner) return;
      planner.dispatch("resetPlanner");
      this.syncFromStore();
    },

    destroyPlanner() {
      appStore.destroyPlannerStore();
      this.syncFromStore();
    },

    recreatePlanner() {
      appStore.ensurePlannerStore();
      this.syncFromStore();
    },

    // Persistence controls
    async flushPersistence() {
      await appStore.flushPersistence();
    },

    async clearPersistence() {
      await appStore.clearPersistence();
    },

    stopPersistence() {
      appStore.stopPersistence();
    },

    restartPersistence() {
      appStore.restartPersistence();
    },

    clearLog() {
      appStore.clearEvents();
    },

    // UI helpers
    isDark() {
      return this.theme === "dark";
    },

    spiceBtnClass(lvl) {
      return Number(this.spiceTolerance) === Number(lvl) ? "btn btn-active" : "btn";
    },

    multBtnClass(m) {
      return Number(this.servingsMultiplier) === Number(m) ? "btn btn-active" : "btn";
    },
  },

  onMount(_root, ctx) {
    ctx.syncFromStore();
    ctx.syncPersistence();
    ctx.syncEvents();

    const stopReactive = effect(() => {
      appStore.store.get("theme");
      appStore.store.get("spiceTolerance");
      appStore.store.get("servingsMultiplier");
      appStore.themeSummary();
      appStore.vipAccessStatus();

      const planner = appStore.getPlannerStore();
      const selectors = appStore.getPlannerSelectors();
      if (planner && selectors) {
        planner.state.eventName;
        planner.state.guestCount;
        planner.state.budgetTotal;
        planner.state.expenses;
        planner.state.prepNotes;
        planner.state.draft;
        selectors.expenseTotal();
        selectors.remainingBudget();
        selectors.completedNotesCount();
        selectors.plannerSummary();
      }

      ctx.syncFromStore();
    });

    const stopPersist = appStore.onPersistenceStatus((status) => {
      ctx.syncPersistence(status);
      ctx.syncFromStore();
    });

    const stopEvents = appStore.onEvents((events) => {
      ctx.syncEvents(events);
    });

    ctx.cleanup(() => {
      stopReactive();
      stopPersist();
      stopEvents();
    });
  },

  style: css`
    :scope {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem 0;
    }

    .lab-hero {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.1));
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 20px;
      padding: 2.2rem 2rem;
      text-align: center;
    }

    .lab-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      font-weight: 800;
      font-size: 0.8rem;
      padding: 4px 14px;
      border-radius: 999px;
      margin-bottom: 0.75rem;
    }

    .lab-title {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 900;
      color: var(--text-heading, #f8fafc);
      margin: 0 0 0.5rem;
    }

    .lab-desc {
      color: var(--text-muted, #94a3b8);
      max-width: 700px;
      margin: 0 auto;
      font-size: 0.98rem;
      line-height: 1.6;
    }

    .lab-section {
      background: var(--card-bg, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: 18px;
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      padding-bottom: 0.85rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      align-items: center;
    }

    .row-label {
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--text-muted, #94a3b8);
      min-width: 130px;
    }

    .btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      color: var(--text-heading, #f8fafc);
      padding: 0.42rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }

    .btn-active {
      background: #f59e0b !important;
      color: #0f172a !important;
      border-color: #f59e0b !important;
      font-weight: 800;
    }

    .btn-danger {
      border-color: #ef4444;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .btn-danger:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .btn-success {
      border-color: #10b981;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .btn-success:hover {
      background: #10b981;
      color: #ffffff;
    }

    input[type="text"], input[type="number"] {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
      border-radius: 8px;
      padding: 0.45rem 0.75rem;
      color: #f8fafc;
      font-size: 0.9rem;
      box-sizing: border-box;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-box {
      background: rgba(0, 0, 0, 0.3);
      border-left: 3px solid #f59e0b;
      padding: 0.65rem 0.9rem;
      border-radius: 6px;
      font-family: ui-monospace, monospace;
      font-size: 0.83rem;
      color: #cbd5e1;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .metric-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .metric-title {
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
      font-weight: 600;
    }

    .metric-val {
      font-size: 1.4rem;
      font-weight: 900;
      color: #f59e0b;
    }

    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .item-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }

    .item-done {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .log-display {
      background: #090d16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 0.9rem 1.1rem;
      color: #38bdf8;
      font-family: ui-monospace, monospace;
      font-size: 0.8rem;
      white-space: pre-wrap;
      max-height: 250px;
      overflow-y: auto;
      margin: 0;
    }
  `,

  template: () => html`
    <div class="store-lab-root">
      <div class="lab-hero">
        <span class="lab-badge">⚡ Advanced Udodi Architecture</span>
        <h1 class="lab-title">ChopLife Central Store Lab</h1>
        <p class="lab-desc">
          Live reactive control panel exercising the upgraded core Store implementation alongside
          the companion appStore. Experiment with sync/async action dispatching, strict error handling,
          in-place mutations with touch(), nested batch staging, and IndexedDB persistence.
        </p>
      </div>

      <!-- 1. Global State & Actions -->
      <section class="lab-section">
        <div class="section-header">
          <h2 class="section-title">1. Global App State &amp; Derived Selectors</h2>
          <span class="pill" @text="themeSummaryText"></span>
        </div>

        <div class="row">
          <span class="row-label">Theme Mode:</span>
          <button type="button" @class="isDark=>'btn-active' 'btn'" @on="click=setTheme:'dark'">🌙 Dark</button>
          <button type="button" @class="isDark=>'btn' 'btn-active'" @on="click=setTheme:'light'">☀️ Light</button>
          <button type="button" class="btn" @on="click=toggleTheme">Toggle Sync</button>
        </div>

        <div class="row">
          <span class="row-label">Spice Tolerance:</span>
          <button type="button" @class="spiceBtnClass:1" @on="click=setSpice:1">1: Mild</button>
          <button type="button" @class="spiceBtnClass:2" @on="click=setSpice:2">2: Medium</button>
          <button type="button" @class="spiceBtnClass:3" @on="click=setSpice:3">3: Hot</button>
          <button type="button" @class="spiceBtnClass:4" @on="click=setSpice:4">4: Firewood Peppeh</button>
        </div>

        <div class="row">
          <span class="row-label">Portion Scale:</span>
          <button type="button" @class="multBtnClass:1" @on="click=setMultiplier:1">1x Standard</button>
          <button type="button" @class="multBtnClass:2" @on="click=setMultiplier:2">2x Double</button>
          <button type="button" @class="multBtnClass:4" @on="click=setMultiplier:4">4x Owambe Crowd</button>
        </div>

        <div class="row">
          <span class="row-label">Batched Presets:</span>
          <button type="button" class="btn" @on="click=applyPartyPreset:'owambe'">🎉 Owambe Crowd</button>
          <button type="button" class="btn" @on="click=applyPartyPreset:'family'">👨‍👩‍👦 Family Sunday</button>
          <button type="button" class="btn" @on="click=applyPartyPreset:'solo'">🧑‍🍳 Solo Chop</button>
        </div>

        <div class="row">
          <span class="row-label">Actions Engine:</span>
          <button type="button" class="btn" @on="click=runAsyncTelemetry">Async Telemetry</button>
          <button type="button" class="btn" @on="click=testMissingActionWarn">Missing Action (warn)</button>
          <button type="button" class="btn" @on="click=testMissingActionStrict">Missing Action (strict error)</button>
        </div>

        <div class="status-box">
          <div>Status: <span @text="dispatchFeedback"></span></div>
          <div>VIP Vault Status: <strong @text="vipStatusText"></strong> · Active Store Keys: <strong @text="globalKeyCount"></strong></div>
        </div>
      </section>

      <!-- 2. Owambe Event Planner Module -->
      <section class="lab-section">
        <div class="section-header">
          <h2 class="section-title">2. Owambe Event Planner Module (defineStore / useStore / destroyStore)</h2>
          <div class="row">
            <button type="button" class="btn-danger" @if="isModuleActive" @on="click=destroyPlanner">
              Destroy Module
            </button>
            <button type="button" class="btn-success" @if="isModuleDestroyed" @on="click=recreatePlanner">
              Recreate Module
            </button>
          </div>
        </div>

        <p class="status-box" @text="plannerSummaryText"></p>

        <div @if="isModuleActive">
          <div class="cards-grid">
            <div class="metric-card">
              <span class="metric-title">Total Budget</span>
              <span class="metric-val">₦{{ budgetTotal.toLocaleString() }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-title">Expenses Total</span>
              <span class="metric-val">₦{{ totalSpent.toLocaleString() }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-title">Remaining Balance</span>
              <span class="metric-val">₦{{ remainingBudget.toLocaleString() }}</span>
            </div>
            <div class="metric-card">
              <span class="metric-title">Guests</span>
              <span class="metric-val">{{ guestCount }}</span>
            </div>
          </div>

          <div class="row" style="margin-top: 1rem;">
            <input type="text" @bind="eventName" placeholder="Event name" style="flex: 1;" />
            <button type="button" class="btn" @on="click=updateEventName">Rename Event</button>
            <button type="button" class="btn" @on="click=updateGuestCount:25">+25 Guests</button>
            <button type="button" class="btn" @on="click=applyPresetBudget">Batched VIP Preset</button>
            <button type="button" class="btn" @on="click=resetPlanner">Reset Module</button>
          </div>

          <div class="row" style="margin-top: 0.5rem;">
            <input
              type="text"
              @bind="draft"
              @on="input=saveDraft"
              placeholder="Debounced catering notes (auto-persists to IndexedDB after 100ms)…"
              style="flex: 1;"
            />
          </div>

          <h3 style="margin: 1.25rem 0 0.4rem; font-size: 1rem; color: #f59e0b;">
            Kitchen Prep Tasks (In-Place Mutation &amp; touch() Demo)
          </h3>
          <div class="row">
            <input type="text" @bind="newNoteText" placeholder="Add cooking prep task…" style="flex: 1;" />
            <button type="button" class="btn" @on="click=addPrepNote">+ Add Task</button>
          </div>

          <ul class="item-list" style="margin-top: 0.6rem;">
            <li class="item-row" @for="note prepNotes" @key="note.id">
              <span @class="note.done=>'item-done' ''" @text="note.text"></span>
              <div class="row">
                <button type="button" class="btn" @on="click=togglePrepNote:note.id">
                  {{ note.done ? "✓ Done" : "Mark Done" }}
                </button>
                <button type="button" class="btn btn-danger" @on="click=removePrepNote:note.id">✕</button>
              </div>
            </li>
          </ul>

          <h3 style="margin: 1.25rem 0 0.4rem; font-size: 1rem; color: #f59e0b;">
            Owambe Catering Expenses List
          </h3>
          <div class="row">
            <input type="text" @bind="newExpenseItem" placeholder="Expense description…" style="flex: 2;" />
            <input type="number" @bind="newExpenseAmount" placeholder="Amount (₦)" style="flex: 1;" />
            <button type="button" class="btn" @on="click=addExpense">+ Add Expense</button>
          </div>

          <ul class="item-list" style="margin-top: 0.6rem;">
            <li class="item-row" @for="exp expenses" @key="exp.id">
              <span><strong>{{ exp.item }}</strong> ({{ exp.category }})</span>
              <div class="row">
                <span class="pill">₦{{ exp.amount.toLocaleString() }}</span>
                <button type="button" class="btn btn-danger" @on="click=removeExpense:exp.id">✕</button>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. IndexedDB Persistence & Hydration -->
      <section class="lab-section">
        <div class="section-header">
          <h2 class="section-title">3. IndexedDB Offline Persistence &amp; Hydration</h2>
          <div class="row">
            <span>Global: <span class="pill" @text="globalPersistStatus"></span></span>
            <span>Planner: <span class="pill" @text="plannerPersistStatus"></span></span>
          </div>
        </div>

        <div class="row">
          <button type="button" class="btn" @on="click=flushPersistence">💾 Flush Now</button>
          <button type="button" class="btn" @on="click=clearPersistence">🗑️ Clear Stored Data</button>
          <button type="button" class="btn" @on="click=stopPersistence">⏹️ Stop Syncing</button>
          <button type="button" class="btn" @on="click=restartPersistence">▶️ Restart Persistence</button>
        </div>
      </section>

      <!-- 4. Live Store DevTools Event Log -->
      <section class="lab-section">
        <div class="section-header">
          <h2 class="section-title">4. Live Store DevTools Event Stream</h2>
          <button type="button" class="btn" @on="click=clearLog">Clear Log</button>
        </div>
        <pre class="log-display" @text="eventsText"></pre>
      </section>
    </div>
  `,
});
