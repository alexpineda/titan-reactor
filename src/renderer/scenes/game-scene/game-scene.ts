import { OpenBW } from "@openbw/openbw";

import { BasePlayer } from "@core";
import { getOpenBW } from "@openbw";
import { Janitor } from "three-janitor";
import gameStore from "@stores/game-store";
import { settingsStore } from "@stores/settings-store";
import CommandsStream from "@process-replay/commands/commands-stream";
import { WorldComposer, createWorldComposer } from "@core/world/world-composer";
import { readCascFileRemote as readCascFile } from "@ipc/casclib";
import processStore from "@stores/process-store";

export async function makeGameScene(
  janitor: Janitor,
  commandsStream: CommandsStream,
  onOpenBWReady: (openBW: OpenBW) => BasePlayer[],
  onWorldInitialized?: (worldComposer: WorldComposer) => Promise<void> | void,
) {
  const openBW = await getOpenBW();

  await openBW.start(readCascFile);

  const basePlayers = onOpenBWReady(openBW);

  const worldComposer = janitor.mop(
    await createWorldComposer(
      openBW,
      gameStore().assets!,
      basePlayers,
      commandsStream,
    ),
    "worldComposer",
  );

  await worldComposer.init();

  if (onWorldInitialized)
    await onWorldInitialized(worldComposer);

  await worldComposer.activate(
    false,
    settingsStore().data.input.sceneController,
    {
      target: worldComposer.sceneComposer.api.initialStartLocation
    },
  );

  processStore().clearAll();

  return {
    async start() {
      worldComposer.surfaceComposer.mount();
    },
    dispose() {
      janitor.dispose();
    },
  };
}
