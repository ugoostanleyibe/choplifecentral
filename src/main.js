import "./style.css";
import { render } from "udodi";
import { router } from "./router.js";
import { App } from "./App.js";

const rootElement = document.getElementById("app");

console.log("Initializing ChopLife Central...");

// Mount root component
render(App(), rootElement);

// Wait for router ready
router.ready.then((result) => {
  console.log("ChopLife Router ready. Initial route:", router.route.path, result.type);
});
