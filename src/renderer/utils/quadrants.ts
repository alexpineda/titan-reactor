import { MathUtils } from "three";
const mod = ( x: number ) => MathUtils.euclideanModulo( x, Math.PI * 2 );

interface Slice {
    i: number;
    rad: [number, number];
}

export const quadrants = ( n: number, phase = 0 ) => {
    const slices: Slice[] = [];
    const m = ( 2 * Math.PI ) / n;
    for ( let i = 0; i < n; i++ ) {
        slices.push( {
            i,
            rad: [m * i, m * ( i + 1 )],
        } );
    }

    let _entered: Slice | null = null;

    return {
        phase,
        slices,
        getSlice( i: number, useRad = false ) {
            let a = i;
            if ( useRad ) {
                a = Math.floor( mod( i - this.phase ) / m );
            }
            return slices[a];
        },
        entered( i: number, azimuth: number, useRadT = false, useRadI = true ) {
            const a = this.getSlice( i, useRadT );
            const b = this.getSlice( azimuth, useRadI );
            if ( a === b ) {
                if ( a === _entered ) {
                    return false;
                }
                _entered = a;
                return true;
            } else {
                _entered = null;
                return false;
            }
        },
        distanceTo( i: number, a: number, midway = false ) {
            const b = this.getSlice( i );
            if ( midway ) {
                return Math.abs( a - phase - ( b.rad[0] + ( b.rad[1] - b.rad[0] ) / 2 ) );
            } else {
                return Math.abs( a - phase - b.rad[0] );
            }
        },
        isBetween( t: number, t2: number, azimuth: number ) {
            const a0 = this.getSlice( t );
            const a1 = this.getSlice( t2 );
            const b = this.getSlice( azimuth, true );
            return b.i >= a0.i && b.i <= a1.i;
        },
        between( t: number, t2: number, azimuth: number ) {
            const a0 = this.getSlice( t );
            const a1 = this.getSlice( t2 );
            return MathUtils.smoothstep( azimuth, a0.rad[0], a1.rad[1] );
        },
    };
};
