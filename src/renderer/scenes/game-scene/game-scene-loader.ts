import { OpenBW } from "@openbw/openbw";

import { BasePlayer } from "@core";
import { getOpenBW } from "@openbw";
import { Janitor } from "three-janitor";
import gameStore from "@stores/game-store";
import { WorldComposer, createWorldComposer } from "@core/world/world-composer";
import { readCascFileRemote as readCascFile } from "@ipc/casclib";
import processStore from "@stores/process-store";
import { CommandsStream } from "process-replay";
import { root } from "@render/root";
import { renderIngGameMenuScene } from "../in-game-menu/ingame-menu-scene";

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

    janitor.addEventListener( window, "keydown", "keydown:esc", ( evt: KeyboardEvent ) => {
        if ( evt.key === "Escape" && document.pointerLockElement === null ) {
            renderIngGameMenuScene(document.getElementById("in-game-menu") === null);
        }
    } );
    return {
        start() {
            root.render( null );
            worldComposer.surfaceComposer.mount();
        },
        beforeNext() {
            // since we are not using root render ( and just mounting the canvas )
            worldComposer.surfaceComposer.gameSurface.hide();
        },
        dispose() {
            janitor.dispose();
        },
    };
}
