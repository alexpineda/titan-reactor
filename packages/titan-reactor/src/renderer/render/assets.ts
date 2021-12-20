import { promises as fsPromises } from "fs";

import { loadDATFiles } from "../../common/bwdat/core/load-dat-files";
import Icons from "./icons";
import { AtlasLoader, AtlasHD } from "../../common/image";
import { parseAnim } from "../../common/image/formats";
import { BwDAT } from "../../common/types";
import {
  closeCascStorage,
  openCascStorage,
  readCascFile,
} from "../../common/utils/casclib";
import ContiguousContainer from "../integration/fixed-data/contiguous-container";
import {
  startLoadingProcess,
  updateLoadingProcess,
  completeLoadingProcess,
} from "../stores";
import electronFileLoader from "../utils/electron-file-loader";

class Assets {
  bwDat?: BwDAT;
  grps: AtlasHD[] = [];
  icons = new Icons();
  selectionCirclesHD: AtlasHD[] = [];

  private async _loadSelectionCircles() {
    this.selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
      const selCircleGRP = new AtlasHD();
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
    updateLoadingProcess("assets");
  }

  async preload(starcraftPath: string, communityModelsPath: string) {
    startLoadingProcess({
      id: "assets",
      label: "Loading initial assets",
      max: 1010,
      priority: 10,
      current: 0,
      mode: "determinate",
    });

    electronFileLoader((file: string) => {
      if (file.includes(".glb") || file.includes(".hdr")) {
        //todo change to invoke
        return fsPromises.readFile(file);
      } else {
        return readCascFile(file);
      }
    });

    openCascStorage(starcraftPath);

    //@todo move parsing to client
    this.bwDat = await loadDATFiles(readCascFile);
    updateLoadingProcess("assets");

    const sdAnimBuf = await readCascFile("SD/mainSD.anim");
    const sdAnim = parseAnim(sdAnimBuf);

    this._loadSelectionCircles();

    // todo compare performance before removing prototype property to useGameStore
    ContiguousContainer.prototype.bwDat = this.bwDat;

    // log("loading env map");
    // const renderer = new WebGLRenderer();
    // // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    // renderer.dispose();

    this.icons.generate(readCascFile);

    const atlasLoader = new AtlasLoader(
      this.bwDat,
      communityModelsPath,
      readCascFile,
      sdAnim
    );

    performance.mark("start");
    for (let i = 0; i < 999; i++) {
      this.grps[i] = await atlasLoader.load(i);
    }

    console.log("atlas load time", performance.measure("start"));

    completeLoadingProcess("assets");
  }

  async loadAudioFile(id: number) {
    return (await readCascFile(`sound/${this.bwDat?.sounds[id].file}`)).buffer;
  }

  dispose() {
    closeCascStorage();
  }
}

export default Assets;
