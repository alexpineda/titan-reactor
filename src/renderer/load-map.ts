import loadScm from "./utils/load-scm";

import Chk from "bw-chk";
import {
  ImageHD,
} from "./core";
import * as log from "./ipc/log";
import { Scene } from "./render";
import chkToTerrainMesh from "./image/generate-map/chk-to-terrain-mesh";
import processStore, { Process } from "@stores/process-store";
import screenStore, { useScreenStore } from "@stores/screen-store";
import { AssetTextureResolution, ScreenType, UnitTileScale } from "common/types";
import TitanReactorMap from "./view-map";
import { waitForProcess } from "@utils/wait-for-process";
import { cleanMapTitles } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import settingsStore from "@stores/settings-store";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export default async (chkFilepath: string) => {
  screenStore().init(ScreenType.Map);

  const settings = settingsStore().data;

  processStore().start(Process.MapInitialization, 3);

  log.verbose("loading chk");
  let chk: Chk;

  try {
    chk = new Chk(await loadScm(chkFilepath));
  } catch (e) {
    screenStore().setError(e instanceof Error ? e : new Error("Invalid chk"));
    return;
  }
  cleanMapTitles(chk);

  //FIXME: add janitor
  useWorldStore.setState({
    map: chk
  });

  updateWindowTitle(chk.title);

  await waitForProcess(Process.AtlasPreload);

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

  log.verbose("initializing gameloop");
  const state = await TitanReactorMap(
    chk,
    terrain,
    scene
  );
  processStore().increment(Process.MapInitialization);
  processStore().complete(Process.MapInitialization);
  screenStore().complete();

  useScreenStore.setState({ state });
  state.start();

};
