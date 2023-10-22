// import loadScm from "@utils/load-scm";
import { log } from "@ipc/log";
import processStore from "@stores/process-store";
import { OpenBW } from "@openbw/openbw";

import { waitForTruthy } from "@utils/wait-for";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import gameStore from "@stores/game-store";
import { Janitor } from "three-janitor";
import { makeGameScene } from "./game-scene/game-scene";
import { SceneState } from "./scene";
import { settingsStore } from "@stores/settings-store";
import { preloadMapUnitsAndSpriteFiles } from "@utils/preload-map-units-and-sprites";
import {
    PlayerBufferViewIterator,
    PlayerController,
} from "@openbw/structs/player-buffer-view";
import { BasePlayer } from "@core/players";
import { playerColors } from "common/enums";
import { raceToString } from "@utils/string-utils";
import { globalEvents } from "@core/global-events";
import { music } from "@audio/music";
import { ChkDowngrader, CommandsStream } from "process-replay";
import Chk from "bw-chk";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
// import loadScm from "@utils/load-scm";
// import { openFile } from "@ipc/files";

const updateWindowTitle = ( title: string ) => {
    document.title = `Titan Reactor - ${title}`;
};
export const mapSceneLoader = async ( file: File ): Promise<SceneState> => {
    await gameStore().assets?.openCascStorage();
    gameStore().assets?.resetImagesCache();

    processStore().clearCompleted();
    const process = processStore().create( "map", 3 );
    log.debug( "loading chk" );

    const janitor = new Janitor( "MapSceneLoader" );
    const chkBuffer = {} as Buffer; // await loadScm( Buffer.from(await openFile( file ) ));

    const chkDowngrader = new ChkDowngrader();
    const dBuffer = chkDowngrader.downgrade( chkBuffer );
    const map = new Chk( dBuffer );

    cleanMapTitles( map );
    updateWindowTitle( map.title );

    useReplayAndMapStore.setState( { map, mapImage: await createMapImage( map ) } );
    settingsStore().initSessionData( "map" );
    globalEvents.emit( "map-ready", { map } );

    janitor.mop( () => useReplayAndMapStore.getState().reset(), "reset replayMapStore" );

    process.increment();

    log.debug( "initializing scene" );

    await waitForTruthy( () => gameStore().assets?.remaining === 0 );

    process.increment();

    if ( settingsStore().data.graphics.preload ) {
        await preloadMapUnitsAndSpriteFiles( gameStore().assets!, map );
    }

    const scene = await makeGameScene(
        janitor,
        new CommandsStream(),
        ( openBW: OpenBW ) => {
            openBW.setUnitLimits( 1700 );
            openBW.loadMap( dBuffer );

            const mapPlayers: BasePlayer[] = [];
            const p = new PlayerBufferViewIterator( openBW );

            let id = 0;

            for ( const player of p ) {
                if ( player.controller === PlayerController.Occupied ) {
                    mapPlayers.push( {
                        id: id,
                        color: playerColors[id]!.hex,
                        name: `Player ${id}`,
                        race: raceToString( player.race ),
                    } );

                    id++;
                }
            }

            return mapPlayers;
        }
    );

    return {
        id: "@map",
        start: () => {
            music.playGame();
            scene.start();
        },
        dispose: () => {
            music.stop();
            scene.dispose();
        },
    };
};
