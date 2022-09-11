import { PluginMetaData, SessionData, SettingsMeta } from "common/types";

export const levaConfigToNestedConfig = (
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
    settings: SettingsMeta["data"], plugins: SettingsMeta["enabledPlugins"], fields: string[]
) => {
    const config = getAppSettingsLevaConfig(settings, plugins);
    return config[fields[fields.length - 1] as keyof typeof config];
};

export const getAppSettingsLevaConfig = (settings: SettingsMeta["data"], plugins: SettingsMeta["enabledPlugins"], maxAnisotropy = 2, maxPixelRatio = 1, maxAntiAlias = 1) => ({

    ...getDirectoryConfig(settings.directories),

    pixelRatio: {
        folder: "Graphics",
        label: "Pixel Ratio",
        value: settings.graphics.pixelRatio,
        path: "graphics",
        min: 0.5,
        max: maxPixelRatio,
        step: 0.1,
    },
    useHD2: {
        folder: "Graphics",
        label: "Use HD2 (50% HD)",
        value: settings.graphics.useHD2,
        path: "graphics",
        options: {
            "As Mipmap (Highest Quality)": "auto",
            "Never. Only HD.": "ignore",
            "Exclusively (Lower Memory)": "force",
        }
    },
    preload: {
        folder: "Graphics",
        label: "Preload Assets",
        value: settings.assets.preload,
        path: "assets",
    },

    ...getSessionLevaConfig(settings, plugins, maxAnisotropy, maxAntiAlias)

});

export const getSessionLevaConfigField = (
    settings: SessionData, plugins: SettingsMeta["enabledPlugins"], fields: string[]
) => {
    const config = getSessionLevaConfig(settings, plugins);
    return config[fields[fields.length - 1] as keyof typeof config];
};

export const getSessionLevaConfig = (settings: SessionData, plugins: SettingsMeta["enabledPlugins"], maxAnisotropy = 2, maxAntiAlias = 1) => ({
    ...getAudioConfig(settings.audio),
    ...getGameConfig(settings.game, plugins.filter((p) => p.isSceneController)),
    ...getPostProcessingConfig(settings.postprocessing, maxAnisotropy, maxAntiAlias),
    ...getPostProcessing3DConfig(settings.postprocessing3d, maxAnisotropy, maxAntiAlias),
});

const getDirectoryConfig = (directories: SettingsMeta["data"]["directories"]) => ({
    starcraft: {
        folder: "Directories",
        label: "Starcraft",
        value: directories.starcraft,
        path: "directories",
        type: "directory",
    },
    maps: {
        folder: "Directories",
        label: "Maps",
        value: directories.maps,
        path: "directories",
        type: "directory",
    },
    replays: {
        folder: "Directories",
        label: "Replays",
        value: directories.replays,
        path: "directories",
        type: "directory",
    },
    assets: {
        folder: "Directories",
        label: "3D Assets",
        value: directories.assets,
        path: "directories",
        type: "directory",
    },
});

const getGameConfig = (game: SettingsMeta["data"]["game"], sceneControllers: PluginMetaData[]) => ({
    minimapSize: {
        folder: "Game",
        label: "Minimap Size % Height",
        min: 0.5,
        max: 1.5,
        step: 0.1,
        value: game.minimapSize,
        path: "game",
    },
    sceneController: {
        folder: "Game",
        label: "Scene Controller (Default)",
        value: game.sceneController,
        path: "game",
        options: sceneControllers
            .reduce((m, p) => ({ ...m, [p.description ?? p.name]: p.name }), {}),
    },
    dampingFactor: {
        folder: "Game",
        label: "Camera Movement Damping",
        value: game.dampingFactor,
        path: "game",
        min: 0.01,
        max: 0.1,
        step: 0.01,
    },
    zoomLevels: {
        folder: "Game",
        label: "Camera Zoom Levels",
        value: game.zoomLevels,
        path: "game",
    },
    rotateSpeed: {
        folder: "Game",
        label: "Camera Rotate Speed",
        value: game.rotateSpeed,
        path: "game",
    },
    movementSpeed: {
        folder: "Game",
        label: "Camera Movement Speed",
        value: game.movementSpeed,
        path: "game"
    },
    cameraShakeStrength: {
        folder: "Game",
        label: "Camera Shake Strength",
        value: game.cameraShakeStrength,
        min: 0,
        max: 1,
        path: "game"
    },
});

const getAudioConfig = (audio: SettingsMeta["data"]["audio"]) => ({
    global: {
        folder: "Audio",
        label: "Global Volume",
        value: audio.global,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    music: {
        folder: "Audio",
        label: "Music Volume",
        value: audio.music,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    sound: {
        folder: "Audio",
        label: "Sound Volume",
        value: audio.sound,
        min: 0,
        max: 1,
        step: 0.05,
        path: "audio",
    },
    playIntroSounds: {
        folder: "Audio",
        label: "Play App Intro Sounds",
        value: audio.playIntroSounds,
        path: "audio",
    }
});


export const getPostProcessingConfig = (postprocessing: SettingsMeta["data"]["postprocessing"], maxAnisotropy: number, maxAntiAlias: number) => ({

    anisotropy: {
        label: "Anisotropy",
        value: postprocessing.anisotropy,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    antialias: {
        label: "Anti Alias",
        value: postprocessing.antialias,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    toneMapping: {
        label: "Tone Mapping Exposure",
        value: postprocessing.toneMapping,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: 2,
        step: 0.1,
    },
    bloom: {
        label: "Bloom Intensity",
        value: postprocessing.bloom,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: 0,
        max: 1000,
        step: 0.1,
    },
    brightness: {
        label: "Brightness",
        value: postprocessing.brightness,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    contrast: {
        label: "Contrast",
        value: postprocessing.contrast,
        folder: "Classic Renderer",
        path: "postprocessing",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "fogOfWar": {
        "label": "Fog Of War Opacity",
        folder: "Classic Renderer",
        path: "postprocessing",
        "value": postprocessing.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1
    },
});


const getPostProcessing3DConfig = (postprocessing3d: SettingsMeta["data"]["postprocessing3d"], maxAnisotropy: number, maxAntiAlias: number) => ({
    anisotropy_: {
        label: "Anisotropy",
        value: postprocessing3d.anisotropy,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    antialias_: {
        label: "Anti Alias",
        value: postprocessing3d.antialias,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    toneMapping_: {
        label: "Tone Mapping Exposure",
        value: postprocessing3d.toneMapping,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: 2,
        step: 0.1,
    },
    bloom_: {
        label: "Bloom Intensity",
        value: postprocessing3d.bloom,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: 0,
        max: 1000,
        step: 1,
    },
    brightness_: {
        label: "Brightness",
        value: postprocessing3d.brightness,
        folder: "3D Renderer",
        path: "postprocessing3d",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    contrast_: {
        label: "Contrast",
        value: postprocessing3d.contrast,
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
        "value": postprocessing3d.depthFocalLength,
        "min": 1,
        "max": 20,
        "step": 1
    },
    "depthFocalRange": {
        "label": "Depth Focal Range",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.depthFocalRange,
        "min": 1,
        "max": 20,
        "step": 1
    },
    "depthBokehScale": {
        "label": "Depth Bokeh Scale",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.depthBokehScale,
        "min": 1,
        "max": 5,
        "step": 0.1
    },
    "depthBlurQuality": {
        "label": "Depth Blur Quality",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.depthBlurQuality,
        "options": {

            "Off": 0,
            "Low": 120,
            "Medium": 240,
            "High": 480
        }
    },
    "fogOfWar_": {
        "label": "Fog Of War Opacity",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1
    },
    "envMap": {
        "label": "Environment Map",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.envMap,
        min: 0,
        max: 2,
        step: 0.05
    },
    "sunlightDirection": {
        "label": "Sunlight Position",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.sunlightDirection,
        step: 1
    },
    "sunlightIntensity": {
        "label": "Sunlight Intensity",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.sunlightIntensity,
        step: 0.25,
        min: 0,
        max: 20
    },
    "sunlightColor": {
        "label": "Sunlight Color",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.sunlightColor,
    },
    "shadowIntensity": {
        "label": "Shadow Intensity",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.shadowIntensity,
        min: 0,
        max: 1,
        step: 0.1
    },
    "shadowQuality": {
        "label": "Shadow Quality",
        folder: "3D Renderer",
        path: "postprocessing3d",
        "value": postprocessing3d.shadowQuality,
        min: 0,
        max: 8,
        step: 1
    },
});