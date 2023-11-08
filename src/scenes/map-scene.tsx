// import loadScm from "@utils/load-scm";
import { log } from "@ipc/log";
import processStore from "@stores/process-store";
import { OpenBW } from "@openbw/openbw";

import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import gameStore from "@stores/game-store";
import { Janitor } from "three-janitor";
import { startOpenBWAndWorld } from "./start-openbw-and-world";
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
import { pluginsStore } from "@stores/plugins-store";
import { TRScene, TRSceneID } from "./scene";
import { GameScene } from "./game-scene/game-scene";
// import loadScm from "@utils/load-scm";
// import { openFile } from "@ipc/files";

const updateWindowTitle = ( title: string ) => {
    document.title = `Titan Reactor - ${title}`;
};

export class MapScene implements TRScene {
    id: TRSceneID = "@map";
    #fileBuffer: ArrayBuffer;
    constructor(fileBuffer: ArrayBuffer) {
        this.#fileBuffer = fileBuffer;
    }
    async load() {

        console.log( this.#fileBuffer )
        await gameStore().assets?.openCascStorage();
        gameStore().assets?.resetImagesCache();

        processStore().clearCompleted();
        const process = processStore().create( "map", 3 );
        log.debug( "loading chk" );

        const janitor = new Janitor( "MapSceneLoader" );
        const chkBuffer = {} as Buffer; // await loadScm( Buffer.from(fileBuffer ));

        const chkDowngrader = new ChkDowngrader();
        const dBuffer = chkDowngrader.downgrade( chkBuffer );
        const map = new Chk( dBuffer );

        cleanMapTitles( map );
        updateWindowTitle( map.title );

        useReplayAndMapStore.setState( { map, mapImage: await createMapImage( map ) } );
        settingsStore().initSessionData( "map" );
        pluginsStore().setSessionPlugins( "replay" );
        globalEvents.emit( "map-ready", { map } );

        janitor.mop( () => useReplayAndMapStore.getState().reset(), "reset replayMapStore" );

        process.increment();

        log.debug( "initializing scene" );

        process.increment();

        if ( settingsStore().data.graphics.preloadMapSprites ) {
            await preloadMapUnitsAndSpriteFiles( gameStore().assets!, map );
        }

        const worldComposer = await startOpenBWAndWorld(
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
        worldComposer.surfaceComposer.gameSurface.show();
        worldComposer.apiSession.ui.show();
        janitor.mop(music.playGame());
        return {
            component: <GameScene />,
            surface: worldComposer.surfaceComposer.gameSurface.canvas,
            dispose: () => janitor.dispose(),
        }
    }
}