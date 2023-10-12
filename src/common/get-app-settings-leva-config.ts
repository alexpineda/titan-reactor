import {
    FieldDefinition,
    PluginMetaData,
    SessionSettingsData,
    SettingsMeta,
} from "common/types";
import lSet from "lodash.set";

const isProd = process.env.NODE_ENV !== "development";

export const generateAppSettingsFromLevaFormat = (
    settings: Record<string, { value: any }>
) => {
    return Object.entries( settings ).reduce<Record<string, any>>( ( memo, [ key, item ] ) => {
        lSet( memo, key.split( "." ), item.value );
        return memo;
    }, {} );
};

export const getAppSettingsPropertyInLevaFormat = (
    settings: SettingsMeta["data"],
    plugins: SettingsMeta["activatedPlugins"],
    fields: string[]
): FieldDefinition | undefined => {
    if ( [ ":app", ":plugin", ":function", ":macro" ].includes( fields[0] ) ) {
        console.error( "YOU ARE USING ROOT KEYS", fields );
        return undefined;
    }
    const config = getAppSettingsInLevaFormat( settings, plugins );
    return config[fields.join( "." ) as keyof typeof config];
};

export const getAppSettingsInLevaFormat = (
    settings: SettingsMeta["data"],
    plugins: SettingsMeta["activatedPlugins"],
    maxAnisotropy = 2,
    maxPixelRatio = 1,
    maxAntiAlias = 1
) => ( {
    ...getDirectoryConfig( settings.directories ),
    ...getGraphicsConfig( settings.graphics, maxPixelRatio ),
    ...getUtilConfig( settings.utilities ),
    ...getSessionSettingsInLevaFormat( settings, plugins, maxAnisotropy, maxAntiAlias ),
} );

export const getSessionSettingsPropertyInLevaFormat = (
    settings: SessionSettingsData,
    plugins: SettingsMeta["activatedPlugins"],
    fields: string[]
): FieldDefinition | undefined => {
    if ( [ ":app", ":plugin", ":function", ":macro" ].includes( fields[0] ) ) {
        console.error( "YOU ARE USING ROOT KEYS", fields );
        return undefined;
    }
    const config = getSessionSettingsInLevaFormat( settings, plugins );
    return config[fields.join( "." ) as keyof typeof config];
};

export const getSessionSettingsInLevaFormat = (
    settings: SessionSettingsData,
    plugins: SettingsMeta["activatedPlugins"],
    maxAnisotropy = 2,
    maxAntiAlias = 1
) => ( {
    ...getGlobalConfig( settings.session ),
    ...getAudioConfig( settings.audio ),
    ...getMinimapConfig( settings.minimap ),
    ...getInputConfig(
        settings.input,
        plugins.filter( ( p ) => p.isSceneController )
    ),
    ...getPostProcessingConfig( settings.postprocessing, maxAnisotropy, maxAntiAlias ),
    ...getPostProcessing3DConfig(
        settings.postprocessing3d,
        maxAnisotropy,
        maxAntiAlias
    ),
} );

type GlobalConfig = {
    [key in `session.${string}`]: any;
};

const getGlobalConfig = ( config: SettingsMeta["data"]["session"] ): GlobalConfig => ( {
    "session.type": {
        label: "SessionType",
        value: config.type,
        options: {
            Replay: "replay",
            Map: "map",
            Live: "live",
        },
        hidden: true,
        conditionOnly: true,
    },
    "session.sandbox": {
        label: "Sandbox Game Mode",
        value: config.sandbox,
        hidden: true,
    },
    "session.audioListenerDistance": {
        label: "Audio Listener Distance",
        value: config.audioListenerDistance,
        min: 0,
        max: 1,
        step: 0.01,
        hidden: true,
    },
} );

type GraphicsConfig = {
    [key in `graphics.${string}`]: any;
};

const getGraphicsConfig = (
    graphics: SettingsMeta["data"]["graphics"],
    maxPixelRatio = 1
): GraphicsConfig => ( {
    "graphics.pixelRatio": {
        label: "Pixel Ratio",
        value: graphics.pixelRatio,
        min: 0.5,
        max: maxPixelRatio,
        step: 0.1,
    },
    "graphics.useHD2": {
        label: "Use HD2 (50% HD)",
        value: graphics.useHD2,
        options: {
            "As Mipmap (Highest Quality)": "auto",
            "Never. Only HD.": "ignore",
            "Exclusively (Lower Memory)": "force",
        },
    },
    "graphics.preload": {
        label: "Preload Assets",
        value: graphics.preload,
    },
    "graphics.cursorSize": {
        label: "Cursor Size",
        value: graphics.cursorSize,
        min: 0.5,
        max: 4,
        step: 0.5,
    },
} );

type UtilConfig = {
    [key in `utilities.${keyof SettingsMeta["data"]["utilities"]}`]?: any;
};

const getUtilConfig = ( util: SettingsMeta["data"]["utilities"] ): UtilConfig => ( {
    "utilities.debugMode": {
        label: "Debug Mode",
        value: util.debugMode,
    },
    "utilities.sanityCheckReplayCommands": {
        label: "Sanity Check Replay Commands (and rewrite command buffer overflows)",
        value: util.sanityCheckReplayCommands,
    },
    "utilities.detectMeleeObservers": {
        label: "Detect Melee Observers (and remove from players list)",
        value: util.detectMeleeObservers,
    },
    "utilities.detectMeleeObserversThreshold": {
        label: "Detect Melee Observers (Commands Threshold)",
        value: util.detectMeleeObserversThreshold,
        min: 1000,
        max: 50000,
        step: 1000,
    },
    "utilities.alertDesynced": {
        label: "Detect Desynced Replay Before Start",
        value: util.alertDesynced,
    },
    "utilities.alertDesyncedThreshold": {
        label: "Detect Desynced Replay (Idle Units Threshold)",
        value: util.alertDesyncedThreshold,
        min: 10,
        max: 100,
    },
} );

type DirectoryConfig = {
    [key in `directories.${keyof SettingsMeta["data"]["directories"]}`]?: any;
};

const getDirectoryConfig = (
    directories: SettingsMeta["data"]["directories"]
): DirectoryConfig => ( {
    "directories.starcraft": {
        label: "Starcraft",
        value: directories.starcraft,
        type: "directory",
    },
    "directories.maps": {
        label: "Maps",
        value: directories.maps,
        type: "directory",
    },
    "directories.replays": {
        label: "Replays",
        value: directories.replays,
        type: "directory",
    },
    "directories.assets": {
        label: "3D Assets",
        value: directories.assets,
        type: "directory",
    },
} );

type MinimapConfig = {
    [key in `minimap.${keyof SettingsMeta["data"]["minimap"]}`]?: any;
};

const getMinimapConfig = ( minimap: SettingsMeta["data"]["minimap"] ): MinimapConfig => ( {
    "minimap.enabled": {
        label: "Minimap Visible",
        value: minimap.enabled,
    },
    "minimap.interactive": {
        label: "Interactive",
        value: minimap.interactive,
    },
    "minimap.softEdges": {
        label: "Minimap Soft Edges",
        value: minimap.softEdges,
    },
    "minimap.scale": {
        label: "Minimap Size % Height",
        min: 1,
        max: 10,
        step: 0.1,
        value: minimap.scale,
    },
    "minimap.position": {
        label: "Minimap Position",
        value: minimap.position,
        step: 0.01,
    },
    "minimap.rotation": {
        label: "Minimap Rotation",
        value: minimap.rotation,
        step: 0.01,
    },
    "minimap.opacity": {
        label: "Minimap Opacity",
        value: minimap.opacity,
        min: 0,
        max: 1,
        step: 0.1,
    },
} );

type InputConfig = {
    [key in `input.${keyof SettingsMeta["data"]["input"]}`]?: any;
};

const getInputConfig = (
    input: SettingsMeta["data"]["input"],
    sceneControllers: PluginMetaData[]
): InputConfig => ( {
    "input.sceneController": {
        label: "Scene Controller (Default)",
        value: input.sceneController,
        options: sceneControllers.reduce(
            ( m, p ) => ( { ...m, [p.description ?? p.name]: p.name } ),
            {}
        ),
    },
    "input.dampingFactor": {
        label: "Camera Movement Damping",
        value: input.dampingFactor,
        min: 0.01,
        max: 0.1,
        step: 0.01,
    },
    "input.zoomLevels": {
        label: "Camera Zoom Levels",
        value: input.zoomLevels,
    },
    "input.rotateSpeed": {
        label: "Camera Rotate Speed",
        value: input.rotateSpeed,
    },
    "input.movementSpeed": {
        label: "Camera Movement Speed",
        value: input.movementSpeed,
    },
    "input.cameraShakeStrength": {
        label: "Camera Shake Strength",
        value: input.cameraShakeStrength,
        min: 0,
        max: 1,
    },
    "input.unitSelection": {
        label: "Enable Unit Selection",
        value: input.unitSelection,
        hidden: true,
    },
    "input.cursorVisible": {
        label: "Mouse Cursor Visible",
        value: input.cursorVisible,
        hidden: true,
    },
} );

type AudioConfig = {
    [key in `audio.${keyof SettingsMeta["data"]["audio"]}`]?: any;
};

const getAudioConfig = ( audio: SettingsMeta["data"]["audio"] ): AudioConfig => ( {
    "audio.global": {
        label: "Global Volume",
        value: audio.global,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.music": {
        label: "Music Volume",
        value: audio.music,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.sound": {
        label: "Sound Volume",
        value: audio.sound,
        min: 0,
        max: 1,
        step: 0.05,
    },
    "audio.playIntroSounds": {
        label: "Play App Intro Sounds",
        value: audio.playIntroSounds,
    },
} );

type PostProcessingConfig = {
    [key in `postprocessing.${keyof SettingsMeta["data"]["postprocessing"]}`]?: any;
};

export const getPostProcessingConfig = (
    postprocessing: SettingsMeta["data"]["postprocessing"],
    maxAnisotropy: number,
    maxAntiAlias: number
): PostProcessingConfig => ( {
    "postprocessing.anisotropy": {
        label: "Anisotropy",
        value: postprocessing.anisotropy,
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    "postprocessing.antialias": {
        label: "Anti Alias",
        value: postprocessing.antialias,
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    "postprocessing.bloom": {
        label: "Bloom Intensity",
        value: postprocessing.bloom,
        min: 0,
        max: 10,
        step: 0.1,
        hidden: isProd,
    },
    "postprocessing.brightness": {
        label: "Brightness",
        value: postprocessing.brightness,
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing.contrast": {
        label: "Contrast",
        value: postprocessing.contrast,
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing.fogOfWar": {
        label: "Fog Of War Opacity",
        value: postprocessing.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1,
    },
} );

type PostProcessingConfig3D = {
    [key in `postprocessing3d.${keyof SettingsMeta["data"]["postprocessing3d"]}`]?: any;
};

const getPostProcessing3DConfig = (
    postprocessing3d: SettingsMeta["data"]["postprocessing3d"],
    maxAnisotropy: number,
    maxAntiAlias: number
): PostProcessingConfig3D => ( {
    "postprocessing3d.anisotropy": {
        label: "Anisotropy",
        value: postprocessing3d.anisotropy,
        min: 0,
        max: maxAnisotropy,
        step: 1,
    },
    "postprocessing3d.antialias": {
        label: "Anti Alias",
        value: postprocessing3d.antialias,
        min: 0,
        max: maxAntiAlias,
        step: 1,
    },
    "postprocessing3d.toneMapping": {
        label: "Tone Mapping Exposure",
        value: postprocessing3d.toneMapping,
        min: 1,
        max: 2,
        step: 0.1,
        hidden: isProd,
    },
    "postprocessing3d.bloom": {
        label: "Bloom Intensity",
        value: postprocessing3d.bloom,
        min: 0,
        max: 10,
        step: 0.01,
    },
    "postprocessing3d.brightness": {
        label: "Brightness",
        value: postprocessing3d.brightness,
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing3d.contrast": {
        label: "Contrast",
        value: postprocessing3d.contrast,
        min: -0.5,
        max: 0.5,
        step: 0.01,
    },
    "postprocessing3d.depthFocalLength": {
        label: "Depth Focal Length",
        value: postprocessing3d.depthFocalLength,
        min: 1,
        max: 20,
        step: 1,
        hidden: isProd,
    },
    "postprocessing3d.depthFocalRange": {
        label: "Depth Focal Range",
        value: postprocessing3d.depthFocalRange,
        min: 1,
        max: 20,
        step: 1,
        hidden: isProd,
    },
    "postprocessing3d.depthBokehScale": {
        label: "Depth Bokeh Scale",
        value: postprocessing3d.depthBokehScale,
        min: 1,
        max: 5,
        step: 0.1,
        hidden: isProd,
    },
    "postprocessing3d.depthBlurQuality": {
        label: "Depth Blur Quality",
        value: postprocessing3d.depthBlurQuality,
        options: {
            Off: 0,
            Low: 120,
            Medium: 240,
            High: 480,
        },
    },
    "postprocessing3d.fogOfWar": {
        label: "Fog Of War Opacity",
        value: postprocessing3d.fogOfWar,
        min: 0,
        max: 1,
        step: 0.1,
    },
    "postprocessing3d.envMap": {
        label: "Environment Map",
        value: postprocessing3d.envMap,
        min: 0,
        max: 2,
        step: 0.05,
        hidden: isProd,
    },
    "postprocessing3d.sunlightDirection": {
        label: "Sunlight Position",
        value: postprocessing3d.sunlightDirection,
        step: 1,
        hidden: isProd,
    },
    "postprocessing3d.sunlightIntensity": {
        label: "Sunlight Intensity",
        value: postprocessing3d.sunlightIntensity,
        step: 0.25,
        min: 0,
        max: 20,
        hidden: isProd,
    },
    "postprocessing3d.sunlightColor": {
        label: "Sunlight Color",
        value: postprocessing3d.sunlightColor,
        hidden: isProd,
    },
    "postprocessing3d.shadowQuality": {
        label: "Shadow Quality",
        value: postprocessing3d.shadowQuality,
        min: 0,
        max: 8,
        step: 1,
        hidden: isProd,
    },
} );
