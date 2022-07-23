import { MacrosDTO } from "renderer/command-center/macros";
import type { InitializedPluginPackage, PluginMetaData } from "../plugin";

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
        cameraController: string;
        stopFollowingOnClick: boolean,
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

export enum AssetTextureResolution {
    SD = "sd",
    HD = "hd",
}

export enum ShadowLevel {
    Off,
    Low,
    Medium,
    High
}

export enum GameAspect {
    Fit = "Fit",
    Native = "Native",
    FourThree = "FourThree",
    SixteenNine = "SixteenNine",
};

export type SettingsMeta = {
    data: Settings;
    errors: string[];
    phrases: Record<string, string>;
    enabledPlugins: InitializedPluginPackage[];
    disabledPlugins: InitializedPluginPackage[];
    pluginsMetadata: PluginMetaData[];
    /**
     * Whether the starcraft directory is a CASC storage or direct filesystem
     */
    isCascStorage: boolean;
};