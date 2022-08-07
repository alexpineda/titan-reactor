import "./reset.css";
import sceneStore from "./stores/scene-store";
import { logCapabilities } from "@utils/renderer-utils";
import { lockdown_ } from "@utils/ses-util";
import "./home/home";
import "./handle-events";
import { preHomeSceneLoader } from "./scenes/pre-home-scene-loader";
import { homeSceneLoader } from "./scenes/home-scene-loader";
// import "./utils/webgl-lint";

declare global {
  interface Window {
    isGameWindow: boolean;
  }
}
window.isGameWindow = true;

async function bootup() {
  await sceneStore().execSceneLoader(preHomeSceneLoader);
  sceneStore().execSceneLoader(homeSceneLoader);
}


logCapabilities();
lockdown_();
bootup();
