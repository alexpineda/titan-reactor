import { AnimAtlas } from "@image";
import { Texture } from "three";
import { BwDAT, GRPInterface, UnitTileScale } from "common/types";
import { WorkerIcons, CenteredCursorIcons, ResourceIcons, RaceInsetIcons } from "common/types/icons";
interface AssetsConstructorArgs {
  bwDat: BwDAT;
  grps: GRPInterface[];
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
  loadAnim: (imageID: number, res: UnitTileScale) => Promise<void>
}

// FIXME: remove this class its just an object
class Assets {
  bwDat: BwDAT;
  grps: GRPInterface[] = [];
  selectionCirclesHD: AnimAtlas[] = [];

  gameIcons: ResourceIcons;
  cmdIcons: string[];
  raceInsetIcons: RaceInsetIcons;
  workerIcons: WorkerIcons;
  arrowIcons: string[];
  hoverIcons: CenteredCursorIcons;
  dragIcons: CenteredCursorIcons;
  wireframeIcons: string[];
  envMap: Texture;
  loadAnim: (imageID: number, res: UnitTileScale) => Promise<void>

  constructor({
    bwDat,
    grps,
    selectionCirclesHD,
    gameIcons,
    cmdIcons,
    raceInsetIcons,
    workerIcons,
    arrowIcons,
    hoverIcons,
    dragIcons,
    wireframeIcons,
    envMap,
    loadAnim
  }: AssetsConstructorArgs) {
    this.arrowIcons = arrowIcons;
    this.bwDat = bwDat;
    this.cmdIcons = cmdIcons;
    this.dragIcons = dragIcons;
    this.gameIcons = gameIcons;
    this.grps = grps;
    this.hoverIcons = hoverIcons;
    this.raceInsetIcons = raceInsetIcons;
    this.selectionCirclesHD = selectionCirclesHD;
    this.workerIcons = workerIcons;
    this.wireframeIcons = wireframeIcons;
    this.envMap = envMap;
    this.loadAnim = loadAnim;
  }

}

export default Assets;
