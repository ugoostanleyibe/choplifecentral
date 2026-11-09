import { createComponent, html, css } from "udodi";
import { router } from "./router.js";
import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { Toast } from "./components/Toast.js";
import { foodStore } from "./store/foodStore.js";

export const App = createComponent({
  name: "ChopLifeApp",

  onMount() {
    // Sync initial theme
    const currentTheme = foodStore.getTheme();
    document.documentElement.dataset.theme = currentTheme;
  },

  style: css`
    :scope {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg, #0b1120);
      color: var(--text-heading, #f8fafc);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .main-outlet-wrapper {
      flex: 1;
      max-width: 1240px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
      box-sizing: border-box;
    }
  `,

  template: () => html`
    <div class="app-layout">
      ${Navbar()}

      <main class="main-outlet-wrapper">
        ${router.RouterView()}
      </main>

      ${Footer()}
      ${Toast()}
    </div>
  `,
});
