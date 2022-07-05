import "./ui/reset.css";
import { openBw } from "./openbw";
import { waitUnless } from "common/utils/wait";

import { version } from "../../package.json";
import * as log from "./ipc/log";
import { useSettingsStore } from "./stores";
import screenStore, { useScreenStore } from "./stores/screen-store";
import registerFileDialogHandlers from "./bootup/register-file-dialog-handlers";
import preloadAssets from "./bootup/load-assets-when-ready";
import renderer from "./render/renderer";
import settingsStore from "./stores/settings-store";
import * as pluginSystem from "./plugins";
import { initializePluginSystem } from "./plugins";
import { SYSTEM_EVENT_OPEN_URL } from "./plugins/events";
import { openUrl } from "./ipc";
import { ScreenStatus, ScreenType } from "common/types";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

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

bootup();

async function bootup() {
  try {
    log.info("@init: loading settings");
    await (settingsStore().load());
    registerFileDialogHandlers();

    await initializePluginSystem(settingsStore().enabledPlugins);
    document.body.addEventListener("mouseup", evt => pluginSystem.onClick(evt));

    const settings = settingsStore().data;
    const hasErrors = settingsStore().errors.length > 0;

    if (hasErrors) {
      const error = `@init: error with settings - ${useSettingsStore
        .getState()
        .errors.join(", ")}`
      log.error(
        error
      );
      throw new Error(error);
    }

    await openBw.loaded;
    await waitUnless(10_000, preloadAssets(settings, hasErrors));
    screenStore().complete();
  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
}

window.addEventListener("message", evt => {
  if (evt.data?.type === SYSTEM_EVENT_OPEN_URL) {
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
iframeDiv.style.marginTop = "150px";

const createIFrame = (url: string) => {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.width = "560";
  iframe.height = "315";
  iframe.frameBorder = "0";
  iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  return iframe;
}

iframeDiv.appendChild(createIFrame("http://embed-casts.imbateam.gg"))
iframeDiv.appendChild(createIFrame("http://embed-casts-2.imbateam.gg"));

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
