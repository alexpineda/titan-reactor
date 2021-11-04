import { promises as fsPromises } from "fs";

import { loadDATFiles } from "../../common/bwdat/core/load-dat-files";
import Icons from "./icons";
import { GrpFileLoader, GrpHD } from "../../common/image";
import { Anim } from "../../common/image/formats";
import { BwDATType } from "../../common/types";
import { openCasclib, openCasclibFile, closeCasclib } from "../ipc";
import ContiguousContainer from "../game-data/contiguous-container";
import {
  startLoadingProcess,
  updateLoadingProcess,
  completeLoadingProcess,
} from "../stores";
import electronFileLoader from "../utils/electron-file-loader";

class Assets {
  bwDat?: BwDATType;
  grps: GrpHD[] = [];
  icons = new Icons();
  selectionCirclesHD: GrpHD[] = [];

  async preload(starcraftPath: string, communityModelsPath: string) {
    startLoadingProcess({
      id: "assets",
      label: "Loading assets",
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
        return openCasclibFile(file);
      }
    });

    openCasclib(starcraftPath);

    //@todo move parsing to client
    this.bwDat = await loadDATFiles(openCasclibFile);
    updateLoadingProcess("assets");

    const sdAnimBuf = await openCasclibFile("SD/mainSD.anim");
    const sdAnim = Anim(sdAnimBuf);

    this.selectionCirclesHD = [];
    for (let i = 561; i < 571; i++) {
      const selCircleGRP = new GrpHD();
      const readAnim = async () => await openCasclibFile(`anim/main_${i}.anim`);
      const readAnimHD2 = async () =>
        await openCasclibFile(`HD2/anim/main_${i}.anim`);
      await selCircleGRP.load({
        readAnim,
        readAnimHD2,
        imageDef: { index: i },
      });

      this.selectionCirclesHD.push(selCircleGRP);
    }
    updateLoadingProcess("assets");

    // todo compare performance before removing prototype property to useGameStore
    ContiguousContainer.prototype.bwDat = this.bwDat;

    // log("loading env map");
    // const renderer = new WebGLRenderer();
    // // this.envMap = await loadEnvironmentMap(renderer, `${__static}/envmap.hdr`);
    // renderer.dispose();

    await this.icons.generate();
    updateLoadingProcess("assets");

    const grpLoader = new GrpFileLoader(
      this.bwDat,
      communityModelsPath,
      openCasclibFile,
      sdAnim.sprites
    );

    for (let i = 0; i < 999; i++) {
      this.grps[i] = await grpLoader.load(i);
      updateLoadingProcess("assets");
    }
    completeLoadingProcess("assets");
  }

  async loadAudioFile(id: number) {
    return (await openCasclibFile(`sound/${this.bwDat?.sounds[id].file}`))
      .buffer;
  }

  dispose() {
    closeCasclib();
  }
}

export default Assets;
