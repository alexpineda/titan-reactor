import { UnitsBufferViewIterator } from "@openbw/structs/units-buffer-view";
import { orders } from "common/enums";
import { OpenBW } from "@openbw/openbw";
import range from "common/utils/range";
import { CMDS } from "../process-replay/commands/commands";
import CommandsStream from "../process-replay/commands/commands-stream";

export const detectMeleeObservers = ( threshold: number, cmds: CommandsStream ) => {
    const buildCommands = range( 0, 11 ).fill( 0 );

    let i = 0;
    for ( const cmd of cmds.generate() ) {
        if ( typeof cmd === "number" ) {
            continue;
        }
        if ( cmd.id === CMDS.BUILD.id ) {
            buildCommands[cmd.player] += 1;
            i++;
        }
        if ( i > threshold ) {
            break;
        }
    }

    return buildCommands
        .map( ( count, i ) => ( count <= 5 ? i : null ) )
        .filter( ( x ) => x !== null );
};

export const detectDesyncedReplay = (
    threshold: number,
    openBW: OpenBW,
    frame: number
) => {
    const b = new UnitsBufferViewIterator( openBW );

    openBW.setCurrentReplayFrame( frame );
    openBW.nextFrame();

    let idleUnits = 0;

    for ( const unit of b ) {
        console.log( "checking unit" );
        if ( unit.order === orders.none ) {
            console.log( "unit is idle" );
            idleUnits++;
        }
    }

    openBW.setCurrentReplayFrame( 0 );

    return idleUnits > threshold;
};
