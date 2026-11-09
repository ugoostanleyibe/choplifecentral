import { createComponent, html, css } from "udodi";

export function createSecretVaultPage(router) {
  return createComponent({
    name: "SecretVaultPage",

    methods: {
      goHome() {
        router.push("/");
      },
    },

    style: css`
      :scope {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .vault-hero {
        background: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.25), transparent 70%),
                    var(--card-bg, #1e293b);
        border: 2px solid rgba(245, 158, 11, 0.4);
        border-radius: 28px;
        padding: 3rem 2rem;
        text-align: center;
        box-shadow: 0 25px 50px -15px rgba(245, 158, 11, 0.2);
      }

      .unlocked-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        font-weight: 800;
        font-size: 0.85rem;
        padding: 6px 16px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.4);
        margin-bottom: 1rem;
      }

      .vault-title {
        font-size: clamp(2rem, 4vw, 3rem);
        font-weight: 900;
        color: #f59e0b;
        margin: 0 0 0.8rem;
      }

      .vault-subtitle {
        font-size: 1.05rem;
        color: var(--text-muted, #94a3b8);
        max-width: 620px;
        margin: 0 auto;
        line-height: 1.6;
      }

      .secrets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.5rem;
      }

      .secret-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 20px;
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        transition: transform 0.2s;
      }

      .secret-card:hover {
        transform: translateY(-4px);
        border-color: #f59e0b;
      }

      .secret-icon {
        font-size: 2.2rem;
      }

      .secret-heading {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-heading, #f8fafc);
        margin: 0;
      }

      .secret-body {
        font-size: 0.92rem;
        line-height: 1.6;
        color: var(--text-muted, #cbd5e1);
        margin: 0;
      }

      .guard-notice {
        text-align: center;
        padding: 1rem;
        font-size: 0.85rem;
        color: #10b981;
        font-weight: 700;
      }
    `,

    template: () => html`
      <div class="secret-vault-root">
        <section class="vault-hero">
          <span class="unlocked-badge">🔓 Navigation Guard Authenticated!</span>
          <h1 class="vault-title">The Grand Chef's Vault</h1>
          <p class="vault-subtitle">
            You have successfully passed the Udodi Router <code style="color:#f59e0b;">beforeEnter</code> transactional guard! These age-old Nigerian kitchen secrets are guarded by our culinary elders.
          </p>
        </section>

        <div class="secrets-grid">
          <div class="secret-card">
            <span class="secret-icon">🪵</span>
            <h3 class="secret-heading">1. The Fake Firewood Smoke Hack</h3>
            <p class="secret-body">
              No firewood outside? Place an unlit piece of natural lump charcoal in a small metal ramekin. Put it directly on top of your steaming pot of cooked Jollof, drop 1 drop of vegetable oil onto the coal to make it billow thick sweet smoke, cover the lid tightly for 7 minutes. Pure party aroma!
            </p>
          </div>

          <div class="secret-card">
            <span class="secret-icon">🫘</span>
            <h3 class="secret-heading">2. The Secret Iru & Ogiri Ratio</h3>
            <p class="secret-body">
              Never dump raw locust beans into cold water. Sauté your fermented Iru in hot palm oil for exactly 90 seconds first. This breaks down the bitter tannins and releases pure, savory umami depth that coats the entire soup.
            </p>
          </div>

          <div class="secret-card">
            <span class="secret-icon">🌶️</span>
            <h3 class="secret-heading">3. The 3-Pepper Trinity Rule</h3>
            <p class="secret-body">
              Every legendary Buka stew uses a strict 3:2:1 ratio by weight: 3 parts Sweet Tatashe (red bell pepper for body and color), 2 parts Plum Tomatoes (for natural acidity and thickness), and 1 part Scotch Bonnet (for heat that dances on the tongue without burning the throat).
            </p>
          </div>

          <div class="secret-card">
            <span class="secret-icon">🥜</span>
            <h3 class="secret-heading">4. Kuli-Kuli Suya Dust Formula</h3>
            <p class="secret-body">
              True Yaji spice cannot be made from roasted peanuts alone. You must use pressed, defatted peanut cake (kuli-kuli) ground with roasted ginger, cloves (kananfari), Negro pepper (uda), and dried crushed chili flakes. It stays dry and adheres to the meat like a magnet!
            </p>
          </div>
        </div>

        <div class="guard-notice">
          🛡️ Guard Policy: Protected via Udodi Router transactional navigation pipeline.
        </div>
      </div>
    `,
  })();
}
