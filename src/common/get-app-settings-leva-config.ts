import { SettingsMeta } from "common/types";

export const levaConfigToAppConfig = (
    settings: Record<string, { path: string; value: any }>
) => {
    return Object.entries(settings).reduce((memo, [key, item]) => {
        if (!memo[item.path as keyof typeof memo]) {
            memo[item.path] = {};
        }
        memo[item.path][key.replace("_", "")] = item.value;
        return memo;
    }, {} as Record<string, any>);
};

export const getAppSettingsLevaConfigField = (
    settings: Pick<SettingsMeta, "data" | "enabledPlugins">,
    fields: string[]
) => {
    const config = getAppSettingsLevaConfig(settings);
    return config[fields[fields.length - 1] as keyof typeof config];
};

export const getAppSettingsLevaConfig = (settings: Pick<SettingsMeta, "data" | "enabledPlugins">, maxAnisotropy = 2, maxPixelRatio = 1, maxAntiAlias = 1) => ({
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
    assets: {
        folder: "Directories",
        label: "3D Assets",
        value: settings.data.directories.assets,
        path: "directories",
        type: "directory",
    },
    global: {
        folder: "Audio",
        label: "Global Volume",
        value: settings.data.audio.global,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    music: {
        folder: "Audio",
        label: "Music Volume",
        value: settings.data.audio.music,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    sound: {
        folder: "Audio",
        label: "Sound Volume",
        value: settings.data.audio.sound,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    playIntroSounds: {
        folder: "Audio",
        label: "Play App Intro Sounds",
        value: settings.data.audio.playIntroSounds,
        path: "audio",
    },
    minimapSize: {
        folder: "Game",
        label: "Minimap Size % Height",
        min: 0.5,
        max: 1.5,
        step: 0.1,
        value: settings.data.game.minimapSize,
        path: "game",
    },
    sceneController: {
        folder: "Game",
        label: "Scene Controller",
        value: settings.data.game.sceneController,
        path: "game",
        options: settings.enabledPlugins
            .filter((p) => p.isSceneController)
            .map((p) => p.name),
    },
    pixelRatio: {
        folder: "Graphics",
        label: "Pixel Ratio",
        value: settings.data.graphics.pixelRatio,
        path: "graphics",
        min: 0.5,
        max: maxPixelRatio,
        step: 0.1,
    },
    anisotropy: {
        label: "Anisotropy",
        value: settings.data.postprocessing.anisotropy,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    antialias: {
        label: "Anti Alias",
        value: settings.data.postprocessing.antialias,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        //@ts-ignore
        max: maxAntiAlias,
        step: 1,
    },
    toneMapping: {
        label: "Tone Mapping Exposure",
        value: settings.data.postprocessing.toneMapping,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: 2,
        step: 0.1,
    },
    bloom: {
        label: "Bloom Intensity",
        value: settings.data.postprocessing.bloom,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: 10,
        step: 0.1,
    },
    brightness: {
        label: "Brightness",
        value: settings.data.postprocessing.brightness,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    contrast: {
        label: "Contrast",
        value: settings.data.postprocessing.contrast,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    anisotropy_: {
        label: "Anisotropy",
        value: settings.data.postprocessing3d.anisotropy,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    antialias_: {
        label: "Anti Alias",
        value: settings.data.postprocessing3d.antialias,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        //@ts-ignore
        max: maxAntiAlias,
        step: 1,
    },
    toneMapping_: {
        label: "Tone Mapping Exposure",
        value: settings.data.postprocessing3d.toneMapping,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: 2,
        step: 0.1,
    },
    bloom_: {
        label: "Bloom Intensity",
        value: settings.data.postprocessing3d.bloom,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: 10,
        step: 0.1,
    },
    brightness_: {
        label: "Brightness",
        value: settings.data.postprocessing3d.brightness,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    contrast_: {
        label: "Contrast",
        value: settings.data.postprocessing3d.contrast,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "depthFocalLength": {
        "label": "Depth Focal Length",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": settings.data.postprocessing3d.depthFocalLength,
        "min": 0.05,
        "max": 1,
        "step": 0.5
    },
    "depthBokehScale": {
        "label": "Depth Bokeh Scale",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": settings.data.postprocessing3d.depthBokehScale,
        "min": 0.1,
        "max": 5,
        "step": 0.1
    },
    "depthBlurQuality": {
        "label": "Depth Blur Quality",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": settings.data.postprocessing3d.depthBlurQuality,
        "options": [
            0,
            120,
            240,
            480
        ]
    },
});