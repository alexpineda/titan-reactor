import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import * as log from "./ipc/log";
import { Scene } from "./render";
import chkToTerrainMesh from "./image/generate-map/chk-to-terrain-mesh";
import processStore, { Process } from "@stores/process-store";
import { Assets, AssetTextureResolution, UnitTileScale } from "common/types";
import startMap from "./start-map";
import { waitForTruthy } from "@utils/wait-for-process";
import { cleanMapTitles } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import settingsStore from "@stores/settings-store";
import gameStore from "@stores/game-store";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {
  processStore().start(Process.MapInitialization, 3);
  const settings = settingsStore().data;
  log.verbose("loading chk");

  const chk = new Chk(await loadScm(chkFilepath));
  cleanMapTitles(chk);

  //FIXME: add janitor
  useWorldStore.setState({
    map: chk
  });

  updateWindowTitle(chk.title);

  await waitForTruthy<Assets>(() => gameStore().assets);

  processStore().increment(Process.MapInitialization);

  log.verbose("initializing scene");
  const { terrain } = await chkToTerrainMesh(chk, {
    textureResolution: settings.assets.terrain === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD,
    anisotropy: settings.graphics.anisotropy,
    shadows: settings.graphics.terrainShadows
  });
  const scene = new Scene(chk.size[0], chk.size[1], terrain.mesh);

  ImageHD.useDepth = false;
  processStore().increment(Process.MapInitialization);

  const state = await startMap(
    chk,
    terrain,
    scene
  );
  processStore().complete(Process.MapInitialization);

  return state;
};
