import { CubeTexture, Texture } from "three";
import { BwDAT, Atlas, UnitTileScale } from "common/types";
import { WorkerIcons, CenteredCursorIcons, ResourceIcons, RaceInsetIcons } from "common/types/icons";

export interface Assets {
    bwDat: BwDAT;
    grps: Atlas[];
    selectionCirclesHD: Atlas[];

    gameIcons: ResourceIcons;
    cmdIcons: string[];
    raceInsetIcons: RaceInsetIcons;
    workerIcons: WorkerIcons;
    arrowIcons: string[];
    hoverIcons: CenteredCursorIcons;
    dragIcons: CenteredCursorIcons;
    wireframeIcons: string[];
    envMap: Texture;
    loadAnim: (imageID: number, res: UnitTileScale) => Promise<void>;
    skyBox: CubeTexture;
}
