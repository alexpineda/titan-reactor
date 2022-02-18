export type Settings = {
    version: 3;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        models: string;
        temp: string;
    },
    pluginServerPort: number;
    playerColors: {
        ignoreReplayColors: boolean;
        randomizeOrder: boolean;
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
        fullscreen: boolean;
        gamma: number;
        showFps: boolean;
    },
    controls: {
        debug?: boolean,
        mode: {
            default?: string;
            battle?: string;
            overview?: string;
        },
        replay: {
            pause?: string;
            speedUp?: string;
            speedDown?: string;
            skipForward?: string;
            skipBackward?: string;
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

