import BufferList from "bl";
import { readBlock } from "./blocks";
import { uint32 } from "./util/alloc";

export interface LMTS {
    images: number;
    sprites: number;
    thingies: number;
    units: number;
    bullets: number;
    orders: number;
    fogSprites: number;
}

export const parseSCRSection = async ( buf: BufferList ): Promise<LMTS | undefined> => {
    while ( buf.length ) {
        const tag = buf.slice( 0, 4 ).toString( "ascii" );
        const size = buf.readUInt32LE( 4 );
        buf.consume( 8 );

        if ( tag === "LMTS" ) {
            return parseLMTS( await readBlock( buf, 0x1c ) );
        } else {
            buf.consume( size );
        }
    }
};

export const parseLMTS = ( buf: Buffer | BufferList ): LMTS => ( {
    images: buf.readUInt32LE( 0 ),
    sprites: buf.readUInt32LE( 4 ),
    thingies: buf.readUInt32LE( 8 ),
    units: buf.readUInt32LE( 0xc ),
    bullets: buf.readUInt32LE( 0x10 ),
    orders: buf.readUInt32LE( 0x14 ),
    fogSprites: buf.readUInt32LE( 0x18 ),
} );

export const writeLMTS = ( lmts: LMTS ): BufferList =>
    new BufferList( [
        uint32( lmts.images ),
        uint32( lmts.sprites ),
        uint32( lmts.thingies ),
        uint32( lmts.units ),
        uint32( lmts.bullets ),
        uint32( lmts.orders ),
        uint32( lmts.fogSprites ),
    ] );
