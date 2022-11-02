import range from "../utils/range";
/**
 * @public
 */
export type LoDAT = number[][][];

export const parseLo = ( buf: Buffer ): LoDAT => {
    const frames = buf.readUInt32LE( 0 );
    const overlays = buf.readUInt32LE( 4 );

    const frameData = range( 0, frames ).map( ( frame ) => {
        let offset = buf.readUInt32LE( 8 + 4 * frame );
        return range( 0, overlays ).map( () => {
            const coords = [ buf.readInt8( offset ), buf.readInt8( offset + 1 ) ];
            offset = offset + 2;
            return coords;
        } );
    } );

    return frameData;
};
