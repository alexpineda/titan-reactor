import "./ui/reset.css";
import { openBw } from "./openbw";

import { version } from "../../package.json";
import * as log from "./ipc/log";
import { useSettingsStore } from "./stores";
import screenStore from "./stores/screen-store";
import loadFonts from "./bootup/load-fonts";
import registerFileDialogHandlers from "./bootup/register-file-dialog-handlers";
import preloadAssets from "./bootup/load-assets-when-ready";
import "./bootup/three-overrides";
import { waitUnless } from "../common/utils/wait";
import renderer from "./render/renderer";
import App from "./ui/index";
import { render } from "react-dom";
import settingsStore from "./stores/settings-store";

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept();
}

log.info(`titan-reactor ${version}`);
log.info(`chrome ${process.versions.chrome}`);
log.info(`electron ${process.versions.electron}`);
log.info(`resolution ${window.innerWidth}x${window.innerHeight}`);

{
  const r = renderer.getWebGLRenderer();
  log.verbose(`webgl capabilities`);
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

  log.verbose(`device pixel ratio: ${window.devicePixelRatio}`);
}

bootup();
async function bootup() {
  try {
    await loadFonts();
    await settingsStore().load();
    log.info("bootup complete");
    registerFileDialogHandlers();

    const settings = settingsStore().data;
    const hasErrors = settingsStore().errors.length > 0;

    if (hasErrors) {
      log.error(
        `settings errors: ${useSettingsStore.getState().errors.join(", ")}`
      );
    }

    for (const plugin of settingsStore().pluginsConfigs) {
      log.verbose(`plugin ${plugin.name} ${plugin.version}`);
    }

    renderer.getWebGLRenderer().toneMappingExposure = settings.graphics.gamma;

    useSettingsStore.subscribe((state) => {
      if (state.errors) {
        log.error(`settings errors: ${state.errors.join(", ")}`);
      }
    });

    await openBw.loaded;
    await waitUnless(10_000, preloadAssets(settings, hasErrors));
    screenStore().complete();
  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
}

render(<App />, document.getElementById("app"));
