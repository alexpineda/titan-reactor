import range from "common/utils/range";
import {
    BufferAttribute,
    BufferGeometry,
    Float32BufferAttribute,
    InterleavedBufferAttribute,
    Vector2,
    Vector3,
} from "three";

class Face {
    points = [new Vector3(), new Vector3(), new Vector3()];
    uvs = [new Vector2(), new Vector2(), new Vector2()];

    set(
        pos: BufferAttribute | InterleavedBufferAttribute,
        i0: number,
        i1: number,
        i2: number
    ) {
        this.points[0].set( pos.getX( i0 ), pos.getY( i0 ), pos.getZ( i0 ) );
        this.points[1].set( pos.getX( i1 ), pos.getY( i1 ), pos.getZ( i1 ) );
        this.points[2].set( pos.getX( i2 ), pos.getY( i2 ), pos.getZ( i2 ) );
    }

    setUV(
        uvs: BufferAttribute | InterleavedBufferAttribute,
        i0: number,
        i1: number,
        i2: number
    ) {
        this.uvs[0].set( uvs.getX( i0 ), uvs.getY( i0 ) );
        this.uvs[1].set( uvs.getX( i1 ), uvs.getY( i1 ) );
        this.uvs[2].set( uvs.getX( i2 ), uvs.getY( i2 ) );
    }

    get centerX() {
        return ( this.points[0].x + this.points[1].x + this.points[2].x ) / 3;
    }

    get centerY() {
        return ( this.points[0].y + this.points[1].y + this.points[2].y ) / 3;
    }

    get centerZ() {
        return ( this.points[0].z + this.points[1].z + this.points[2].z ) / 3;
    }

    get equalZ() {
        return (
            this.points[0].z === this.points[1].z &&
            this.points[1].z === this.points[2].z
        );
    }
}

class Tile {
    static #id = 0;
    id = 0;
    face1?: Face = undefined;
    face2?: Face = undefined;
    merged = false;
    x = 0;
    y = 0;

    constructor() {
        this.id = Tile.#id++;
    }

    get equalZ() {
        return (
            this.face1!.equalZ &&
            this.face2!.equalZ &&
            this.face1!.centerZ === this.face2!.centerZ
        );
    }

    get centerX() {
        return ( this.face1!.centerX + this.face2!.centerX ) / 2;
    }

    get centerY() {
        return ( this.face1!.centerY + this.face2!.centerY ) / 2;
    }

    get centerZ() {
        return ( this.face1!.centerZ + this.face2!.centerZ ) / 2;
    }

    get vertices() {
        return [
            ...this.face1!.points[0].toArray(),
            ...this.face1!.points[1].toArray(),
            ...this.face1!.points[2].toArray(),
            ...this.face2!.points[0].toArray(),
            ...this.face2!.points[1].toArray(),
            ...this.face2!.points[2].toArray(),
        ];
    }

    get uvs() {
        return [
            ...this.face1!.uvs[0].toArray(),
            ...this.face1!.uvs[1].toArray(),
            ...this.face1!.uvs[2].toArray(),
            ...this.face2!.uvs[0].toArray(),
            ...this.face2!.uvs[1].toArray(),
            ...this.face2!.uvs[2].toArray(),
        ];
    }
}

/**
 * Groups faces from an indexed geometry into tiles.
 */
const groupTileFaces = ( geom: BufferGeometry, w: number, h: number ) => {
    const index = geom.getIndex();
    if ( !index ) {
        throw new Error( "Indexed geometry is required." );
    }
    const pos = geom.getAttribute( "position" );
    const uvs = geom.getAttribute( "uv" );
    const tiles = range( 0, w ).map( ( _ ) => range( 0, h ).map( ( _ ) => new Tile() ) );

    let x = 0;
    let y = 0;

    for ( let i = 0; i < index.count; i += 3 ) {
        const face = new Face();
        face.set( pos, index.array[i], index.array[i + 1], index.array[i + 2] );
        face.setUV( uvs, index.array[i], index.array[i + 1], index.array[i + 2] );

        if ( tiles[x] === undefined || tiles[x][y] === undefined ) {
            throw new Error( "Invalid tile coordinates." );
        }
        if ( tiles[x][y].face1 === undefined ) {
            tiles[x][y].face1 = face;
        } else {
            tiles[x][y].face2 = face;
            tiles[x][y].x = x;
            tiles[x][y].y = y;
            x++;
            if ( x >= w ) {
                x = 0;
                y++;
            }
        }
    }

    return tiles;
};

// merge tiles that share equal z values using some simple strategies
const computeMergeTiles = ( tiles: Tile[][] ) => {
    let width = 0;
    let height = 0;

    for ( let x = 0; x < tiles.length; x++ ) {
        for ( let y = 0; y < tiles[x].length; y++ ) {
            const tile = tiles[x][y];
            // for simplicity, only deal with completely flat tiles
            if ( !tile.equalZ || tile.merged ) continue;

            // left to right, getting greedy with width
            let i = 1;
            while (
                tiles[x + i] &&
                tiles[x + i][y] !== undefined &&
                tiles[x + i][y].equalZ &&
                tiles[x + i][y].centerZ === tile.centerZ &&
                !tiles[x + i][y].merged
            ) {
                i++;
            }

            width = i;
            height = Infinity;

            i = 0;
            while ( i < width ) {
                let j = 1;
                while (
                    tiles[x + i] &&
                    tiles[x + i][y + j] !== undefined &&
                    tiles[x + i][y + j].equalZ &&
                    tiles[x + i][y + j].centerZ === tile.centerZ &&
                    !tiles[x + i][y + j].merged
                ) {
                    j++;
                }
                height = Math.min( height, j );
                i++;
            }

            if ( height === Infinity ) {
                height = 1;
            }

            const mergeTile = new Tile();
            mergeTile.merged = true;
            mergeTile.face1 = new Face();
            mergeTile.face2 = new Face();

            for ( let k = 0; k < width; k++ ) {
                for ( let l = 0; l < height; l++ ) {
                    const activeTile = tiles[x + k][y + l];

                    // compute merge tile faces while we have easy access to that information
                    if ( k == 0 && l == 0 ) {
                        // tl
                        mergeTile.face1.points[0].copy( activeTile.face1!.points[0] );
                        mergeTile.face1.uvs[0].copy( activeTile.face1!.uvs[0] );
                    }
                    if ( k == 0 && l == height - 1 ) {
                        // bl
                        mergeTile.face1.points[1].copy( activeTile.face1!.points[1] );
                        mergeTile.face1.uvs[1].copy( activeTile.face1!.uvs[1] );

                        mergeTile.face2.points[0].copy( activeTile.face1!.points[1] );
                        mergeTile.face2.uvs[0].copy( activeTile.face1!.uvs[1] );
                    }
                    if ( k == width - 1 && l == 0 ) {
                        // tr
                        mergeTile.face1.points[2].copy( activeTile.face1!.points[2] );
                        mergeTile.face1.uvs[2].copy( activeTile.face1!.uvs[2] );

                        mergeTile.face2.points[2].copy( activeTile.face1!.points[2] );
                        mergeTile.face2.uvs[2].copy( activeTile.face1!.uvs[2] );
                    }
                    if ( k == width - 1 && l == height - 1 ) {
                        // br
                        mergeTile.face2.points[1].copy( activeTile.face2!.points[1] );
                        mergeTile.face2.uvs[1].copy( activeTile.face2!.uvs[1] );
                    }

                    tiles[x + k][y + l] = mergeTile;
                }
            }
        }
    }
};

/**
 * Generate a new non-indexed geometry from a list of merged and non-merged tiles
 */
const generateGeometryFromTiles = ( tiles: Tile[][] ) => {
    const geom = new BufferGeometry();

    const processed = new Set();
    const vertices = [];
    const normals = [];
    const uvs = [];

    const _normals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];

    for ( let y = 0; y < tiles[0].length; y++ ) {
        for ( let x = 0; x < tiles.length; x++ ) {
            const tile = tiles[x][y];
            if ( processed.has( tile ) ) {
                continue;
            }
            processed.add( tile );

            vertices.push( ...tile.vertices );
            normals.push( ..._normals );
            uvs.push( ...tile.uvs );
        }
    }

    geom.setAttribute( "position", new Float32BufferAttribute( vertices, 3 ) );
    geom.setAttribute( "normal", new Float32BufferAttribute( normals, 3 ) );
    geom.setAttribute( "uv", new Float32BufferAttribute( uvs, 2 ) );

    return geom;
};

export default ( input: BufferGeometry, wSegments: number, hSegments: number ) => {
    const tiles = groupTileFaces( input, wSegments, hSegments );
    computeMergeTiles( tiles );
    return generateGeometryFromTiles( tiles );
};
