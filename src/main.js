import "./style.css";
import { render } from "udodi";
import { router } from "./router.js";
import { App } from "./App.js";
import { foodPersistController } from "./store/foodStore.js";
import { appStore, appPersistController } from "./store/appStore.js";

async function bootstrap() {
  console.log("Initializing ChopLife Central...");

  // Hydrate IndexedDB persisted state before mounting UI
  await Promise.all([foodPersistController.ready, appPersistController.ready]);

  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.dataset.theme = appStore.getTheme();
  }

  const rootElement = document.getElementById("app");

  // Mount root component
  render(App(), rootElement);

  // Wait for router ready
  const result = await router.ready;
  console.log("ChopLife Router ready. Initial route:", router.route.path, result.type);
}

bootstrap();
