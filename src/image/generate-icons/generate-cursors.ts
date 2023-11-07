import { ImageDAT } from "common/types";
import LegacyGRP from "@image/atlas/legacy-grp";

export const generateCursors = async ( grp: Buffer, palette: Uint8Array ) => {
    const grpSD = new LegacyGRP();

    await grpSD.load( {
        readGrp: () => Promise.resolve( grp ),
        imageDef: {} as ImageDAT,
        palettes: [ palette ],
    } );

    if ( !grpSD.texture || !grpSD.frames ) {
        throw new Error( "Could not load grp" );
    }

    return grpSD;
};
