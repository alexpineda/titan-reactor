// import type { Replay  } from "@process-replay/parse-replay";
// import { Replay, parseReplay } from "@process-replay/parse-replay";
// import { writeReplay } from "@process-replay/write-replay";
// import { Version } from "@process-replay/version";
// import CommandsStream from "@process-replay/commands/commands-stream";
// import ChkDowngrader from "@process-replay/chk/chk-downgrader";

import { CMDS, Replay } from "process-replay";
import {
    ChkDowngrader,
    CommandsStream,
    detectMeleeObservers,
    parseReplay,
    sanityCheckCommands,
    writeCommands,
    writeReplay,
    Version,
} from "process-replay";

import Chk from "bw-chk";

import { OpenBW } from "@openbw/openbw";

import { GameTypes } from "common/enums";
import { log } from "@ipc/log";
import { settingsStore } from "@stores/settings-store";
import processStore from "@stores/process-store";
import { makeGameScene } from "./game-scene/game-scene-loader";
import { Janitor } from "three-janitor";
import { useReplayAndMapStore } from "@stores/replay-and-map-store";
// import { cleanMapTitles  } from "@utils/chk-utils";
import { preloadMapUnitsAndSpriteFiles } from "@utils/preload-map-units-and-sprites";
import { SceneState } from "./scene";
import gameStore from "@stores/game-store";
import { waitForSeconds } from "@utils/wait-for";
import { globalEvents } from "@core/global-events";
import debounce from "lodash.debounce";
import { music } from "@audio/music";
import { cleanMapTitles, createMapImage } from "@utils/chk-utils";
import { pluginsStore } from "@stores/plugins-store";
import { calculateImagesFromUnitsIscript } from "@utils/images-from-iscript";
export type ValidatedReplay = Replay & {
    buffer: Buffer;
    uid: number;
};

export const loadAndValidateReplay = async ( fileBuffer: ArrayBuffer ) => {
    const settings = settingsStore().data;

    let replayBuffer = fileBuffer;
    let replay = await parseReplay( Buffer.from( replayBuffer ) );

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

    if ( replay.version !== Version.TitanReactor ) {
        const chkDowngrader = new ChkDowngrader();
        const chk = chkDowngrader.downgrade( ( replay.chk as Buffer ).slice( 0 ) );
        const rawCmds = sanityCheck.length
            ? writeCommands( replay, [] )
            : ( replay.rawCmds as Buffer );

        replayBuffer = writeReplay(
            replay.rawHeader as Buffer,
            rawCmds,
            chk,
            replay.limits
        );

        replay = await parseReplay( Buffer.from( replayBuffer ) );
    }

    replay.header.players = replay.header.players.filter( ( p ) => p.isActive );

    if (
        ( replay.header.gameType as GameTypes ) === GameTypes.Melee &&
        settings.utilities.detectMeleeObservers
    ) {
        const meleeObservers = detectMeleeObservers(
            settings.utilities.detectMeleeObserversThreshold,
            new CommandsStream( replay.rawCmds as Buffer, replay.stormPlayerToGamePlayer )
        );

        replay.header.players = replay.header.players.filter(
            ( p ) => !meleeObservers.includes( p.id )
        );
    }

    ( replay as ValidatedReplay ).buffer = Buffer.from( replayBuffer );
    ( replay as ValidatedReplay ).uid = Math.random();

    return replay as ValidatedReplay;
};

export const replaySceneLoader = async (
    replay: ValidatedReplay
): Promise<SceneState> => {
    processStore().clearCompleted();
    const loadProcess = processStore().create( "replay", 2 );

    log.info( `@replay-scene-loader/init: ${replay.header.gameName}` );

    await gameStore().assets?.openCascStorage();
    //todo: can we keep images?
    // gameStore().assets?.resetImagesCache();

    const janitor = new Janitor( "ReplaySceneLoader" );

    document.title = "Titan Reactor";

    const map = new Chk( replay.chk as Buffer );

    cleanMapTitles( map );

    const gameTitle = `${map.title} - ${replay.header.players
        .map( ( { name } ) => name )
        .join( ", " )}`;

    log.info( `@replay-scene-loader/game: ${gameTitle}` );
    log.info( `@replay-scene-loader/game-type: ${GameTypes[replay.header.gameType]!}` );

    useReplayAndMapStore.setState( { replay, map, mapImage: await createMapImage( map ) } );
    useReplayAndMapStore.setState( { replay, map } );
    settingsStore().initSessionData( "replay" );
    pluginsStore().setSessionPlugins( "replay" );
    globalEvents.emit( "replay-ready", { replay, map } );

    janitor.mop(
        () => useReplayAndMapStore.getState().reset(),
        "reset replay and map store"
    );

    
    if ( settingsStore().data.graphics.preloadMapSprites ) {

        const preloadCommandUnits = new Set<number>();
        const postLoad = new Set<number>();

        if ( replay ) {
            const preloadCommands = new CommandsStream(
                replay.rawCmds,
                replay.stormPlayerToGamePlayer
            );
            const preloadCommandTypes = [
                CMDS.TRAIN.id,
                CMDS.UNIT_MORPH.id,
                CMDS.BUILDING_MORPH.id,
                CMDS.BUILD.id,
            ];

            let preOrPost = 0;

            for ( const command of preloadCommands.generate() ) {
                if ( typeof command !== "number" ) {
                    if ( preloadCommandTypes.includes( command.id ) ) {
                        for (const imageId of calculateImagesFromUnitsIscript( gameStore().assets!.bwDat, [command.unitTypeId!] ) ) {
                            if (preOrPost === 0) {
                                preloadCommandUnits.add( imageId );
                            } else {
                                postLoad.add( imageId );
                            }
                        }
                    }
                } else {
                    // preload up to 2 minutes of commands
                    if (command > 2 * 24 * 60) {
                        preOrPost = 1;
                    }
                }
            }
        }
        
        await preloadMapUnitsAndSpriteFiles( gameStore().assets!, map, [...preloadCommandUnits] );

        for (const imageId of postLoad) {
            gameStore().assets!
            .loadImageAtlas( imageId, 2 )//, assets.bwDat )
        }
    }

    loadProcess.increment();

    const commands = new CommandsStream(
        replay.rawCmds as Buffer,
        replay.stormPlayerToGamePlayer
    );
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
        ( worldComposer ) => {
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
                openBW.setReplayFrameListener( () => {} );
                console.log( "GG WP" );
                globalEvents.emit( "replay-complete", replay );
            }, 1000 );

            openBW.setReplayFrameListener( () => {
                if ( openBW.getCurrentReplayFrame() > replay.header.frameCount - 1000 ) {
                    emitComplete();
                }
            } );
            // openBW.setCurrentReplayFrame( 0 );

            // worldComposer.preRunComplete();
        }
    );
    loadProcess.increment();

    document.title = `Titan Reactor - ${gameTitle}`;

    await waitForSeconds( 2 );

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
