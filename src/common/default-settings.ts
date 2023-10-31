import { SettingsV6, MacroDTO } from "./types";
import defaultMacros from "common/macros/default-macros.json";

export const DEFAULT_PLUGIN_PACKAGES: string[] = [
    "@titan-reactor-plugins/clock",
    "@titan-reactor-plugins/player-colors",
    "@titan-reactor-plugins/camera-standard",
    "@titan-reactor-plugins/camera-overview",
    "@titan-reactor-plugins/camera-battle",
    "@titan-reactor-plugins/players-bar",
    "@titan-reactor-plugins/unit-selection-display",
    "@titan-reactor-plugins/production-bar",
    "@titan-reactor-plugins/unit-sounds",
];

export const defaultSettingsV6: SettingsV6 = {
    version: 6,
    language: "en-US",
    session: {
        type: "replay",
        sandbox: false,
        audioListenerDistance: 0.5,
    },

    audio: {
        global: 0.5,
        music: 0.5,
        sound: 0.5,
        playIntroSounds: true,
    },
    minimap: {
        enabled: true,
        mode: "3d",
        position: [ -3, 2 ],
        scale: 1.5,
        opacity: 0.5,
        rotation: [ -0.7, 0, 0 ],
        softEdges: true,
        interactive: true,
        drawCamera: true,
    },
    input: {
        sceneController: "@titan-reactor-plugins/camera-standard",
        dampingFactor: 0.1,
        cameraShakeStrength: 1,
        movementSpeed: 1.15,
        rotateSpeed: 0.15,
        zoomLevels: [ 0.5, 1, 2 ],
        unitSelection: true,
        cursorVisible: true,
    },
    utilities: {
        sanityCheckReplayCommands: false,
        debugMode: false,
        detectMeleeObservers: false,
        detectMeleeObserversThreshold: 1000,
        alertDesynced: true,
        alertDesyncedThreshold: 10,
        logLevel: "info",
    },
    replayQueue: {
        autoplay: true,
        enabled: true,
        show: true,
    },
    graphics: {
        pixelRatio: 1,
        preload: true,
        cursorSize: 3,
        use3D: false,
        useHD: false,
    },
    postprocessing: {
        anisotropy: 0,
        antialias: 0,
        bloom: 0,
        brightness: 0,
        contrast: 0,
        fogOfWar: 0.9,
    },
    postprocessing3d: {
        anisotropy: 0,
        antialias: 0,
        bloom: 0.5,
        brightness: 0,
        contrast: 0,
        toneMapping: 1.2,
        depthFocalLength: 0.5,
        depthFocalRange: 20,
        depthBlurQuality: 480,
        depthBokehScale: 2.5,
        fogOfWar: 0.6,
        envMap: 1,
        sunlightColor: "#838383",
        sunlightDirection: [ -70, 90, -90 ],
        sunlightIntensity: 9,
        shadowQuality: 4,
    },
    macros: {
        revision: 0,
        macros: defaultMacros as MacroDTO[],
    },
};

export const defaultSettings = defaultSettingsV6;
