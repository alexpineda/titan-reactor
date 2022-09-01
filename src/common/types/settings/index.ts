import { AssetTextureResolution, MacrosDTO } from "common/types";
import type { PluginMetaData } from "../plugin";

export type SettingsV4 = {
    version: 4;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    },
    assets: {
        images: AssetTextureResolution;
        terrain: AssetTextureResolution;
    },
    audio: {
        global: number;
        music: number;
        sound: number;
    },
    graphics: {
        antialias: boolean;
        pixelRatio: "high" | "med" | "low";
        anisotropy: "high" | "med" | "low";
        terrainShadows: boolean;
    },
    game: {
        stopFollowingOnClick: boolean,
    },
    util: {
        sanityCheckReplayCommands: boolean,
        debugMode: boolean
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    }
};

export type SettingsV5 = Settings;


export type Settings = {
    version: 5;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    },
    assets: {
        images: AssetTextureResolution;
        terrain: AssetTextureResolution;
        preload: boolean;
        enable3dAssets: boolean;
    },
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean,
    },
    graphics: {
        antialias: boolean;
        pixelRatio: "high" | "med" | "low";
        anisotropy: "high" | "med" | "low";
        terrainShadows: boolean;
    },
    game: {
        sceneController: string;
        minimapSize: number;
    },
    util: {
        sanityCheckReplayCommands: boolean,
        debugMode: boolean
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    },
    macros: MacrosDTO
};

export type SettingsMeta = {
    data: Settings;
    errors: string[];
    phrases: Record<string, string>;
    enabledPlugins: PluginMetaData[];
    disabledPlugins: PluginMetaData[];
    /**
     * Whether the starcraft directory is a CASC storage or direct filesystem
     */
    isCascStorage: boolean;
};