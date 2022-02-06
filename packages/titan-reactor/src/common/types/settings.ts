export type Settings = {
    version: 2;
    language: string;
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        models: string;
        temp: string;
    },
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
    battleCam?: {
        changeSpeedOnStart?: number;
        camShakeStrength?: number;
    },
    controls: {
        debug?: boolean,
        keyboard: {
            game: {
                battleCam?: string;
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
            }
        }
    }



    // spriteTextureResolution: AssetTextureResolution;
    // terrainTextureResolution: AssetTextureResolution;
    // alwaysHideReplayControls: boolean;
    // language: string;
    // starcraftPath: string;
    // mapsPath: string;
    // replaysPath: string;
    // tempPath: string;
    // communityModelsPath: string;
    // observerLink: string;
    // musicVolume: number;
    // musicAllTypes: boolean;
    // soundVolume: number;
    // antialias: 0 | 1 | 2 | 3 | 4;
    // anisotropy: number;
    // pixelRatio: number;
    // gamma: number;
    // keyPanSpeed: number;
    // twitch: string;
    // fullscreen: boolean;
    // enablePlayerScores: boolean;
    // esportsHud: boolean;
    // embedProduction: boolean;
    // cameraShake: number;
    // useCustomColors: boolean;
    // randomizeColorOrder: boolean;
    // classicClock: boolean;
    // hudFontSize: "xs" | "sm" | "md" | "lg" | "xl";
    // minimapRatio: number;
    // replayAndUnitDetailSize: string;
    // fpsLimit: number;
    // autoToggleProductionView: boolean;
    // showDisabledDoodads: boolean;
    // showCritters: boolean;
    // mouseRotateSpeed: number;
    // mouseDollySpeed: number;
    // mapBackgroundColor: string;
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
