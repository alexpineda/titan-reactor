import { CubeTexture, Texture } from "three";
import { BwDAT, AnimAtlas } from "common/types";
import { WorkerIcons, CenteredCursorIcons, ResourceIcons, RaceInsetIcons } from "common/types/icons";
import { GltfAtlas } from "./anim-grp";

export interface Assets {
    bwDat: BwDAT;
    grps: (AnimAtlas | GltfAtlas)[];
    selectionCirclesHD: AnimAtlas[];

    gameIcons: ResourceIcons;
    cmdIcons: string[];
    raceInsetIcons: RaceInsetIcons;
    workerIcons: WorkerIcons;
    arrowIcons: string[];
    hoverIcons: CenteredCursorIcons;
    dragIcons: CenteredCursorIcons;
    wireframeIcons: string[];
    envMap: Texture;
    loadImageAtlas: (imageID: number) => AnimAtlas | undefined;
    loadImageAtlasAsync: (imageID: number, earlyGlb: boolean) => Promise<void>;
    skyBox: CubeTexture;
    refId: (id: number) => number;
    resetAssetCache: () => void;
}

export type UIStateAssets = Pick<Assets, "bwDat" | "gameIcons" | "cmdIcons" | "raceInsetIcons" | "workerIcons" | "wireframeIcons">;