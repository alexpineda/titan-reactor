import { useSettingsStore } from "@stores/settings-store";
import {
  getAppSettingsLevaConfig,
  levaConfigToAppConfig,
} from "common/get-app-settings-leva-config";
import { useControls, useCreateStore } from "leva";
import { useState } from "react";
import { createLevaPanel } from "./create-leva-panel";
import { mapConfigToLeva } from "./map-config-to-leva";

export const GlobalSettings = () => {
  const settings = useSettingsStore();

  const [state, setState] = useState(getAppSettingsLevaConfig(settings));

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
    };
    settings.save(newState);
  });

  const store = useCreateStore();
  for (const [folder, config] of controls) {
    useControls(folder, config, { store });
  }

  return createLevaPanel(store);
};
