import { OpenBW } from "@openbw/openbw";

import { BasePlayer } from "@core";
import { getOpenBW } from "@openbw";
import { Janitor } from "three-janitor";
import gameStore from "@stores/game-store";
import { WorldComposer, createWorldComposer } from "@core/world/world-composer";
import { readCascFileRemote as readCascFile } from "@ipc/casclib";
import processStore from "@stores/process-store";
import { CommandsStream } from "process-replay";
import { renderAppUI } from "../app";
import { GameScene } from "./game-scene";

export async function makeGameScene(
    janitor: Janitor,
    commandsStream: CommandsStream,
    onOpenBWReady: ( openBW: OpenBW ) => BasePlayer[],
    onWorldInitialized?: ( worldComposer: WorldComposer ) => Promise<void> | void
) {
    const openBW = await getOpenBW();

    await openBW.start( readCascFile );

    const basePlayers = onOpenBWReady( openBW );

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

   
    return {
        start() {
            worldComposer.surfaceComposer.gameSurface.show();
            renderAppUI(
                {
                    key: "@game",
                    scene: <GameScene />,
                    surface: worldComposer.surfaceComposer.gameSurface.canvas,
                }
            )
            // worldComposer.surfaceComposer.mount();
        },
        beforeNext() {
            // since we are not using root render ( and just mounting the canvas )
            // worldComposer.surfaceComposer.gameSurface.hide();
        },
        dispose() {
            janitor.dispose();
        },
    };
}
