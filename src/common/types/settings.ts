import { LogLevel } from "common/logging";
import { MacrosDTO } from "common/types";

export interface SettingsV5 {
    version: 5;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    };
    assets: {
        images: "sd" | "hd";
        terrain: "sd" | "hd";
        preload: boolean;
        enable3dAssets: boolean;
    };
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean;
    };
    graphics: {
        antialias: boolean;
        pixelRatio: "high" | "med" | "low";
        anisotropy: "high" | "med" | "low";
        terrainShadows: boolean;
    };
    game: {
        sceneController: string;
        minimapSize: number;
    };
    util: {
        sanityCheckReplayCommands: boolean;
        debugMode: boolean;
    };
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[];
    };
    macros: MacrosDTO;
}

export interface SettingsV6 {
    version: 6;
    language: string;
    session: {
        type: "replay" | "map";
        sandbox: boolean;
        audioListenerDistance: number;
    };
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean;
    };
    graphics: {
        pixelRatio: number;
        useHD: boolean;
        use3D: boolean;
        cacheLocally: boolean;
        preloadMapSprites: boolean;
        cursorSize: number;
    };
    minimap: {
        mode: "2d" | "3d";
        position: [number, number];
        rotation: [number, number, number];
        scale: number;
        enabled: boolean;
        opacity: number;
        softEdges: boolean;
        interactive: boolean;
        drawCamera: boolean;
    };
    input: {
        sceneController: string;
        dampingFactor: number;
        movementSpeed: number;
        rotateSpeed: number;
        cameraShakeStrength: number;
        zoomLevels: [number, number, number];
        unitSelection: boolean;
        cursorVisible: boolean;
    };
    utilities: {
        sanityCheckReplayCommands: boolean;
        debugMode: boolean;
        detectMeleeObservers: boolean;
        detectMeleeObserversThreshold: number;
        alertDesynced: boolean;
        alertDesyncedThreshold: number;
        logLevel: LogLevel;
    };
    replayQueue: {
        enabled: boolean;
        autoplay: boolean;
        show: boolean;
    };
    postprocessing: {
        anisotropy: number;
        antialias: number;
        bloom: number;
        brightness: number;
        contrast: number;
        fogOfWar: number;
    };
    postprocessing3d: {
        anisotropy: number;
        antialias: number;
        toneMapping: number;
        bloom: number;
        brightness: number;
        contrast: number;
        depthFocalLength: number;
        depthBokehScale: number;
        depthBlurQuality: number;
        depthFocalRange: number;
        fogOfWar: number;
        envMap: number;
        sunlightDirection: [number, number, number];
        sunlightColor: string;
        sunlightIntensity: number;
        shadowQuality: number;
    };
    macros: MacrosDTO;
}

export type Settings = SettingsV6;

export type SessionSettingsData = Pick<
    Settings,
    "audio" | "input" | "minimap" | "postprocessing" | "postprocessing3d" | "session"
>;
