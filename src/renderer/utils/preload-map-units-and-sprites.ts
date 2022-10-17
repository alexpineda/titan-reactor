import { CMDS } from "@process-replay/commands/commands";
import CommandsStream from "@process-replay/commands/commands-stream";
import { Replay } from "@process-replay/parse-replay";
import processStore from "@stores/process-store";
import {
    calculateImagesFromSpritesIscript,
    calculateImagesFromUnitsIscript,
} from "@utils/images-from-iscript";
import Chk from "bw-chk";
import { Assets } from "@image/assets";
import { techTree } from "common/enums";
import gameStore from "@stores/game-store";

export const preloadMapUnitsAndSpriteFiles = async (
    assets: Assets,
    map: Chk,
    replay?: Replay
) => {
    const preloadCommandUnits = new Set<number>();

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

        for ( const command of preloadCommands.generate() ) {
            if ( typeof command !== "number" ) {
                if ( preloadCommandTypes.includes( command.id ) ) {
                    preloadCommandUnits.add( command.unitTypeId! );
                }
            }
        }
    }

    const unitSprites = new Set(
        map.units.map( ( u ) => u.sprite ).filter( ( s ) => Number.isInteger( s ) ) as number[]
    );
    const allSprites = [
        ...preloadCommandUnits,
        ...unitSprites,
        ...new Set( map.sprites.map( ( s ) => s.spriteId ) ),
    ];
    const allImages = calculateImagesFromSpritesIscript( assets.bwDat, allSprites );

    const preload = processStore().create( "preload", allImages.length );

    await Promise.all(
        allImages.map( ( imageId ) =>
            assets
                .loadImageAtlasAsync( imageId, assets.bwDat )
                .then( () => preload.increment() )
        )
    );
};

export const calculateImagesFromTechTreeUnits = ( units: number[] ) => {
    const assets = gameStore().assets!;

    const nextUnits = units
        .map( ( unit ) => {
            const units = techTree[unit]?.units;
            if ( units ) {
                if ( units.unlocks === undefined ) {
                    return units.builds!;
                } else if ( units.builds === undefined ) {
                    return units.unlocks;
                } else {
                    return [ ...units.builds, ...units.unlocks ];
                }
            }
            return [];
        } )
        .flat()
        .filter( ( unit ) => !units.includes( unit ) )
        .filter( ( unit ) => {
            //  -1 means all in unlocks
            return assets.bwDat.units[unit] !== undefined;
        } );

    return calculateImagesFromUnitsIscript( assets.bwDat, nextUnits );
};
