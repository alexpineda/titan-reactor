import { MathUtils, Vector2, Vector3 } from "three";

export interface PxToWorld {
    x: ( v: number ) => number;
    y: ( v: number ) => number;
    xy: ( x: number, y: number, out: Vector2 ) => Vector2;
    xyz: ( x: number, y: number, out: Vector3 ) => Vector3;
}

const transform = ( a: number, b: number ) => a / 32 - b / 2;
const invTransform = ( a: number, b: number ) => Math.floor( ( a + b / 2 ) * 32 );

export const floor32 = ( x: number ) => Math.floor( x / 32 );

export const makePxToWorld = (
    mapWidth: number,
    mapHeight: number,
    yFunction: ( x: number, y: number ) => number = () => 0,
    inverted = false
): PxToWorld => {
    const _transform = inverted ? invTransform : transform;

    return {
        x: ( x: number ) => _transform( x, mapWidth ),
        y: ( y: number ) => _transform( y, mapHeight ),
        xy: ( x: number, y: number, out?: Vector2 ) => {
            return ( out ?? new Vector2() ).set(
                _transform( x, mapWidth ),
                _transform( y, mapHeight )
            );
        },
        xyz: ( x: number, y: number, out?: Vector3 ) => {
            if ( inverted ) {
                throw new Error( "inverted can only go from world to px" );
            }

            const nx = _transform( x, mapWidth );
            const ny = _transform( y, mapHeight );
            return ( out ?? new Vector3() ).set( nx, yFunction( nx, ny ), ny );
        },
    };
};

export enum gameSpeeds {
    superSlow = 334,
    slowest = 167,
    slower = 111,
    slow = 83,
    normal = 67,
    fast = 56,
    faster = 48,
    fastest = 42,
    "1.5x" = 31,
    "2x" = 21,
    "4x" = 10,
    "8x" = 5,
    "16x" = 2,
}

export const framesBySeconds = ( frames = 1, roundFn = Math.ceil ) =>
    roundFn( ( frames * 1000 ) / gameSpeeds.fastest );

export const onFastestTick = ( frame: number, seconds = 1 ) =>
    frame % ( 24 * seconds ) === 0;

export const angleToDirection = ( angle: number ) =>
    Math.floor( ( ( ( angle + ( Math.PI * 1 ) / 2 ) % ( Math.PI * 2 ) ) / ( Math.PI * 2 ) ) * 32 );

export const getSecond = ( frame: number ) => {
    return Math.floor( ( frame * gameSpeeds.fastest ) / 1000 );
};

export const clipSpaceToMapSpace = (
    _in: { x: number; y: number },
    out: { x: number; y: number },
    mapWidth: number,
    mapHeight: number
) => {
    out.x = MathUtils.clamp( _in.x, -1, 1 ) * mapWidth * 0.5;

    out.y = MathUtils.clamp( _in.y, -1, 1 ) * mapHeight * 0.5;
};
