# ChopLife Central 🍲🇳🇬

> **A rich, interactive Nigerian cuisine and party-planning web application built with [Udodi](https://udodi.dev) and [Udodi Router](https://udodi.dev/udodi-router).**

---

## 🌟 Overview

**ChopLife Central** is a showcase web app demonstrating the capabilities of the **Udodi** UI framework and **Udodi Router**, engineered by Celestine Attamah. The application offers recipe discovery, an interactive servings scaler with kitchen timer, a party chow & budget calculator, custom recipe submissions with real-time form validation, and a passcode-protected VIP secret vault.

---

## 🚀 Key Features & Udodi Showcase

* **Fine-Grained Reactivity:** Instantaneous state updates with shallow reactivity and microtask batching without Virtual DOM overhead.
* **Native CSS `@scope` Isolation:** Modern doughnut styling with zero CSS pollution and native CSS variable inheritance.
* **Declarative Form Engine:** Uses `@form`, `@validate="required between:3:60"`, and `@trigger="live submit"` to validate inputs on the fly.
* **State Interceptors:** Clamps dynamic recipe servings between 1 and 50 using Udodi's reactive `interceptors`.
* **Overlay Modals:** Native dialog management using `openModal()` and `closeTopModal()`.
* **Advanced Routing:** Uses `createRouter` and `createWebHistory()` with parametric matching (`/recipes/:id(\\d+)`), route `loader` data pre-fetching, active navigation link highlighting, and `beforeEnter` navigation guards.
* **Global Reactive Store:** Centralized `store.get()` / `store.set()` with local storage synchronization.

---

## 🛠️ Getting Started

### Prerequisites
* Node.js 18+ (tested on Node.js 22+)
* npm 9+

### Installation & Local Development

```bash
# Clone the repository
git clone git@github.com:ugoostanleyibe/choplife.git
cd choplife

# Install dependencies
npm install

# Run automated integration tests
npm test

# Start the Vite development server
npm run dev
```

### Production Build

```bash
# Build optimized static assets into /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deploy to Vercel

This project includes [`vercel.json`](./vercel.json) configured for Single Page Application (SPA) rewrites.

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete ChopLife app with Udodi and Vercel config"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and import the `choplife` GitHub repository.
3. Framework Preset: **Vite** (detected automatically).
4. Output Directory: **dist** (detected automatically).
5. Click **Deploy**.

---

## 📄 Feedback & Technical Evaluation

For an in-depth technical analysis of Udodi and Udodi Router, see [`FEEDBACK.md`](./FEEDBACK.md).

---

## 👨‍💻 Credits
* **Framework & Router:** Attamah Celestine C. ([@cocest](https://github.com/cocest))
* **Application Concept & Implementation:** Built with ❤️ for Nigerian food culture.
