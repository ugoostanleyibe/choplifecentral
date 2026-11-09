import { createComponent, html, css } from "udodi";
import { foodStore } from "../store/foodStore.js";

export function createSecretUnlockPage(router) {
  return createComponent({
    name: "SecretUnlockPage",

    state() {
      return {
        passcode: "",
        errorMessage: "",
      };
    },

    methods: {
      handleUnlock(event) {
        event.preventDefault();
        const code = this.passcode || "";
        const success = foodStore.unlockVault(code);

        if (success) {
          const redirectTo = router.route.query?.redirect || "/secret-vault";
          router.replace(redirectTo);
        } else {
          this.errorMessage = "Incorrect passcode! Hint: Use VIPCHOPPER";
        }
      },

      fillHint() {
        this.passcode = "VIPCHOPPER";
        this.errorMessage = "";
      },

      hasError() {
        return !!this.errorMessage;
      },
    },

    style: css`
      :scope {
        max-width: 500px;
        margin: 2rem auto;
      }

      .lock-card {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 24px;
        padding: 2.5rem 2rem;
        text-align: center;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
      }

      .lock-icon-giant {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4));
      }

      .lock-title {
        font-size: 1.8rem;
        font-weight: 900;
        color: var(--text-heading, #f8fafc);
        margin: 0 0 0.5rem;
      }

      .lock-desc {
        font-size: 0.95rem;
        color: var(--text-muted, #94a3b8);
        line-height: 1.5;
        margin: 0 0 1.75rem;
      }

      .lock-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .passcode-input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.7);
        border: 2px solid var(--border-color, rgba(255, 255, 255, 0.15));
        color: #f59e0b;
        font-size: 1.2rem;
        font-weight: 800;
        text-align: center;
        letter-spacing: 0.1em;
        outline: none;
        transition: border-color 0.2s;
      }

      .passcode-input:focus {
        border-color: #f59e0b;
      }

      .error-alert {
        color: #ef4444;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .btn-unlock {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0f172a;
        font-weight: 900;
        font-size: 1rem;
        padding: 0.85rem;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: transform 0.15s;
      }

      .btn-unlock:hover {
        transform: translateY(-2px);
      }

      .hint-box {
        margin-top: 1.25rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        font-size: 0.82rem;
        color: var(--text-muted, #94a3b8);
      }

      .btn-use-hint {
        background: transparent;
        border: none;
        color: #10b981;
        font-weight: 800;
        cursor: pointer;
        text-decoration: underline;
      }
    `,

    template: () => html`
      <div class="secret-unlock-root">
        <div class="lock-card">
          <div class="lock-icon-giant">🔒</div>
          <h1 class="lock-title">VIP Kitchen Protected</h1>
          <p class="lock-desc">
            You were intercepted by Udodi Router's <code>beforeEnter</code> navigation guard because the Grand Chef's Vault is restricted! Enter the secret passcode to proceed.
          </p>

          <form class="lock-form" @on="submit=handleUnlock">
            <input
              type="text"
              class="passcode-input"
              placeholder="ENTER PASSCODE"
              @bind="passcode"
              autofocus
            />

            <div class="error-alert" @show="hasError">
              <span @text="errorMessage"></span>
            </div>

            <button type="submit" class="btn-unlock">
              🔑 Unlock Secret Vault
            </button>
          </form>

          <div class="hint-box">
            <span>Psst! Foodie hint: </span>
            <button type="button" class="btn-use-hint" @on="click=fillHint">
              Click to autofill "VIPCHOPPER"
            </button>
          </div>
        </div>
      </div>
    `,
  })();
}
