import { Janitor } from "three-janitor";
import * as THREE from "three";
import { blendNonZeroPixels } from "../rgb";
import { LookupBitmaps } from "./lookup-bitmaps";
import { parseDdsGrpAsTextures } from "..";
import { parseTMSK } from "@image/formats/parse-tmsk";
import { TilesetData } from "./get-tileset-buffers";
import path from "path";
import { TextureLoader } from "three";

const _defaultOpts = {
    encoding: THREE.LinearEncoding as THREE.TextureEncoding,
    format: THREE.RGBAFormat as THREE.PixelFormat | undefined,
    textureDataType: THREE.UnsignedByteType as THREE.TextureDataType | undefined,
    flipY: true as boolean,
};
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

const createNonZeroElevationsData = (
    layers: Uint8Array,
    width: number,
    height: number,
    blendNonWalkableBase: boolean
) => {
    const nonZeroLayers = layers.slice( 0 );
    for ( let x = 0; x < width; x++ ) {
        for ( let y = 0; y < height; y++ ) {
            const pos = y * width + x;
            if ( [ 0, 2, 4 ].includes( nonZeroLayers[pos] ) ) {
                nonZeroLayers[pos] = 0;
            }
        }
    }

    if ( blendNonWalkableBase ) {
        blendNonZeroPixels( nonZeroLayers, width, height );
    }
    return nonZeroLayers;
};

const createDataTexture = (
    data: ArrayBuffer,
    width: number,
    height: number,
    userOpts?: Overwrite<
        Partial<typeof _defaultOpts>,
        { internalFormat?: THREE.PixelFormatGPU | null }
    >
) => {
    const opts = Object.assign( {}, _defaultOpts, userOpts );

    const tex = new THREE.DataTexture(
        data,
        width,
        height,
        opts.format,
        opts.textureDataType
    );
    tex.flipY = opts.flipY;
    tex.needsUpdate = true;
    tex.encoding = opts.encoding;
    if ( opts.internalFormat ) {
        tex.internalFormat = opts.internalFormat;
    }
    return tex;
};

export type LookupTextures = Awaited<ReturnType<typeof createLookupTextures>>;

export const createLookupTextures = async (
    td: TilesetData,
    {
        blendNonWalkableBase,
        mapWidth,
        mapHeight,
        lookupBitmaps,
    }: {
        blendNonWalkableBase: boolean;
        mapWidth: number;
        mapHeight: number;
        lookupBitmaps: LookupBitmaps;
    }
) => {
    const w32 = mapWidth * 32;
    const h32 = mapHeight * 32;

    // minitile resolution
    const w4 = mapWidth * 4;
    const h4 = mapHeight * 4;

    const janitor = new Janitor( "MapDataTextures" );

    const mapDiffuseTex = createDataTexture( lookupBitmaps.diffuse, w32, h32, {
        encoding: THREE.sRGBEncoding,
    } );

    const occlussionRoughnessMetallicTex = createDataTexture(
        lookupBitmaps.occlussionRoughnessMetallic,
        w32,
        h32,
        { format: THREE.RGBAFormat }
    );

    const tilesTex = createDataTexture(
        lookupBitmaps.mapTilesData,
        mapWidth,
        mapHeight,
        {
            format: THREE.RedIntegerFormat,
            textureDataType: THREE.UnsignedShortType,
            internalFormat: "R16UI",
        }
    );

    const creepEdgesTex = createDataTexture(
        new Uint8Array( mapWidth * mapHeight ),
        mapWidth,
        mapHeight,
        { format: THREE.RedFormat }
    );

    const creepValues = createDataTexture(
        new Uint8Array( mapWidth * mapHeight ),
        mapWidth,
        mapHeight,
        { format: THREE.RedFormat }
    );

    const elevationsTex = createDataTexture( lookupBitmaps.layers, w4, h4, {
        format: THREE.RedIntegerFormat,
        internalFormat: "R8UI",
    } );

    const nonZeroElevationsTex = createDataTexture(
        createNonZeroElevationsData( lookupBitmaps.layers, w4, h4, blendNonWalkableBase ),
        w4,
        h4,
        { format: THREE.RedIntegerFormat, internalFormat: "R8UI" }
    );

    const paletteIndicesTex = createDataTexture(
        lookupBitmaps.paletteIndices,
        w32,
        h32,
        { format: THREE.RedIntegerFormat, internalFormat: "R8UI" }
    );

    const paletteTex = createDataTexture(
        new Float32Array( td.palette.length ).fill( 0 ).map( ( _, i ) => td.palette[i] / 255 ),
        td.palette.length / 4,
        1,
        { textureDataType: THREE.FloatType, flipY: false, encoding: THREE.sRGBEncoding }
    );

    const effectsTextures = {
        waterNormal1: parseDdsGrpAsTextures( td.waterNormal1 ),
        waterNormal2: parseDdsGrpAsTextures( td.waterNormal2 ),
        //TODO: fix this
        noise: await new TextureLoader().loadAsync( path.join( __static, "./noise.png" ) ),
        waterMask: td.waterMask ? parseDdsGrpAsTextures( td.waterMask ) : null,
        tileMask: td.tileMask ? parseTMSK( td.tileMask ) : null,
    };

    return {
        mapDiffuseTex: mapDiffuseTex,
        occlussionRoughnessMetallicTex: occlussionRoughnessMetallicTex,
        tilesTex: tilesTex,
        creepTexUniform: { value: creepValues },
        creepEdgesTexUniform: { value: creepEdgesTex },
        elevationsTex,
        nonZeroElevationsTex,
        paletteIndicesTex,
        paletteTex,
        effectsTextures,
        dispose: () => {
            janitor.dispose(
                mapDiffuseTex,
                occlussionRoughnessMetallicTex,
                tilesTex,
                creepEdgesTex,
                creepValues,
                elevationsTex,
                nonZeroElevationsTex,
                paletteIndicesTex,
                paletteTex
            );
            janitor.dispose( effectsTextures.waterNormal1, effectsTextures.waterNormal2 );
            effectsTextures.waterMask && janitor.dispose( effectsTextures.waterMask );
            janitor.dispose( effectsTextures.noise );
        },
    };
};
export default createLookupTextures;
