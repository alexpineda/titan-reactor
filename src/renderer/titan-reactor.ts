import "./reset.css";
import sceneStore from "./stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import { lockdown_ } from "@utils/ses-util";
import "./home/home";
import "./home/handle-events";
import { loadLoadingPage } from "./load-loading-page";
import { loadHomePage } from "./load-home-page";
// import "./utils/webgl-lint";

declare global {
  interface Window {
    isGameWindow: boolean;
  }
}
window.isGameWindow = true;

async function bootup() {
  await sceneStore().load(loadLoadingPage);
  sceneStore().load(loadHomePage);
}


logCapabilities();
lockdown_();
bootup();
