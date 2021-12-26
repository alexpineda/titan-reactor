export type Settings = {
    version: number;
    spriteTextureResolution: SpriteTextureResolution;
    alwaysHideReplayControls: boolean;
    language: string;
    starcraftPath: string;
    mapsPath: string;
    replaysPath: string;
    tempPath: string;
    communityModelsPath: string;
    observerLink: string;
    musicVolume: number;
    musicAllTypes: boolean;
    soundVolume: number;
    antialias: boolean;
    anisotropy: number;
    pixelRatio: number;
    gamma: number;
    keyPanSpeed: number;
    twitch: string;
    fullscreen: boolean;
    enablePlayerScores: boolean;
    esportsHud: boolean;
    embedProduction: boolean;
    cameraShake: number;
    useCustomColors: boolean;
    randomizeColorOrder: boolean;
    classicClock: boolean;
    playerColors: string[];
    hudFontSize: "xs" | "sm" | "md" | "lg" | "xl";
    minimapRatio: number;
    replayAndUnitDetailSize: string;
    fpsLimit: number;
    autoToggleProductionView: boolean;
    showDisabledDoodads: boolean;
    showCritters: boolean;
    mouseRotateSpeed: number;
    mouseDollySpeed: number;
    mapBackgroundColor: string;
};

export enum SpriteTextureResolution {
    SD,
    HD2,
    HD,
}

export enum TerrainTextureResolution {
    SD,
    HD2,
    HD,
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
