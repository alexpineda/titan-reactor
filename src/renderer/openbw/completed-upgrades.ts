import { StdVector } from "@openbw/structs";
import { OpenBW } from "@openbw/openbw";

import range from "common/utils/range";

export const createCompletedUpgradesHelper = (
    openBW: OpenBW,
    onUpgradeCompleted: ( owner: number, typeId: number, level: number ) => void,
    onResearchCompleted: ( owner: number, typeId: number ) => void
) => {
    const completedUpgrades = range( 0, 8 ).map( () => [] as number[] );
    const completedResearch = range( 0, 8 ).map( () => [] as number[] );
    const completedUpgradesReset = range( 0, 8 ).map( () => [] as number[][] );
    const completedResearchReset = range( 0, 8 ).map( () => [] as number[][] );

    let productionData: StdVector<Int32Array>;

    const updateCompletedUpgrades = ( currentBwFrame: number ) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ( !productionData ) {
            productionData = new StdVector( openBW.HEAP32, openBW._get_buffer( 9 ) );
        }
        const addr32 = openBW._get_buffer( 9 ) >> 2;
        for ( let player = 0; player < 8; player++ ) {
            productionData.address = addr32 + player * 9 + 3;
            _updateCompleted(
                completedUpgrades[player],
                completedUpgradesReset[player],
                3,
                currentBwFrame,
                player,
                onUpgradeCompleted
            );
            productionData.address += 3;
            _updateCompleted(
                completedResearch[player],
                completedResearchReset[player],
                2,
                currentBwFrame,
                player,
                onResearchCompleted
            );
        }
    };

    const _updateCompleted = (
        arr: number[],
        arrReset: number[][],
        size: number,
        currentBwFrame: number,
        owner: number,
        callback: ( owner: number, typeId: number, level: number ) => void
    ) => {
        let j = 0;
        let typeId = 0;
        let level = 0;
        for ( const val of productionData ) {
            if ( j === 0 ) {
                typeId = val;
            } else if ( j === size - 1 ) {
                if ( val === 0 && !arr.includes( typeId ) ) {
                    arr.push( typeId );
                    arrReset.push( [ typeId, currentBwFrame ] );
                    callback( owner, typeId, level );
                }
            } else if ( j === 1 ) {
                level = val;
            }
            j++;
            if ( j === size ) {
                j = 0;
            }
        }
    };

    const resetCompletedUpgrades = ( frame: number ) => {
        for ( let player = 0; player < 8; player++ ) {
            completedResearchReset[player] = completedResearchReset[player].filter(
                ( [ _, techFrame ] ) => techFrame <= frame
            );
            completedResearch[player] = completedResearch.map( ( [ techId ] ) => techId );
            completedUpgradesReset[player] = completedUpgradesReset[player].filter(
                ( [ _, techFrame ] ) => techFrame <= frame
            );
            completedUpgrades[player] = completedUpgrades.map( ( [ techId ] ) => techId );
        }
    };

    return {
        updateCompletedUpgrades,
        resetCompletedUpgrades,
        completedResearch,
        completedUpgrades,
    };
};
