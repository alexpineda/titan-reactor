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
import { Janitor } from "@utils/janitor";
import gameStore from "@stores/game-store";
import settingsStore from "@stores/settings-store";
import CommandsStream from "@process-replay/commands/commands-stream";
import { createWorldComposer } from "@core/world/world-composer";
import readCascFile from "@utils/casclib";

export async function makeGameScene(
  map: Chk,
  janitor: Janitor,
  commandsStream: CommandsStream,
  onOpenBWReady: (openBW: OpenBW) => BasePlayer[],
) {

  const openBW = await getOpenBW();

  await openBW.start(readCascFile);

  const basePlayers = onOpenBWReady(openBW);

  const worldComposer = janitor.mop(await createWorldComposer(openBW, gameStore().assets!, map, basePlayers, commandsStream), "worldComposer");

  worldComposer.init();

  await worldComposer.activate(false, settingsStore().data.input.sceneController, { target: worldComposer.sceneComposer.playerStartLocations[0] ?? worldComposer.sceneComposer.startLocations[0] });

  return () => {

    janitor.dispose();

    renderComposer.getWebGLRenderer().physicallyCorrectLights = false;

  }
}