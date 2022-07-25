import { SettingsMeta } from "common/types";

export const levaConfigToAppConfig = (
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

export const getAppSettingsLevaConfigField = (
    settings: Pick<SettingsMeta, "data" | "pluginsMetadata">,
    fields: string[]
) => {
    const config = getAppSettingsLevaConfig(settings);
    return config[fields[fields.length - 1] as keyof typeof config];
};

export const getAppSettingsLevaConfig = (settings: Pick<SettingsMeta, "data" | "pluginsMetadata">) => ({
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
    minimapSize: {
        folder: "Game",
        label: "Minimap Size % Height",
        min: 0.15,
        max: 0.35,
        step: 0.025,
        value: settings.data.game.minimapSize,
        path: "game",
    },
    sceneController: {
        folder: "Game",
        label: "Scene Controller",
        value: settings.data.game.sceneController,
        path: "game",
        options: settings.pluginsMetadata
            .filter((p) => p.isSceneController)
            .map((p) => p.name),
    },
    pixelRatio: {
        folder: "Graphics",
        label: "Pixel Ratio",
        value: settings.data.graphics.pixelRatio,
        options: ["low", "med", "high"],
        path: "graphics",
    },
    anisotropy: {
        folder: "Graphics",
        label: "Anisotropy",
        value: settings.data.graphics.anisotropy,
        options: ["low", "med", "high"],
        path: "graphics",
    },
    terrainShadows: {
        folder: "Graphics",
        label: "Terrain Shadows",
        value: settings.data.graphics.terrainShadows,
        path: "graphics",
    },
});