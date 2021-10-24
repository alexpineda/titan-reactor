import { promises as fsPromises } from "fs";

import { BwDATType } from "../common/bwdat/core/BwDAT";
import { loadAllDataFiles } from "../common/bwdat/core/loadAllDataFiles";
import { UnitDAT } from "../common/bwdat/core/UnitsDAT";
import Icons from "../common/Icons";
import { Anim } from "../common/image/anim";
import GrpFileLoader from "../common/image/GrpFileLoader";
import GrpHD from "../common/image/GrpHD";
import readCascFile, { closeCascStorage, openCascStorage } from "../common/utils/casclib";
import ContiguousContainer from "./game-data/ContiguousContainer";
import { completeAssetsLoaded, increaseAssetsLoaded } from "./stores/loadingStore";
import electronFileLoader from "./utils/electronFileLoader";

// import loadEnvironmentMap from "../common/image/envMap";
// import { WebGLRenderer } from "three";

class Assets {
  bwDat?: BwDATType;
  grps?: GrpHD[];
  icons: any;
  selectionCirclesHD: any;

  constructor() {
    this.selectionCirclesHD = null;
    this.icons = null;
  }

  async preload(starcraftPath: string, communityModelsPath: string) {
    electronFileLoader((file: string) => {
      if (file.includes(".glb") || file.includes(".hdr")) {
        //todo change to invoke
        return fsPromises.readFile(file);
      } else {
        return readCascFile(file);
      }
    });

    // log("loading DAT and ISCRIPT files");

    openCascStorage(starcraftPath);

    const origBwDat = await loadAllDataFiles(readCascFile);
    const bwDat = {
      ...origBwDat,
      units: origBwDat.units.map((unit: any) => new UnitDAT(unit)),
    };
    window.bwDat = this.bwDat = bwDat;
    increaseAssetsLoaded();

    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = Anim(sdAnimBuf);

    this.selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
      const selCircleGRP = new GrpHD();
      const readAnim = async () => await readCascFile(`anim/main_${i}.anim`);
      const readAnimHD2 = async () =>
        await readCascFile(`HD2/anim/main_${i}.anim`);
      await selCircleGRP.load({
        readAnim,
        readAnimHD2,
        imageDef: { index: i },
      });

      this.selectionCirclesHD.push(selCircleGRP);
    }
    increaseAssetsLoaded();

    // todo compare performance before removing prototype property to useGameStore
    ContiguousContainer.prototype.bwDat = bwDat;

    // log("loading env map");
    // const renderer = new WebGLRenderer();
    // // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    // renderer.dispose();

    this.icons = new Icons();
    await this.icons.generate();
    increaseAssetsLoaded();

    const grpLoader = new GrpFileLoader(
      bwDat,
      communityModelsPath,
      readCascFile,
      sdAnim,
      sdAnimBuf
    );
    this.grps = [];

    for (let i = 0; i < 999; i++) {
      this.grps[i] = await grpLoader.load(i);
      increaseAssetsLoaded();
    }
    completeAssetsLoaded();
  }

  async loadAudioFile(id: number) {
    return (await readCascFile(`sound/${this.bwDat?.sounds[id].file}`)).buffer;
  }

  dispose() {
    closeCascStorage();
  }
}

export default Assets;
