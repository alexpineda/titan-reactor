// import { rgbToCanvas } from "@image/canvas";
// import { readCascFile } from "common/casclib";
import { rgbToCanvas } from "@image/canvas";
import { readCascFileRemote } from "@ipc/casclib";
import Chk from "bw-chk";
import { charColor } from "common/enums";

export const omitCharacters = ( str: string ) =>
    Array.from( str )
        .filter( ( char ) => char.charCodeAt( 0 ) > 0x17 )
        .join( "" );

export const processString = ( str: string, useColors = true ) => {
    const defaultColor = "white";
    let currentColor = defaultColor;
    let currentChunk = "";
    const chunks = [];
    const el = ( newLine: boolean, color: string, content: string, i: number ) =>
        newLine ? (
            <div style={{ color }} key={i}>
                {content}
            </div>
        ) : (
            <span style={{ color }} key={i}>
                {content}
            </span>
        );

    for ( let i = 0; i <= str.length; i++ ) {
        const charCode = str.charCodeAt( i );
        const char = str[i];
        const nextColor = charColor.get( charCode );
        const newLine = charCode === 13;
        if ( nextColor || newLine || i === str.length ) {
            // first character won't have current chunk
            if ( currentChunk ) {
                chunks.push( el( newLine, currentColor, currentChunk, i ) );
                currentChunk = "";
                currentColor = useColors ? nextColor ?? defaultColor : defaultColor;
            }
        } else {
            currentChunk += char;
        }
    }

    return <>{chunks}</>;
};

export const cleanMapTitles = ( chk: Chk ) => {
    chk.title = omitCharacters( chk.title );
    chk.description = omitCharacters( chk.description );
};

export const createMapImage = async ( chk: Chk ) => {
    const img = await chk.image(
        Chk.customFileAccess( async ( fs, isOptional ) => {
            try {
                const img = await readCascFileRemote( fs );
                return img;
            } catch ( e ) {
                if ( isOptional ) {
                    return null;
                }
                throw e;
            }
        } ),
        512,
        512
    );

    return rgbToCanvas( { data: img, width: 512, height: 512 }, "rgb" );
};

export const getMapTiles = ( chk: Chk ) => {
    const buffer = chk._tiles;
    //hitchhiker has odd length buffer
    if ( buffer.buffer.byteLength % 2 === 1 ) {
        const tiles = Buffer.alloc( buffer.byteLength + 1 );
        buffer.copy( tiles );
        return new Uint16Array(
            tiles.buffer,
            tiles.byteOffset,
            tiles.byteLength / Uint16Array.BYTES_PER_ELEMENT
        );
    } else {
        return new Uint16Array(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
        );
    }
};
