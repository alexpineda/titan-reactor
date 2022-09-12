import Chk from "bw-chk";
import loadScm from "@utils/load-scm";
import * as log from "@ipc/log";
import processStore, { Process } from "@stores/process-store";
import { Assets, OpenBW } from "common/types";
import { waitForTruthy } from "@utils/wait-for";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { useWorldStore } from "@stores";
import gameStore from "@stores/game-store";
import Janitor from "@utils/janitor";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";
import { makeGameScene } from "./game-scene/game-scene";
import CommandsStream from "@process-replay/commands/commands-stream";
import { SceneState } from "./scene";
import settingsStore from "@stores/settings-store";
import { preloadMapUnitsAndSprites } from "@utils/preload-map-units-and-sprites";
import { PlayerBufferViewIterator, PlayerController } from "@buffer-view/player-buffer-view";
import { BasePlayer } from "@core/players";
import { playerColors } from "common/enums";
import { raceToString } from "@utils/string-utils";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export const mapSceneLoader = async (chkFilepath: string): Promise<SceneState> => {

  processStore().start(Process.MapInitialization, 3);
  log.verbose("loading chk");

  const janitor = new Janitor;
  const chkBuffer = await loadScm(chkFilepath);


  const chkDowngrader = new ChkDowngrader();
  const dBuffer = chkDowngrader.downgrade(chkBuffer);
  const map = new Chk(dBuffer);

  cleanMapTitles(map);
  updateWindowTitle(map.title);

  useWorldStore.setState({ map, mapImage: await createMapImage(map) });
  janitor.mop(() => useWorldStore.getState().reset())

  processStore().increment(Process.MapInitialization);

  log.verbose("initializing scene");

  processStore().increment(Process.MapInitialization);

  const assets = await waitForTruthy<Assets>(() => gameStore().assets);

  // wait for initial assets to load
  if (settingsStore().data.assets.preload) {
    await preloadMapUnitsAndSprites(assets, map);
  }

  const disposeScene = await makeGameScene(
    map,
    janitor,
    new CommandsStream(),
    (openBW: OpenBW) => {

      openBW.setUnitLimits(1700);
      openBW.loadMap(dBuffer);

      const players: BasePlayer[] = [];
      const p = new PlayerBufferViewIterator(openBW);

      let id = 0;

      for (const player of p) {

        if (player.controller === PlayerController.Occupied) {

          players.push({
            id: id,
            color: playerColors[id].hex,
            name: `Player ${id}`,
            race: raceToString(player.race)
          });

          id++;

        }

      }

      return players;
    }
  );

  processStore().complete(Process.MapInitialization);

  return {
    id: "@map",
    start: () => { },
    dispose: () => disposeScene(),
  };;
};
