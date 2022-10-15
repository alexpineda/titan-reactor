export const b2ba = ( b: Buffer ) => {
    if ( !( b instanceof Buffer ) ) {
        throw new Error( "Not a buffer" );
    }
    return new Uint8Array( b.buffer, b.byteOffset, b.byteLength );
};
