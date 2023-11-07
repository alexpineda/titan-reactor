import { UnitsBufferViewIterator } from "@openbw/structs/units-buffer-view";
import { orders } from "common/enums";
import { OpenBW } from "@openbw/openbw";

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
