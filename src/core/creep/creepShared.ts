import range from "common/utils/range";
// creep neighbour calculations ported from openbw

//https://stackoverflow.com/questions/6232939/is-there-a-way-to-correctly-multiply-two-32-bit-integers-in-javascript/6422061
function multiply_uint32( a: number, b: number ) {
    const ah = ( a >> 16 ) & 0xffff,
        al = a & 0xffff;
    const bh = ( b >> 16 ) & 0xffff,
        bl = b & 0xffff;
    const high = ( ah * bl + al * bh ) & 0xffff;
    return ( ( high << 16 ) >>> 0 ) + al * bl;
}

//uint32_t rand_state = (uint32_t)std::chrono::high_resolution_clock::now().time_since_epoch().count();
let randState = Date.now();

const rand = () => {
    randState = multiply_uint32( randState, 22695477 ) + 1;
    return ( randState >>> 16 ) & 0x7fff;
};

export const creepRandomTileIndices = range( 0, 256 * 256 ).map( () => {
    if ( rand() % 100 < 4 ) {
        return 6 + ( rand() % 7 );
    } else {
        return rand() % 6;
    }
} );

const creepEdgeNeighborsIndex = new Uint8Array( 0x100 );
const creepEdgeNeighborsIndexN = new Uint8Array( 128 );
export const creepEdgeFrameIndex = new Uint8Array( 0x100 );

for ( let i = 0; i != 0x100; i++ ) {
    let v = 0;
    if ( i & 2 ) v |= 0x10;
    if ( i & 8 ) v |= 0x24;
    if ( i & 0x10 ) v |= 9;
    if ( i & 0x40 ) v |= 2;
    if ( ( i & 0xc0 ) == 0xc0 ) v |= 1;
    if ( ( i & 0x60 ) == 0x60 ) v |= 4;
    if ( ( i & 3 ) == 3 ) v |= 0x20;
    if ( ( i & 6 ) == 6 ) v |= 8;
    if ( ( v & 0x21 ) == 0x21 ) v |= 0x40;
    if ( ( v & 0xc ) == 0xc ) v |= 0x40;
    creepEdgeNeighborsIndex[i] = v;
}

let n = 1;
for ( let i = 0; i !== 128; ++i ) {
    const neighbour = creepEdgeNeighborsIndex.find( ( neighbour ) => neighbour === i );

    if ( neighbour === undefined ) {
        continue;
    }
    if ( neighbour ) {
        creepEdgeNeighborsIndexN[i] = n;
        ++n;
    }
}

for ( let i = 0; i !== 0x100; ++i ) {
    creepEdgeFrameIndex[i] = creepEdgeNeighborsIndexN[creepEdgeNeighborsIndex[i]];
}

const xy = ( x: number, y: number ) => ( { x, y } );
export const dirs: { x: number; y: number }[] = [
    xy( 1, 1 ),
    xy( 0, 1 ),
    xy( -1, 1 ),
    xy( 1, 0 ),
    xy( -1, 0 ),
    xy( 1, -1 ),
    xy( 0, -1 ),
    xy( -1, -1 ),
    xy( 0, 0 ),
];
