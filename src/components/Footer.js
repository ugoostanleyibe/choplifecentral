import { createComponent, html, css } from "udodi";

export const Footer = createComponent({
  name: "Footer",

  style: css`
    :scope {
      background: var(--footer-bg, #0b1120);
      border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
      padding: 3rem 1.5rem 2rem;
      margin-top: 4rem;
      color: var(--text-muted, #94a3b8);
      font-size: 0.9rem;
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .footer-top {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 1.5rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-heading, #f8fafc);
    }

    .footer-tagline {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      max-width: 420px;
      line-height: 1.45;
    }

    .badge-udodi {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-weight: 700;
      font-size: 0.8rem;
      text-decoration: none;
    }

    .badge-udodi:hover {
      background: rgba(16, 185, 129, 0.2);
    }

    .footer-bottom {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      font-size: 0.82rem;
    }

    .celestine-credit {
      color: #f59e0b;
      font-weight: 700;
    }
  `,

  template: () => html`
    <footer class="footer-root">
      <div class="footer-container">
        <div class="footer-top">
          <div>
            <div class="footer-brand">
              <span>🍲</span> ChopLife Central
            </div>
            <p class="footer-tagline">
              The high-performance Nigerian recipe showcase, kitchen companion & Owambe party planner. Built with pure zero-dependency craftsmanship.
            </p>
          </div>

          <div>
            <a href="https://udodi.dev" target="_blank" rel="noopener noreferrer" class="badge-udodi">
              ⚡ Powered by Udodi.js & Udodi Router
            </a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>
            Crafted for <span class="celestine-credit">Attamah Celestine</span> to thoroughly stress-test Udodi's reactivity runtime, directives, forms & router.
          </p>
          <p>
            Made with ❤️ in Nigeria 🇳🇬 • Zero Virtual DOM • Native CSS Scoping
          </p>
        </div>
      </div>
    </footer>
  `,
});
