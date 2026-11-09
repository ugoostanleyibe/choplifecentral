import { createComponent, html, css, store } from "udodi";
import { foodStore } from "../store/foodStore.js";

export const Toast = createComponent({
  name: "Toast",

  state() {
    return {
      message: "",
      type: "info",
      visible: false,
    };
  },

  onMount(_root, ctx) {
    const checkToast = () => {
      const current = store.get("toast");
      if (current) {
        ctx.message = current.message || "";
        ctx.type = current.type || "info";
        ctx.visible = !!current.visible;
      }
    };

    checkToast();
    const interval = setInterval(checkToast, 150);
    ctx.cleanup(() => clearInterval(interval));
  },

  methods: {
    dismiss() {
      foodStore.dismissToast();
      this.visible = false;
    },

    toastClass() {
      return `toast-pill ${this.type}`;
    },

    isVisible() {
      return this.visible;
    },
  },

  style: css`
    :scope {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      pointer-events: none;
    }

    .toast-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast-pill {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-radius: 999px;
      font-size: 0.92rem;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s ease;
    }

    .toast-pill.success {
      background: #059669;
      color: #ffffff;
      border: 1px solid #10b981;
    }

    .toast-pill.error {
      background: #dc2626;
      color: #ffffff;
      border: 1px solid #ef4444;
    }

    .toast-pill.info {
      background: #0284c7;
      color: #ffffff;
      border: 1px solid #38bdf8;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.8;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0 4px;
      line-height: 1;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  template: () => html`
    <div class="toast-wrapper">
      <div class="toast-container" @show="isVisible">
        <div @class="toastClass">
          <span @text="message"></span>
          <button type="button" class="toast-close" @on="click=dismiss">×</button>
        </div>
      </div>
    </div>
  `,
});
