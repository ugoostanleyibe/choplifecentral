import { createComponent, html, css } from "udodi";

export function createNotFoundPage(router) {
  return createComponent({
    name: "NotFoundPage",

    methods: {
      goHome() {
        router.push("/");
      },
    },

    style: css`
      :scope {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 50vh;
        text-align: center;
      }

      .not-found-card {
        background: var(--card-bg, #1e293b);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        border-radius: 24px;
        padding: 3.5rem 2.5rem;
        max-width: 540px;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
      }

      .not-found-emoji {
        font-size: 5rem;
        margin-bottom: 1rem;
      }

      .not-found-code {
        font-size: 0.9rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #ef4444;
        letter-spacing: 0.1em;
        margin-bottom: 0.5rem;
      }

      .not-found-title {
        font-size: 2rem;
        font-weight: 900;
        color: var(--text-heading, #f8fafc);
        margin: 0 0 1rem;
      }

      .not-found-desc {
        font-size: 1rem;
        color: var(--text-muted, #94a3b8);
        line-height: 1.6;
        margin: 0 0 2rem;
      }

      .btn-home {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-size: 1rem;
        font-weight: 800;
        border: none;
        padding: 0.85rem 2rem;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        transition: transform 0.15s;
      }

      .btn-home:hover {
        transform: translateY(-2px);
      }
    `,

    template: () => html`
      <div class="not-found-root">
        <div class="not-found-card">
          <div class="not-found-emoji">🍲💨</div>
          <div class="not-found-code">404 Wildcard Matched</div>
          <h1 class="not-found-title">Chai! Food Don Finish!</h1>
          <p class="not-found-desc">
            The page or recipe you dey look for no dey this kitchen. Either someone don wipe the pot clean, or the URL get typo. Make you return home go chop proper food!
          </p>

          <button type="button" class="btn-home" @on="click=goHome">
            🍛 Return to ChopLife Home
          </button>
        </div>
      </div>
    `,
  })();
}
