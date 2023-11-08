import { settingsStore } from "@stores/settings-store";
import {  Replay } from "process-replay";
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
import { log } from "@ipc/log";
import { GameTypes } from "common/enums";

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