import { OpenBW } from "@openbw/openbw";

import { BasePlayer } from "@core";
import { getOpenBW } from "@openbw";
import { Janitor } from "three-janitor";
import gameStore from "@stores/game-store";
import { WorldComposer, createWorldComposer } from "@core/world/world-composer";
import { readCascFileRemote as readCascFile } from "@ipc/casclib";
import processStore from "@stores/process-store";
import { CommandsStream } from "process-replay";

export async function startOpenBWAndWorld(
    janitor: Janitor,
    commandsStream: CommandsStream,
    onOpenBWReady: ( openBW: OpenBW ) => BasePlayer[],
    onWorldInitialized?: ( worldComposer: WorldComposer ) => Promise<void> | void
) {
    const process = processStore().create("openbw", 3)
    const openBW = await getOpenBW();
    process.increment();

    await openBW.start( readCascFile );
    process.increment();

    const basePlayers = onOpenBWReady( openBW );
    process.complete();

    const worldComposer = janitor.mop(
        await createWorldComposer(
            openBW,
            gameStore().assets!,
            basePlayers,
            commandsStream
        ),
        "worldComposer"
    );

    await worldComposer.init();

    if ( onWorldInitialized ) await onWorldInitialized( worldComposer );

    await worldComposer.activate( false  );

    processStore().clearAll();

   
    return worldComposer;
}
