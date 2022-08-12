import Chk from "bw-chk";
import loadScm from "@utils/load-scm";

import {
  ImageHD,
} from "@core";
import * as log from "@ipc/log";
import { BaseScene } from "@render";
import chkToTerrainMesh from "@image/generate-map/chk-to-terrain-mesh";
import processStore, { Process } from "@stores/process-store";
import { Assets, AssetTextureResolution, UnitTileScale } from "common/types";
import { mapScene as mapScene } from "./map-scene";
import { waitForTruthy } from "@utils/wait-for-process";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import settingsStore from "@stores/settings-store";
import gameStore from "@stores/game-store";
import Janitor from "@utils/janitor";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export const mapSceneLoader = async (chkFilepath: string) => {
  processStore().start(Process.MapInitialization, 3);
  const settings = settingsStore().data;
  log.verbose("loading chk");

  const janitor = new Janitor;

  const map = new Chk(await loadScm(chkFilepath));
  cleanMapTitles(map);
  updateWindowTitle(map.title);

  await waitForTruthy<Assets>(() => gameStore().assets);

  useWorldStore.setState({ map, mapImage: await createMapImage(map) });
  janitor.add(() => useWorldStore.getState().reset())

  processStore().increment(Process.MapInitialization);

  log.verbose("initializing scene");
  const { terrain } = await chkToTerrainMesh(map, {
    textureResolution: settings.assets.terrain === AssetTextureResolution.SD ? UnitTileScale.SD : UnitTileScale.HD,
    anisotropy: settings.graphics.anisotropy,
    shadows: settings.graphics.terrainShadows
  });
  const scene = new BaseScene(map.size[0], map.size[1], terrain);

  ImageHD.useDepth = false;
  processStore().increment(Process.MapInitialization);

  const state = await mapScene(
    map,
    terrain,
    scene,
    janitor
  );
  processStore().complete(Process.MapInitialization);

  return state;
};
