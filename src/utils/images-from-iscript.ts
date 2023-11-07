import { ImageDAT, BwDAT, opArgOne, UnitDAT } from "common/types";
import uniq from "common/utils/uniq";

export const calculateImagesFromIScript = (
    bwDat: BwDAT,
    image: ImageDAT,
    unit?: UnitDAT | null,
    result = new Set<number>()
): number[] => {
    const getAllImages = ( imageDef: ImageDAT ) => {
        result.add( imageDef.index );

        if ( !imageDef.iscript ) {
            return;
        }
        // if ( imageDef.attackOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.attackOverlay] );
        // }
        // if ( imageDef.damageOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.damageOverlay] );
        // }
        // if ( imageDef.landingDustOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.landingDustOverlay] );
        // }

        // if ( imageDef.liftOffDustOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.liftOffDustOverlay] );
        // }

        // if ( imageDef.shieldOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.shieldOverlay] );
        // }

        // if ( imageDef.specialOverlay > 0 ) {
        //     getAllImages( bwDat.images[imageDef.specialOverlay] );
        // }

        const script = bwDat.iscript.iscripts[imageDef.iscript];
        for ( const offset of script.offsets ) {
            if ( offset === 0 ) continue;
            for ( const cmd of bwDat.iscript.animations[offset] ) {
                const args = cmd[1] as opArgOne;

                switch ( cmd[0] ) {
                    case "imgul":
                    case "imgol":
                    case "imgolorig":
                    case "imguluselo":
                        {
                            const img = bwDat.images[args[0]];

                            getAllImages( img );
                        }
                        break;
                    case "imgulnextid":
                        {
                            const img = bwDat.images[imageDef.index + 1];
                            getAllImages( img );
                        }
                        break;
                    case "sprol":
                    case "highsprol":
                    case "lowsprul":
                    case "spruluselo":
                    case "sprul":
                    case "sproluselo":
                        {
                            const img = bwDat.sprites[args[0]].image;
                            getAllImages( img );
                        }
                        break;
                    case "creategasoverlays":
                        {
                            [ 430, 431, 432, 433, 434, 435, 436, 437, 438, 439 ].forEach(
                                ( v ) => result.add( v )
                            );
                        }
                        break;
                }
            }
        }
    };

    getAllImages( image );

    if ( unit ) {
        if (
            unit.groundWeapon !== 130 &&
            bwDat.weapons[unit.groundWeapon].flingy.sprite.image.index > 0
        ) {
            getAllImages( bwDat.weapons[unit.groundWeapon].flingy.sprite.image );
        }

        if (
            unit.airWeapon !== 130 &&
            bwDat.weapons[unit.airWeapon].flingy.sprite.image.index > 0
        ) {
            getAllImages( bwDat.weapons[unit.airWeapon].flingy.sprite.image );
        }

        if ( unit.constructionImage > 0 ) {
            getAllImages( bwDat.images[unit.constructionImage] );
        }
    }
    return [ ...result ].filter( ( v ) => v !== undefined );
};

export const calculateImagesFromUnitsIscript = ( bwDat: BwDAT, unitIds: number[] ) => {
    const result = new Set<number>();

    uniq( unitIds ).forEach( ( id ) => {
        const unit = bwDat.units[id];
        calculateImagesFromIScript(
            bwDat,
            bwDat.images[unit.flingy.sprite.image.index],
            unit,
            result
        );
    } );

    return [ ...result ].filter( ( v ) => v !== undefined );
};

export const calculateImagesFromSpritesIscript = (
    bwDat: BwDAT,
    spriteIds: number[]
) => {
    const result = new Set<number>();

    uniq( spriteIds ).forEach( ( id ) => {
        const sprite = bwDat.sprites[id];
        calculateImagesFromIScript(
            bwDat,
            bwDat.images[sprite.image.index],
            null,
            result
        );
    } );

    return [ ...result ].filter( ( v ) => v !== undefined );
};
