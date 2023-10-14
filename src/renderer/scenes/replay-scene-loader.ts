import { Replay, parseReplay } from "@process-replay/parse-replay";
import { writeReplay } from "@process-replay/write-replay";
import { Version } from "@process-replay/version";
import CommandsStream from "@process-replay/commands/commands-stream";
import ChkDowngrader from "@process-replay/chk/chk-downgrader";

import Chk from "bw-chk";

import { OpenBW } from "@openbw/openbw";

import { GameTypes } from "common/enums";
import { openFile } from "@ipc/files";
import { log } from "@ipc/log";
import { settingsStore } from "@stores/settings-store";
import processStore from "@stores/process-store";
import { makeGameScene } from "./game-scene/game-scene";
import { Janitor } from "three-janitor";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { sanityCheckCommands, writeCommands } from "@process-replay/write-commands";
import { detectMeleeObservers } from "@utils/replay-utils";
import { preloadMapUnitsAndSpriteFiles } from "@utils/preload-map-units-and-sprites";
import { SceneState } from "./scene";
import gameStore from "@stores/game-store";
import {   waitForSeconds, waitForTruthy } from "@utils/wait-for";
import { music } from "@core/global";
import { writeFileSync } from "fs";
import { globalEvents } from "@core/global-events";
import debounce from "lodash.debounce";
// import { writeFileSync } from "fs";

// const createNarrative = (commands: CommandsStream) => {
//     const o = commands.copy();
//     let s = "Frame,Command_Type,X,Y,Unit_Type_ID,Hotkey_Type,Group,Order,Value,Units\n";
//     for (const c of o.generate()) {
//         if (typeof c === "number") {

//         } else {

//             const unitTags = [c.unit].filter( ( x ) => x !== undefined ).concat( c.unitTags ?? [] );

//             s = s + [
//                 c.frame ?? "", 
//                 c.id  ?? "", 
//                 c.x ?? "", 
//                 c.y ?? "", 
//                 c.unitTypeId ? `0x${c.unitTypeId.toString(16)}` : "", 
//                 c.hotkeyType ?? "", 
//                 c.group ?? "", 
//                 c.order ? `0x${c.order.toString(16)}` : "", 
//                 c.value ?? "", 
//                 unitTags?.join(":")].join(",") + "\n";
//         }
//     }
//     writeFileSync( "G:\\commands.txt", s );
// }
export type ValidatedReplay = Replay & {
    buffer: Buffer;
    uid: number;
}
export const loadAndValidateReplay = async ( filepath: string ) => {
    const settings = settingsStore().data;

    let replayBuffer = await openFile( filepath );
    let replay = await parseReplay( replayBuffer );

    if ( replay.header.players.some( ( player ) => player.isComputer ) ) {
        throw new Error( "Replays with computer players are not currently supported." );
    }

    const sanityCheck = settings.utilities.sanityCheckReplayCommands
        ? sanityCheckCommands( replay, true )
        : [];

    if ( sanityCheck.length ) {
        sanityCheck.forEach(
            ( command, i ) =>
                i < 10 &&
                log.warn( `@sanity-check/${command.reason}: ${JSON.stringify( command )}` )
        );

        if ( sanityCheck.length > 10 ) {
            log.warn(
                `@load-replay/sanity-check: ${sanityCheck.length} total invalid commands found`
            );
        }
    }

    if ( replay.version !== Version.titanReactor ) {
        const chkDowngrader = new ChkDowngrader();
        const chk = chkDowngrader.downgrade( replay.chk.slice( 0 ) );
        const rawCmds = sanityCheck.length ? writeCommands( replay, [] ) : replay.rawCmds;

        replayBuffer = writeReplay( replay.rawHeader, rawCmds, chk, replay.limits );


        replay = await parseReplay( replayBuffer );
    }


    replay.header.players = replay.header.players.filter( ( p ) => p.isActive );

    if (
        replay.header.gameType === GameTypes.Melee &&
        settings.utilities.detectMeleeObservers
    ) {
        const meleeObservers = detectMeleeObservers(
            settings.utilities.detectMeleeObserversThreshold,
            new CommandsStream( replay.rawCmds, replay.stormPlayerToGamePlayer )
        );

        replay.header.players = replay.header.players.filter(
            ( p ) => !meleeObservers.includes( p.id )
        );
    }

    if ( process.env.NODE_ENV === "development" ) {
        writeFileSync( "G:\\last_replay.rep", replayBuffer );
    }

    (replay as ValidatedReplay).buffer = replayBuffer;
    (replay as ValidatedReplay).uid = Math.random();
    return replay as ValidatedReplay;
}


export const replaySceneLoader = async ( replay: ValidatedReplay ): Promise<SceneState> => {
    processStore().clearCompleted();
    const loadProcess = processStore().create( "replay", 2 );

    log.info( `@replay-scene-loader/init: ${replay.header.gameName}` );

    await gameStore().assets?.openCascStorage();
    gameStore().assets?.resetImagesCache();

    const janitor = new Janitor( "ReplaySceneLoader" );

    document.title = "Titan Reactor";


    const map = new Chk( replay.chk );

    cleanMapTitles( map );

    const gameTitle = `${map.title} - ${replay.header.players
        .map( ( { name } ) => name )
        .join( ", " )}`;

    log.info( `@replay-scene-loader/game: ${gameTitle}` );
    log.info( `@replay-scene-loader/game-type: ${GameTypes[replay.header.gameType]!}` );

    useReplayAndMapStore.setState( { replay, map, mapImage: await createMapImage( map ) } );
    settingsStore().initSessionData( "replay" );
    globalEvents.emit( "replay-ready", { replay, map } );

    janitor.mop(
        () => useReplayAndMapStore.getState().reset(),
        "reset replay and map store"
    );

    // wait for initial assets to load
    await waitForTruthy( () => gameStore().assets?.remaining === 0 );

    if ( settingsStore().data.graphics.preload ) {
        await preloadMapUnitsAndSpriteFiles( gameStore().assets!, map, replay );
    }

    loadProcess.increment();

    const commands = new CommandsStream( replay.rawCmds, replay.stormPlayerToGamePlayer );
    const scene = await makeGameScene(
        janitor,
        commands,
        ( openBW: OpenBW ) => {
            openBW.setUnitLimits( replay.limits.units );
            openBW.loadReplay( replay.buffer );

            const mapPlayers = replay.header.players.map( ( player ) => ( {
                id: player.id,
                name: player.name,
                color: player.color,
                race: player.race,
            } ) );

            return mapPlayers;
        },
        worldComposer => {
            const openBW = worldComposer.world.openBW;

            // openBW.setGameSpeed(64);
           
            // openBW.setReplayFrameListener( () => {
            //     worldComposer.preRunFrame();
            // })
            // // let i = 0;
            // while (openBW.nextFrameSafe() < replay.header.frameCount ) {
            //     // console.log( openBW.getCurrentFrame(), openBW.getCurrentReplayFrame() )
            //     // worldComposer.preRunFrame();
            //     // i = i  + 1;
            //     // if ( i > 1000) {
            //     //     break;
            //     // }
            // }

            const emitComplete = debounce( () => {
                openBW.setReplayFrameListener( () => { } );
                console.log("GG WP");
                globalEvents.emit("replay-complete", replay);
            }, 1000);

            openBW.setReplayFrameListener( () => {
                if (openBW.getCurrentReplayFrame()  > replay.header.frameCount  - 1000  ) {
                    emitComplete();
                }
            })
            // openBW.setCurrentReplayFrame( 0 );

            // worldComposer.preRunComplete();
          
        }
    );
    loadProcess.increment();


    document.title = `Titan Reactor - ${gameTitle}`;

    await waitForSeconds(2);

    return {
        id: "@replay",
        start: () => {
            scene.start();
            music.playGame();

        },
        dispose: () => {
            music.stop();
            scene.dispose();
        },
    };
};
