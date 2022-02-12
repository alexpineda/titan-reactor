import { AssetTextureResolution } from ".";

export type SettingsV2 = {
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
        }
    }

};