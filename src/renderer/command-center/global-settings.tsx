import { useSettingsStore } from "@stores/settings-store";
import {
  getAppSettingsLevaConfig,
  levaConfigToAppConfig,
} from "common/get-app-settings-leva-config";
import { LevaPanel, useControls, useCreateStore } from "leva";
import { useState } from "react";
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

  return (
    <>
      <LevaPanel
        store={store}
        fill
        flat
        hideCopyButton
        titleBar={false}
        theme={{
          colors: {
            accent1: "blue",
            accent2: "orange",
            accent3: "red",
            elevation1: "red",
            elevation2: "#f5f5f5",
            elevation3: "#d9e0f0",
            highlight1: "black",
            highlight2: "#222",
            highlight3: "#333",
            vivid1: "red",
          },
          sizes: {
            controlWidth: "40vw",
          },
          fontSizes: {
            root: "14px",
          },
        }}
      />
    </>
  );
};
