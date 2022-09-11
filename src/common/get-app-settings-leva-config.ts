import { PluginMetaData, SessionData, SettingsMeta } from "common/types";
import lSet from "lodash.set";

export const fromLevaConfigToNestedConfig = (
    settings: Record<string, { value: any }>
) => {
    return Object.entries(settings).reduce((memo, [key, item]) => {
        lSet(memo, key.split("."), item.value);
        return memo;
    }, {} as Record<string, any>);
};

export const fromNestedToLevaSettingsField = (
    settings: SettingsMeta["data"], plugins: SettingsMeta["enabledPlugins"], fields: string[]
) => {
    const config = fromNestedToLevaSettings(settings, plugins);
    return config[fields.join(".") as keyof typeof config];
};

export const fromNestedToLevaSettings = (settings: SettingsMeta["data"], plugins: SettingsMeta["enabledPlugins"], maxAnisotropy = 2, maxPixelRatio = 1, maxAntiAlias = 1) => ({

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

    ...fromNestedToSessionLevaConfig(settings, plugins, maxAnisotropy, maxAntiAlias)

});

export const fromnNestedToSessionLevaField = (
    settings: SessionData, plugins: SettingsMeta["enabledPlugins"], fields: string[]
) => {
    const config = fromNestedToSessionLevaConfig(settings, plugins);
    return config[fields.join(".") as keyof typeof config];
};

export const fromNestedToSessionLevaConfig = (settings: SessionData, plugins: SettingsMeta["enabledPlugins"], maxAnisotropy = 2, maxAntiAlias = 1) => ({
    ...getAudioConfig(settings.audio),
    ...getGameConfig(settings.game, plugins.filter((p) => p.isSceneController)),
    ...getPostProcessingConfig(settings.postprocessing, maxAnisotropy, maxAntiAlias),
    ...getPostProcessing3DConfig(settings.postprocessing3d, maxAnisotropy, maxAntiAlias),
});

const getDirectoryConfig = (directories: SettingsMeta["data"]["directories"]) => ({
    "directories.starcraft": {
        folder: "Directories",
        label: "Starcraft",
        value: directories.starcraft,
        type: "directory",
    },
    "directories.maps": {
        folder: "Directories",
        label: "Maps",
        value: directories.maps,
        type: "directory",
    },
    "directories.replays": {
        folder: "Directories",
        label: "Replays",
        value: directories.replays,
        type: "directory",
    },
    "directories.assets": {
        folder: "Directories",
        label: "3D Assets",
        value: directories.assets,
        type: "directory",
    },
});

const getGameConfig = (game: SettingsMeta["data"]["game"], sceneControllers: PluginMetaData[]) => ({
    "game.minimapSize": {
        folder: "Game",
        label: "Minimap Size % Height",
        min: 0.5,
        max: 1.5,
        step: 0.1,
        value: game.minimapSize,
    },
    "game.sceneController": {
        folder: "Game",
        label: "Scene Controller (Default)",
        value: game.sceneController,
        options: sceneControllers
            .reduce((m, p) => ({ ...m, [p.description ?? p.name]: p.name }), {}),
    },
    "game.dampingFactor": {
        folder: "Game",
        label: "Camera Movement Damping",
        value: game.dampingFactor,
        min: 0.01,
        max: 0.1,
        step: 0.01,
    },
    "game.zoomLevels": {
        folder: "Game",
        label: "Camera Zoom Levels",
        value: game.zoomLevels,
    },
    "game.rotateSpeed": {
        folder: "Game",
        label: "Camera Rotate Speed",
        value: game.rotateSpeed,
    },
    "game.movementSpeed": {
        folder: "Game",
        label: "Camera Movement Speed",
        value: game.movementSpeed,
    },
    "game.cameraShakeStrength": {
        folder: "Game",
        label: "Camera Shake Strength",
        value: game.cameraShakeStrength,
        min: 0,
        max: 1,
    },
});

const getAudioConfig = (audio: SettingsMeta["data"]["audio"]) => ({
    "audio.global": {
        folder: "Audio",
        label: "Global Volume",
        value: audio.global,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.music": {
        folder: "Audio",
        label: "Music Volume",
        value: audio.music,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.sound": {
        folder: "Audio",
        label: "Sound Volume",
        value: audio.sound,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.playIntroSounds": {
        folder: "Audio",
        label: "Play App Intro Sounds",
        value: audio.playIntroSounds,
    }
});


export const getPostProcessingConfig = (postprocessing: SettingsMeta["data"]["postprocessing"], maxAnisotropy: number, maxAntiAlias: number) => ({

    "postprocessing.anisotropy": {
        label: "Anisotropy",
        value: postprocessing.anisotropy,
        folder: "Classic Renderer",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    "postprocessing.antialias": {
        label: "Anti Alias",
        value: postprocessing.antialias,
        folder: "Classic Renderer",
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    "postprocessing.toneMapping": {
        label: "Tone Mapping Exposure",
        value: postprocessing.toneMapping,
        folder: "Classic Renderer",
        min: 0,
        max: 2,
        step: 0.1,
    },
    "postprocessing.bloom": {
        label: "Bloom Intensity",
        value: postprocessing.bloom,
        folder: "Classic Renderer",
        min: 0,
        max: 1000,
        step: 0.1,
    },
    "postprocessing.brightness": {
        label: "Brightness",
        value: postprocessing.brightness,
        folder: "Classic Renderer",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing.contrast": {
        label: "Contrast",
        value: postprocessing.contrast,
        folder: "Classic Renderer",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing.fogOfWar": {
        label: "Fog Of War Opacity",
        folder: "Classic Renderer",
        value: postprocessing.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1
    },
});


const getPostProcessing3DConfig = (postprocessing3d: SettingsMeta["data"]["postprocessing3d"], maxAnisotropy: number, maxAntiAlias: number) => ({
    "postprocessing3d.anisotropy": {
        label: "Anisotropy",
        value: postprocessing3d.anisotropy,
        folder: "3D Renderer",
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    "postprocessing3d.antialias": {
        label: "Anti Alias",
        value: postprocessing3d.antialias,
        folder: "3D Renderer",
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    "postprocessing3d.toneMapping": {
        label: "Tone Mapping Exposure",
        value: postprocessing3d.toneMapping,
        folder: "3D Renderer",
        min: 0,
        max: 2,
        step: 0.1,
    },
    "postprocessing3d.bloom": {
        label: "Bloom Intensity",
        value: postprocessing3d.bloom,
        folder: "3D Renderer",
        min: 0,
        max: 1000,
        step: 1,
    },
    "postprocessing3d.brightness": {
        label: "Brightness",
        value: postprocessing3d.brightness,
        folder: "3D Renderer",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing3d.contrast": {
        label: "Contrast",
        value: postprocessing3d.contrast,
        folder: "3D Renderer",
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing3d.depthFocalLength": {
        "label": "Depth Focal Length",
        folder: "3D Renderer",
        "value": postprocessing3d.depthFocalLength,
        "min": 1,
        "max": 20,
        "step": 1
    },
    "postprocessing3d.depthFocalRange": {
        "label": "Depth Focal Range",
        folder: "3D Renderer",
        "value": postprocessing3d.depthFocalRange,
        "min": 1,
        "max": 20,
        "step": 1
    },
    "postprocessing3d.depthBokehScale": {
        "label": "Depth Bokeh Scale",
        folder: "3D Renderer",
        "value": postprocessing3d.depthBokehScale,
        "min": 1,
        "max": 5,
        "step": 0.1
    },
    "postprocessing3d.depthBlurQuality": {
        "label": "Depth Blur Quality",
        folder: "3D Renderer",
        "value": postprocessing3d.depthBlurQuality,
        "options": {

            "Off": 0,
            "Low": 120,
            "Medium": 240,
            "High": 480
        }
    },
    "postprocessing3d.fogOfWar": {
        "label": "Fog Of War Opacity",
        folder: "3D Renderer",
        "value": postprocessing3d.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1
    },
    "postprocessing3d.envMap": {
        "label": "Environment Map",
        folder: "3D Renderer",
        "value": postprocessing3d.envMap,
        min: 0,
        max: 2,
        step: 0.05
    },
    "postprocessing3d.sunlightDirection": {
        "label": "Sunlight Position",
        folder: "3D Renderer",
        "value": postprocessing3d.sunlightDirection,
        step: 1
    },
    "postprocessing3d.sunlightIntensity": {
        "label": "Sunlight Intensity",
        folder: "3D Renderer",
        "value": postprocessing3d.sunlightIntensity,
        step: 0.25,
        min: 0,
        max: 20
    },
    "postprocessing3d.sunlightColor": {
        "label": "Sunlight Color",
        folder: "3D Renderer",
        "value": postprocessing3d.sunlightColor,
    },
    "postprocessing3d.shadowIntensity": {
        "label": "Shadow Intensity",
        folder: "3D Renderer",
        "value": postprocessing3d.shadowIntensity,
        min: 0,
        max: 1,
        step: 0.1
    },
    "postprocessing3d.shadowQuality": {
        "label": "Shadow Quality",
        folder: "3D Renderer",
        "value": postprocessing3d.shadowQuality,
        min: 0,
        max: 8,
        step: 1
    },
});