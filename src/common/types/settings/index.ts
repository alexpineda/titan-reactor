import type { InitializedPluginPackage } from "../plugin";

export type Settings = {
    version: 3;
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
        gamma: number;
    },
    controls: {
        debug?: boolean,
        mode: {
            default?: string;
            battle?: string;
            overview?: string;
        },
        camera: {
            truckLeft?: string,
            truckRight?: string,
            forward?: string,
            backward?: string,
            zoomIn?: string,
            zoomOut?: string,
            helicopterRotateSpeed: number,
        }
    },
    battleCam: {
        shakeMultiplier: number;
        fogofwar: false;
        scanlines: true;
    },
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[],
    }

    // showDisabledDoodads: boolean;
    // showCritters: boolean;
};

export enum AssetTextureResolution {
    SD = "sd",
    HD2 = "hd2",
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
    /**
     * Whether the starcraft directory is a CASC storage or direct filesystem
     */
    isCascStorage: boolean;
};