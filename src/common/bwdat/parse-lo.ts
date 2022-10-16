import { Vector2 } from "three";
import range from "../utils/range";

export type LoDAT = Vector2[][];

export const parseLo = ( buf: Buffer ): LoDAT => {
    const frames = buf.readUInt32LE( 0 );
    const overlays = buf.readUInt32LE( 4 );

    const frameData = range( 0, frames ).map( ( frame ) => {
        let offset = buf.readUInt32LE( 8 + 4 * frame );
        return range( 0, overlays ).map( () => {
            const coords = new Vector2( buf.readInt8( offset ), buf.readInt8( offset + 1 ) );
            offset = offset + 2;
            return coords;
        } );
    } );

    return frameData;
};
