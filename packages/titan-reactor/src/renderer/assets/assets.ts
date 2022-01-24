import { BwDAT, GRPInterface } from "../../common/types";
import { WorkerIcons, CenteredCursorIcons, ResourceIcons, RaceInsetIcons } from "../../common/types/icons";
import {
  closeCascStorage,
  readCascFile,
} from "../../common/utils/casclib";


interface AssetsConstructorArgs {
  bwDat: BwDAT;
  grps: GRPInterface[];
  selectionCirclesHD: GRPInterface[];

  gameIcons: ResourceIcons;
  cmdIcons: string[];
  raceInsetIcons: RaceInsetIcons;
  workerIcons: WorkerIcons;
  arrowIcons: string[];
  hoverIcons: CenteredCursorIcons;
  dragIcons: CenteredCursorIcons;
  wireframeIcons: string[];
  smaaImages: any[];
  loadImageAtlas: (imageId: number) => Promise<void>
}

class Assets {
  bwDat: BwDAT;
  grps: GRPInterface[] = [];
  selectionCirclesHD: GRPInterface[] = [];

  gameIcons: ResourceIcons;
  cmdIcons: string[];
  raceInsetIcons: RaceInsetIcons;
  workerIcons: WorkerIcons;
  arrowIcons: string[];
  hoverIcons: CenteredCursorIcons;
  dragIcons: CenteredCursorIcons;
  wireframeIcons: string[];
  smaaImages: any[];
  loadImageAtlas: (imageId: number) => Promise<void>;

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
    loadImageAtlas,
    smaaImages
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
    this.loadImageAtlas = loadImageAtlas;
    this.smaaImages = smaaImages;
  }

  async loadAudioFile(id: number) {
    return (await readCascFile(`sound/${this.bwDat.sounds[id].file}`)).buffer;
  }


  dispose() {
    closeCascStorage();
  }
}

export default Assets;
