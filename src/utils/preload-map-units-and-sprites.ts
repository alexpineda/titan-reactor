import type { Assets } from "@image/assets";
import gameStore from "@stores/game-store";
import processStore from "@stores/process-store";
import {
    calculateImagesFromSpritesIscript,
    calculateImagesFromUnitsIscript,
} from "@utils/images-from-iscript";
import type Chk from "bw-chk";
import { techTree } from "common/enums";

export const preloadMapUnitsAndSpriteFiles = async (
    assets: Assets,
    map: Pick<Chk, "units" | "sprites">,
    extraImages: number[] = []
) => {

    const unitSprites = new Set(
        map.units.map( ( u ) => u.sprite ).filter( ( s ) => Number.isInteger( s ) ) as number[]
    );
    const allSprites = [
        ...new Set( [...unitSprites, ...map.sprites.map( ( s ) => s.spriteId )] ),
    ];
    const allImages = [ ...calculateImagesFromSpritesIscript( assets.bwDat, allSprites ), ...extraImages];

    const preload = processStore().create( "preload", allImages.length );

    await Promise.all(
        allImages.map( ( imageId ) =>
            assets
                .loader.loadImageImmediate( imageId )
                .then( () => preload.increment() )
        )
    );

};

export const calculateImagesFromTechTreeUnits = (
    units: number[],
    cache?: Set<number>
) => {
    const assets = gameStore().assets!;

    const nextUnits = units
        .filter( ( unitId ) => {
            if ( cache === undefined ) {
                return true;
            }
            return !cache.has( unitId );
        } )
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

    if ( cache ) {
        for ( const unit of units ) {
            cache.add( unit );
        }
    }
    return calculateImagesFromUnitsIscript( assets.bwDat, nextUnits );
};
