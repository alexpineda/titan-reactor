import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import {
  fromNestedToLevaSettings,
  fromLevaConfigToNestedConfig,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import { useState } from "react";
import { mapConfigToLeva } from "@utils/leva-utils";
import { renderComposer } from "@render/render-composer";
import deepMerge from "deepmerge";
import { createLevaPanel } from "./create-leva-panel";

const overwriteMerge = (_: any, sourceArray: any) => sourceArray;

export const GlobalSettings = () => {
  const settings = useSettingsStore();

  const [state, setState] = useState(
    fromNestedToLevaSettings(
      settings.data,
      settings.enabledPlugins,
      renderComposer.getWebGLRenderer().capabilities.getMaxAnisotropy(),
      window.devicePixelRatio,
      //@ts-ignore not in types yet
      renderComposer.getWebGLRenderer().capabilities.maxSamples
    )
  );

  const controls = mapConfigToLeva(state, () => {
    setState(state);

    const newSettings = fromLevaConfigToNestedConfig(state);

    const newState = deepMerge(Object.assign({}, settings.data), newSettings, {
      arrayMerge: overwriteMerge,
    });

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
