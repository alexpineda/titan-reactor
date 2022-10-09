import Chk from "bw-chk";
import loadScm from "@utils/load-scm";
import { log } from "@ipc/log";
import processStore from "@stores/process-store";
import { OpenBW } from "common/types";
import { waitForTruthy } from "@utils/wait-for";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import gameStore from "@stores/game-store";
import { Janitor } from "three-janitor";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";
import { makeGameScene } from "./game-scene/game-scene";
import CommandsStream from "@process-replay/commands/commands-stream";
import { SceneState } from "./scene";
import { settingsStore } from "@stores/settings-store";
import { preloadMapUnitsAndSpriteFiles } from "@utils/preload-map-units-and-sprites";
import { PlayerBufferViewIterator, PlayerController } from "@buffer-view/player-buffer-view";
import { BasePlayer } from "@core/players";
import { playerColors } from "common/enums";
import { raceToString } from "@utils/string-utils";
import { Assets } from "@image/assets";
import { music } from "@core/global";

const updateWindowTitle = (title: string) => {
  document.title = `Titan Reactor - ${title}`;
}
export const mapSceneLoader = async (chkFilepath: string): Promise<SceneState> => {

  processStore().clearCompleted();
  const process = processStore().create("map", 3);
  log.debug("loading chk");

  const janitor = new Janitor("MapSceneLoader");
  const chkBuffer = await loadScm(chkFilepath);


  const chkDowngrader = new ChkDowngrader();
  const dBuffer = chkDowngrader.downgrade(chkBuffer);
  const map = new Chk(dBuffer);

  cleanMapTitles(map);
  updateWindowTitle(map.title);

  useReplayAndMapStore.setState({ map, mapImage: await createMapImage(map) });
  settingsStore().set({ session: { type: "map", "sandbox": false } });

  janitor.mop(() => useReplayAndMapStore.getState().reset(), "reset replayMapStore");

  process.increment();

  log.debug("initializing scene");

  const assets = await waitForTruthy<Assets>(() => gameStore().assets);

  process.increment();

  // wait for initial assets to load
  if (settingsStore().data.graphics.preload) {
    await preloadMapUnitsAndSpriteFiles(assets, map);
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

  return {
    id: "@map",
    start: () => {
      music.playGame();
    },
    dispose: () => {
      music.stop();
      disposeScene();
    }
  };;
};
