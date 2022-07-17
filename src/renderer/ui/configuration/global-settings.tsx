import { useSettingsStore } from "@stores/settings-store";
import { Leva, useControls } from "leva";
import { useState } from "react";
import { mapConfigToLeva } from "./map-config-to-leva";

const levaConfigToAppConfig = (
  settings: Record<string, { path: string; value: any }>
) => {
  return Object.entries(settings).reduce((memo, [key, item]) => {
    if (!memo[item.path as keyof typeof memo]) {
      memo[item.path] = {};
    }
    memo[item.path][key] = item.value;
    return memo;
  }, {} as Record<string, any>);
};

export const GlobalSettings = () => {
  const settings = useSettingsStore();

  const [state, setState] = useState({
    starcraft: {
      folder: "Directories",
      label: "Starcraft",
      value: settings.data.directories.starcraft,
      path: "directories",
      type: "directory",
    },
    maps: {
      folder: "Directories",
      label: "Maps",
      value: settings.data.directories.maps,
      path: "directories",
      type: "directory",
    },
    replays: {
      folder: "Directories",
      label: "Replays",
      value: settings.data.directories.replays,
      path: "directories",
      type: "directory",
    },
    global: {
      folder: "Audio",
      label: "Global Volume",
      value: settings.data.audio.global,
      min: 0,
      max: 1,
      path: "audio",
    },
    music: {
      folder: "Audio",
      label: "Music Volume",
      value: settings.data.audio.music,
      min: 0,
      max: 1,
      path: "audio",
    },
    sound: {
      folder: "Audio",
      label: "Sound Volume",
      value: settings.data.audio.sound,
      min: 0,
      max: 1,
      path: "audio",
    },
    stopFollowingOnClick: {
      folder: "Game",
      label: "Click anywhere to stop following units",
      value: settings.data.game.stopFollowingOnClick,
      path: "game",
    },
    pixelRatio: {
      folder: "Graphics",
      label: "Pixel Ratio (Requires Game Reload)",
      value: settings.data.graphics.pixelRatio,
      options: ["low", "med", "high"],
      path: "graphics",
    },
    terrainShadows: {
      folder: "Graphics",
      label: "Terrain Shadows (Requires Game Reload)",
      value: settings.data.graphics.terrainShadows,
      path: "graphics",
    },
  });

  const controls = mapConfigToLeva("global-settings", state, (_, config) => {
    setState(config);

    const newSettings = levaConfigToAppConfig(config);

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

  for (const [folder, config] of controls) {
    useControls(folder, config, ["global-settings"]);
  }

  return (
    <>
      <Leva
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
