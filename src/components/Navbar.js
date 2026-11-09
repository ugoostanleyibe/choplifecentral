import { createComponent, html, css, store } from "udodi";
import { foodStore } from "../store/foodStore.js";
import { launchPepperQuiz } from "./PepperQuizModal.js";

export function createNavbar(router) {
  return createComponent({
    name: "Navbar",

    state() {
      return {
        favCount: foodStore.getFavoritesCount(),
        isDark: foodStore.getTheme() === "dark",
        isPending: false,
        mobileMenuOpen: false,
      };
    },

    onMount(_root, ctx) {
      // Keep favorite count reactive
      const checkState = () => {
        ctx.favCount = foodStore.getFavoritesCount();
        ctx.isPending = !!router.route.pending;
      };

      const timer = setInterval(checkState, 200);
      ctx.cleanup(() => clearInterval(timer));
    },

    methods: {
      toggleTheme() {
        const next = foodStore.toggleTheme();
        this.isDark = next === "dark";
      },

      openQuiz() {
        launchPepperQuiz(router);
      },

      toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
      },

      closeMobileMenu() {
        this.mobileMenuOpen = false;
      },

      themeIcon() {
        return this.isDark ? "☀️ Light" : "🌙 Dark";
      },

      getFavBadge() {
        return String(this.favCount);
      },

      isNavigating() {
        return this.isPending;
      },

      mobileClass() {
        return this.mobileMenuOpen ? "mobile-nav-panel open" : "mobile-nav-panel";
      },
    },

    style: css`
      :scope {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: var(--nav-bg, rgba(15, 23, 42, 0.85));
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        transition: background-color 0.3s ease;
      }

      .nav-container {
        max-width: 1240px;
        margin: 0 auto;
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
      }

      .nav-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--text-heading, #f8fafc);
        font-weight: 900;
        font-size: 1.3rem;
        letter-spacing: -0.02em;
      }

      .brand-icon {
        font-size: 1.7rem;
        filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.4));
      }

      .brand-accent {
        color: #f59e0b;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-link-item {
        color: var(--text-muted, #94a3b8);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.92rem;
        padding: 0.5rem 0.85rem;
        border-radius: 999px;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .nav-link-item:hover {
        color: var(--text-heading, #f8fafc);
        background: rgba(255, 255, 255, 0.06);
      }

      .nav-link-item.active {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        font-weight: 700;
      }

      .badge-fav {
        background: #ef4444;
        color: #ffffff;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 999px;
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .quiz-trigger-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #0f172a;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 0.5rem 0.95rem;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: transform 0.15s ease, box-shadow 0.2s;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
      }

      .quiz-trigger-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
      }

      .theme-toggle-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        color: var(--text-heading, #f8fafc);
        font-size: 0.82rem;
        font-weight: 600;
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .theme-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .hamburger-btn {
        display: none;
        background: transparent;
        border: none;
        color: var(--text-heading, #f8fafc);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 4px;
      }

      .pending-indicator-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2.5px;
        background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
        background-size: 200% 100%;
        animation: shimmer 1s infinite linear;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      @media (max-width: 900px) {
        .nav-links {
          display: none;
        }

        .hamburger-btn {
          display: block;
        }
      }

      .mobile-nav-panel {
        display: none;
        flex-direction: column;
        padding: 1rem 1.25rem 1.5rem;
        background: var(--nav-bg, #0f172a);
        border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
        gap: 0.5rem;
      }

      .mobile-nav-panel.open {
        display: flex;
      }
    `,

    template: () => html`
      <header class="navbar-root">
        <div class="nav-container">
          <a href="#/" class="nav-brand">
            <span class="brand-icon">🍲</span>
            <span>ChopLife<span class="brand-accent">Central</span></span>
          </a>

          <nav class="nav-links">
            ${router.Link({ to: "/", exact: true }, html`
              <a @class="isActive=>'active' 'nav-link-item'">Discover</a>
            `)}

            ${router.Link({ to: "/create" }, html`
              <a @class="isActive=>'active' 'nav-link-item'">+ Add Recipe</a>
            `)}

            ${router.Link({ to: "/planner" }, html`
              <a @class="isActive=>'active' 'nav-link-item'">Owambe Planner</a>
            `)}

            ${router.Link({ to: "/favorites" }, html`
              <a @class="isActive=>'active' 'nav-link-item'">
                ChopList <span class="badge-fav" @text="getFavBadge"></span>
              </a>
            `)}

            ${router.Link({ to: "/secret-vault" }, html`
              <a @class="isActive=>'active' 'nav-link-item'">VIP Vault 🔒</a>
            `)}
          </nav>

          <div class="nav-actions">
            <button type="button" class="quiz-trigger-btn" @on="click=openQuiz" title="Take the Pepper Tolerance Quiz">
              🌶️ Spice Quiz
            </button>
            <button type="button" class="theme-toggle-btn" @on="click=toggleTheme" title="Toggle dark / light theme">
              <span @text="themeIcon"></span>
            </button>
            <button type="button" class="hamburger-btn" @on="click=toggleMobileMenu" aria-label="Toggle navigation menu">
              ☰
            </button>
          </div>
        </div>

        <div @class="mobileClass">
          ${router.Link({ to: "/", exact: true }, html`
            <a @class="isActive=>'active' 'nav-link-item'" @on="click=closeMobileMenu">Discover</a>
          `)}
          ${router.Link({ to: "/create" }, html`
            <a @class="isActive=>'active' 'nav-link-item'" @on="click=closeMobileMenu">+ Add Recipe</a>
          `)}
          ${router.Link({ to: "/planner" }, html`
            <a @class="isActive=>'active' 'nav-link-item'" @on="click=closeMobileMenu">Owambe Planner</a>
          `)}
          ${router.Link({ to: "/favorites" }, html`
            <a @class="isActive=>'active' 'nav-link-item'" @on="click=closeMobileMenu">
              ChopList <span class="badge-fav" @text="getFavBadge"></span>
            </a>
          `)}
          ${router.Link({ to: "/secret-vault" }, html`
            <a @class="isActive=>'active' 'nav-link-item'" @on="click=closeMobileMenu">VIP Vault 🔒</a>
          `)}
        </div>

        <div class="pending-indicator-bar" @show="isNavigating"></div>
      </header>
    `,
  })();
}
