import type Chk from "bw-chk";
import {
  OpenBW,
} from "common/types";
import {
  BasePlayer
} from "@core";
import { getOpenBW } from "@openbw";
import {
  renderComposer
} from "@render";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import settingsStore from "@stores/settings-store";
import CommandsStream from "@process-replay/commands/commands-stream";
import { createWorld } from "@core/world/world-composer";
import { setDumpUnitCall } from "@plugins/plugin-system-ui";
import readCascFile from "@utils/casclib";

export async function makeGameScene(
  map: Chk,
  janitor: Janitor,
  commandsStream: CommandsStream,
  onOpenBWReady: (openBW: OpenBW) => BasePlayer[],
) {

  const openBW = await getOpenBW();

  setDumpUnitCall((id) => openBW.get_util_funcs().dump_unit(id));

  await openBW.start(readCascFile);

  const basePlayers = onOpenBWReady(openBW);

  const { sceneComposer, surfaceComposer, sessionApi, ...worldComposer } = janitor.mop(await createWorld(openBW, gameStore().assets!, map, basePlayers, commandsStream));

  worldComposer.init();

  await worldComposer.activate(false, settingsStore().data.game.sceneController, { target: sceneComposer.startLocations[0] });

  return () => {

    janitor.dispose();
    renderComposer.getWebGLRenderer().physicallyCorrectLights = false;

  }
}