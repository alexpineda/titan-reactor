import { AtlasHD, } from "../../common/image";
import { BwDAT } from "../../common/types";
import GameIcons, { WorkerIcons } from "../../common/image/generate-icons/game-icons";
import {
  closeCascStorage,
  readCascFile,
} from "../../common/utils/casclib";

interface AssetsConstructorArgs {
  bwDat: BwDAT;
  grps: AtlasHD[];
  selectionCirclesHD: AtlasHD[];

  gameIcons: GameIcons;
  cmdIcons: GameIcons;
  raceInsetIcons: GameIcons;
  workerIcons: WorkerIcons;
  arrowIcons: GameIcons;
  hoverIcons: GameIcons;
  dragIcons: GameIcons;
  wireframeIcons: GameIcons;
}

class Assets {
  bwDat: BwDAT;
  grps: AtlasHD[] = [];
  selectionCirclesHD: AtlasHD[] = [];

  gameIcons: GameIcons;
  cmdIcons: GameIcons;
  raceInsetIcons: GameIcons;
  workerIcons: WorkerIcons;
  arrowIcons: GameIcons;
  hoverIcons: GameIcons;
  dragIcons: GameIcons;
  wireframeIcons: GameIcons;

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

  }

  async loadAudioFile(id: number) {
    return (await readCascFile(`sound/${this.bwDat.sounds[id].file}`)).buffer;
  }

  dispose() {
    closeCascStorage();
  }
}

export default Assets;
