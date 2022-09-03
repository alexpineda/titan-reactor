import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import {
  getAppSettingsLevaConfig,
  levaConfigToAppConfig,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import { useState } from "react";
import { createLevaPanel } from "./create-leva-panel";
import { mapConfigToLeva } from "@utils/leva-utils";
import { renderComposer } from "@render/render-composer";

export const GlobalSettings = () => {
  const settings = useSettingsStore();

  const [state, setState] = useState(
    getAppSettingsLevaConfig(
      settings,
      renderComposer.getWebGLRenderer().capabilities.getMaxAnisotropy(),
      window.devicePixelRatio,
      //@ts-ignore
      renderComposer.getWebGLRenderer().capabilities.maxSamples
    )
  );

  const controls = mapConfigToLeva(state, () => {
    setState(state);

    const newSettings = levaConfigToAppConfig(state);

    const newState = {
      directories: {
        ...settings.data.directories,
        ...newSettings.directories,
      },
      audio: {
        ...settings.data.audio,
        ...newSettings.audio,
      },
      game: {
        ...settings.data.game,
        ...newSettings.game,
      },
      graphics: {
        ...settings.data.graphics,
        ...newSettings.graphics,
      },
      postprocessing: {
        ...settings.data.postprocessing,
        ...newSettings.postprocessing,
      },
      postprocessing3d: {
        ...settings.data.postprocessing3d,
        ...newSettings.postprocessing3d,
      },
    };
    settings.save(newState).then((payload) => {
      sendWindow(InvokeBrowserTarget.Game, {
        type: SendWindowActionType.CommitSettings,
        payload,
      });
    });
  });

  const store = useCreateStore();
  for (const [folder, config] of controls) {
    useControls(folder, config, { store });
  }

  return createLevaPanel(store);
};
