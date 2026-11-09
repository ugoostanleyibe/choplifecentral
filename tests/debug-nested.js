import { Window } from "happy-dom";

const window = new Window({ url: "https://localhost:3000/" });
globalThis.window = window;
globalThis.document = window.document;
globalThis.Node = window.Node;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.customElements = window.customElements;
globalThis.MutationObserver = window.MutationObserver;
globalThis.location = window.location;
globalThis.history = window.history;

const { createComponent, html, render } = await import("udodi");
const { createRouter, createMemoryHistory } = await import("udodi-router");

const Child = createComponent({
  name: "Child",
  template: () => "<div><p>Child View</p></div>",
});

const Parent = createComponent({
  name: "Parent",
  template: () => html`
    <div>
      <h1>Parent Layout</h1>
      <main>
        ${router.RouterView()}
      </main>
    </div>
  `,
});

const router = createRouter({
  routes: [
    {
      path: "/parent",
      component: Parent,
      children: [
        { path: "", component: Child },
      ],
    },
  ],
  history: createMemoryHistory({ initial: "/" }),
});

await router.ready;

const App = createComponent({
  name: "App",
  template: () => html`
    <div>
      <nav>Navbar</nav>
      ${router.RouterView()}
    </div>
  `,
});

const root = document.createElement("div");
render(App(), root);

console.log("Mounted App, root:", root.innerHTML);
console.log("Now pushing /parent...");

try {
  const res = await router.push("/parent");
  console.log("Pushed /parent:", res.type);
  console.log("After push, root:", root.innerHTML);
} catch (e) {
  console.error("Error pushing /parent:", e);
}
