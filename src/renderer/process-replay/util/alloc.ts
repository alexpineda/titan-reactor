const alloc = ( n: number, cb: ( b: Buffer ) => void ) => {
    const b = Buffer.alloc( n );
    cb( b );
    return b;
};
export const uint8 = ( val: number ) => alloc( 1, ( b: Buffer ) => b.writeUInt8( val ) );
export const uint16 = ( val: number ) => alloc( 2, ( b: Buffer ) => b.writeUInt16LE( val ) );
export const uint32 = ( val: number ) => alloc( 4, ( b: Buffer ) => b.writeUInt32LE( val ) );
