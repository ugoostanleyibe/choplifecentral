import { createComponent, html, css } from "udodi";

const DEFAULT_TASKS = [
  { id: 1, text: "Buy dry firewood & rent big iron cauldrons (Koko irin)", done: true, priority: "High" },
  { id: 2, name: "task2", text: "Pre-season assorted meats and stockfish 24 hours ahead", done: true, priority: "High" },
  { id: 3, text: "Parboil 2 bags of long grain rice and drain in woven baskets", done: false, priority: "High" },
  { id: 4, text: "Blend fresh pepper mix (Tatashe, Rodo, Onions) and boil down", done: false, priority: "Medium" },
  { id: 5, text: "Procure block ice & arrange large drink cooling drums", done: false, priority: "High" },
  { id: 6, text: "Assemble takeaway packs, toothpicks, and custom serviettes", done: false, priority: "Low" },
  { id: 7, text: "Confirm arrival time for head caterer (Mama Put chef)", done: false, priority: "High" },
];

export const ChecklistView = createComponent({
  name: "ChecklistView",

  state() {
    return {
      tasks: [...DEFAULT_TASKS],
      newText: "",
      filter: "all", // 'all', 'pending', 'done'
    };
  },

  methods: {
    addTask() {
      const text = (this.newText || "").trim();
      if (!text) return;
      this.tasks = [
        ...this.tasks,
        { id: Date.now(), text, done: false, priority: "Medium" },
      ];
      this.newText = "";
    },

    toggleTask(_event, id) {
      const numericId = Number(id);
      this.tasks = this.tasks.map((t) =>
        t.id === numericId ? { ...t, done: !t.done } : t
      );
    },

    deleteTask(_event, id) {
      const numericId = Number(id);
      this.tasks = this.tasks.filter((t) => t.id !== numericId);
    },

    setFilter(_event, f) {
      this.filter = f;
    },

    getFilteredTasks() {
      if (this.filter === "pending") {
        return this.tasks.filter((t) => !t.done);
      }
      if (this.filter === "done") {
        return this.tasks.filter((t) => t.done);
      }
      return this.tasks;
    },

    getTotalDone() {
      return this.tasks.filter((t) => t.done).length;
    },

    getTotalCount() {
      return this.tasks.length;
    },

    filterClass(f) {
      return this.filter === f ? "filter-btn active" : "filter-btn";
    },

    taskItemClass(done) {
      return done ? "checklist-row done" : "checklist-row";
    },

    checkboxIcon(done) {
      return done ? "✓" : "";
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
      gap: 1.5rem;
    }

    .checklist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
      margin: 0;
    }

    .badge-counter {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      font-size: 0.85rem;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .new-task-row {
      display: flex;
      gap: 0.75rem;
    }

    .task-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
      border-radius: 12px;
      color: var(--text-heading, #f8fafc);
      font-size: 0.95rem;
      outline: none;
    }

    .btn-add-task {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.4rem;
      border-radius: 12px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-add-task:hover {
      background: #059669;
    }

    .filter-pills-row {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-muted, #94a3b8);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 999px;
      cursor: pointer;
    }

    .filter-btn:hover {
      color: var(--text-heading, #f8fafc);
    }

    .filter-btn.active {
      background: #f59e0b;
      color: #0f172a;
      border-color: #f59e0b;
    }

    .checklist-items {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .checklist-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.85rem 1.1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .checklist-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .checklist-row.done {
      background: rgba(16, 185, 129, 0.04);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .custom-box {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 900;
      color: white;
      flex-shrink: 0;
    }

    .checklist-row.done .custom-box {
      background: #10b981;
      border-color: #10b981;
    }

    .task-label {
      flex: 1;
      font-size: 0.92rem;
      color: var(--text-heading, #f1f5f9);
    }

    .checklist-row.done .task-label {
      text-decoration: line-through;
      color: var(--text-muted, #94a3b8);
    }

    .btn-trash {
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      opacity: 0.6;
      font-size: 1rem;
    }

    .btn-trash:hover {
      opacity: 1;
    }
  `,

  template: () => html`
    <div class="checklist-view-root">
      <div class="checklist-header">
        <h2 class="section-title">📋 Kitchen Prep & Owambe Checklist</h2>
        <span class="badge-counter">
          <span @text="getTotalDone"></span> / <span @text="getTotalCount"></span> Tasks Completed
        </span>
      </div>

      <div class="new-task-row">
        <input
          type="text"
          class="task-input"
          placeholder="Add a new prep task (e.g. Wash and shred Ugwu leaves)..."
          @bind="newText"
        />
        <button type="button" class="btn-add-task" @on="click=addTask">
          + Add Task
        </button>
      </div>

      <div class="filter-pills-row">
        <button type="button" @class="filterClass:'all'" @on="click=setFilter:'all'">All Tasks</button>
        <button type="button" @class="filterClass:'pending'" @on="click=setFilter:'pending'">Pending</button>
        <button type="button" @class="filterClass:'done'" @on="click=setFilter:'done'">Completed</button>
      </div>

      <div class="checklist-items">
        <div
          @for="item tasks"
          @key="item.id"
          @class="taskItemClass:item.done"
          @on="click=toggleTask:item.id"
        >
          <div class="custom-box">
            <span @text="checkboxIcon:item.done"></span>
          </div>
          <span class="task-label" @text="item.text"></span>
          <button type="button" class="btn-trash" @on="click.stop=deleteTask:item.id" title="Remove task">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `,
});
