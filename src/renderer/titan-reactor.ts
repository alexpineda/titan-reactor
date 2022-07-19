import "./reset.css";
import "./ipc/register-file-dialog-handlers";

import { version } from "../../package.json";
import * as log from "./ipc/log";
import { useSettingsStore } from "./stores";
import screenStore, { useScreenStore } from "./stores/screen-store";
import renderer from "./render/renderer";
import settingsStore from "./stores/settings-store";
import * as pluginSystem from "./plugins";
import { initializePluginSystem } from "./plugins";
import { SYSTEM_EVENT_OPEN_URL } from "./plugins/events";
import { openUrl } from "./ipc";
import { ScreenStatus, ScreenType, SettingsMeta } from "common/types";
import { ipcRenderer } from "electron";
import { GO_TO_START_PAGE, SETTINGS_CHANGED } from "common/ipc-handle-names";
import processStore, { Process } from "@stores/process-store";
import loadAndParseAssets from "./assets/load-and-parse-assets";
import gameStore from "@stores/game-store";
// import "./utils/webgl-lint";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

// @ts-ignore
window.isTitanReactorRenderer = true;

log.info(`@init: titan-reactor ${version}`);
log.info(`@init: chrome ${process.versions.chrome}`);
log.info(`@init: electron ${process.versions.electron}`);
log.info(`@init: resolution ${window.innerWidth}x${window.innerHeight}`);

{
  const r = renderer.getWebGLRenderer();
  log.verbose(`@init: webgl capabilities`);
  for (const prop of Object.getOwnPropertyNames(r.capabilities)) {
    const value = r.capabilities[prop as keyof typeof r.capabilities];
    if (typeof value === "function") continue;
    log.verbose(`- ${prop}: ${value}`);
  }
  log.verbose(`- anisotropy: ${r.capabilities.getMaxAnisotropy()}`);
  log.verbose(`- max precision: ${r.capabilities.getMaxPrecision("highp")}`);
  log.verbose("webgl extensions");
  log.verbose(
    `- EXT_color_buffer_float ${r.extensions.has("EXT_color_buffer_float")}`
  );
  log.verbose(
    `- OES_texture_float_linear ${r.extensions.has("OES_texture_float_linear")}`
  );
  log.verbose(
    `- EXT_color_buffer_half_float ${r.extensions.has(
      "EXT_color_buffer_half_float"
    )}`
  );
  log.verbose(
    `- WEBGL_multisampled_render_to_texture ${r.extensions.has(
      "WEBGL_multisampled_render_to_texture"
    )}`
  );

  r.extensions.init(r.capabilities);

  log.verbose(`@init: device pixel ratio: ${window.devicePixelRatio}`);
}

window.addEventListener("message", evt => {
  if (evt.data?.type === SYSTEM_EVENT_OPEN_URL) {
    log.verbose(`@open-url: ${evt.data.payload}`);
    openUrl(evt.data.payload);
  }
})

const iframeDiv = document.createElement("div");
iframeDiv.style.position = "absolute";
iframeDiv.style.display = "flex";
iframeDiv.style.flexDirection = "column";
iframeDiv.style.alignItems = "center";
iframeDiv.style.zIndex = "10";
iframeDiv.style.marginLeft = "30px";
iframeDiv.style.marginTop = "200px";

const createIFrame = (embedUrl: string) => {
  const div = document.createElement("div");
  div.style.margin = "0 0";
  div.style.padding = "0 0";
  div.style.position = "relative";
  div.style.marginTop = "10px";
  div.style.background = "black"

  const clicker = document.createElement("div");
  clicker.style.margin = "0 0";
  clicker.style.padding = "0 0";
  clicker.style.position = "absolute";
  clicker.style.top = "0";
  clicker.style.cursor = "pointer";
  clicker.style.width = "100%";
  clicker.style.height = "50px";
  clicker.textContent = "&nbsp;"

  const iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.width = "560";
  iframe.height = "315";
  iframe.frameBorder = "0";
  iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  iframe.style.position = "relative"

  div.appendChild(iframe);
  div.appendChild(clicker)
  return { div, clicker, iframe };
}

const video1 = createIFrame("http://embed-casts.imbateam.gg");
const video2 = createIFrame("http://embed-casts-2.imbateam.gg");

iframeDiv.appendChild(video1.div)
iframeDiv.appendChild(video2.div);

useScreenStore.subscribe((store) => {
  if (store.type === ScreenType.Home && store.status === ScreenStatus.Ready && !store.error) {
    if (!iframeDiv.parentElement) {
      document.body.appendChild(iframeDiv);
    }
  } else {
    if (iframeDiv.parentElement) {
      iframeDiv.remove();
    }
  }
});


const _sceneResizeHandler = () => {
  const height = window.innerHeight / 3;
  const width = height * 1.77;

  video1.div.style.width = `${width}px`;
  video1.div.style.height = `${height}px`;
  video2.div.style.width = `${width}px`;
  video2.div.style.height = `${height}px`;

  video1.iframe.width = `${width}`;
  video1.iframe.height = `${height}`;
  video2.iframe.width = `${width}`;
  video2.iframe.height = `${height}`;

};
window.addEventListener("resize", _sceneResizeHandler, false);
_sceneResizeHandler();


bootup();

async function bootup() {
  try {
    log.info("@init: loading settings");
    const settings = await (settingsStore().load());

    await initializePluginSystem(settingsStore().enabledPlugins);
    document.body.addEventListener("mouseup", evt => pluginSystem.onClick(evt));

    video1.clicker.addEventListener("click", () => {
      openUrl(`http://youtube${settings.data.language === "ko-KR" ? "-kr" : ""}.imbateam.gg`);
    });

    video2.clicker.addEventListener("click", () => {
      openUrl(`http://youtube${settings.data.language === "ko-KR" ? "-kr" : ""}.imbateam.gg`);
    });

    await tryLoad(settings);

  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
}

const tryLoad = async (settings: SettingsMeta) => {
  screenStore().clearError();

  if (settings.errors.length) {
    const error = `@init: error with settings - ${settings.errors.join(", ")}`
    log.error(
      error
    );
    throw new Error(error);
  }

  if (processStore().isComplete(Process.AtlasPreload) || processStore().isInProgress(Process.AtlasPreload)) {
    return;
  }
  await loadAndParseAssets(settings.data);
  screenStore().complete();
}

ipcRenderer.on(SETTINGS_CHANGED, async (_, settings) => {
  try {
    await tryLoad(settings);
    useSettingsStore.setState(settings);
  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
})


ipcRenderer.on(GO_TO_START_PAGE, () => {
  if (!processStore().hasAnyProcessIncomplete()) {
    gameStore().disposeGame();
    screenStore().init(ScreenType.Home);
    screenStore().complete();
  }
});
