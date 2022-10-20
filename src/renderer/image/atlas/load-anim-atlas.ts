import { AnimDds, UnitTileScale } from "common/types";

import { parseAnim, createDDSTexture } from "../formats";
import {
    BufferAttribute,
    ClampToEdgeWrapping,
    DataArrayTexture,
    FloatType,
    LinearEncoding,
    NearestFilter,
    RGBAFormat,
    TextureEncoding,
} from "three";
import { Janitor } from "three-janitor";
import { parseDDS } from "@image/formats/parse-dds";
import { calculateFrame } from "@utils/image-utils";
import { renderComposer } from "@render/render-composer";

const getBufDds = ( buf: Buffer, { ddsOffset, size }: AnimDds ) =>
    buf.slice( ddsOffset, ddsOffset + size );

export type AnimAtlas = ReturnType<typeof loadAnimAtlas>;

export const loadAnimAtlas = (
    buf: Buffer,
    imageIndex: number,
    scale: Exclude<UnitTileScale, "SD">
) => {
    const janitor = new Janitor( "loadAnimAtlas" );

    const [ sprite ] = parseAnim( buf );

    if ( !sprite.maps ) {
        throw new Error( "No sprite maps" );
    }

    const ddsBuf = getBufDds( buf, sprite.maps.diffuse );
    const diffuse = janitor.mop( createDDSTexture( parseDDS( ddsBuf ) ), "diffuse" );

    const optionalLoad = ( layer: AnimDds | undefined, encoding?: TextureEncoding ) => {
        if ( layer === undefined ) {
            return undefined;
        }
        const ddsBuf = getBufDds( buf, layer );
        return janitor.mop( createDDSTexture( parseDDS( ddsBuf ), encoding ), "layer" );
    };

    const teammask = optionalLoad( sprite.maps.teamcolor );

    // FIXME: handle SD properly
    const uvScale = UnitTileScale.HD / scale;

    // const brightness = await optionalLoad(sprite.maps.bright);
    // const normal = await optionalLoad(sprite.maps.normal);
    // const specular = await optionalLoad(sprite.maps.specular);
    // const aoDepth = await optionalLoad(sprite.maps.ao_depth);
    const emissive =
        scale === UnitTileScale.HD
            ? optionalLoad( sprite.maps.emissive, LinearEncoding )
            : undefined;

    const frames = sprite.frames.map( ( frame ) => ( {
        x: frame.x / uvScale,
        y: frame.y / uvScale,
        w: frame.w / uvScale,
        h: frame.h / uvScale,
        xoff: frame.xoff / uvScale,
        yoff: frame.yoff / uvScale,
    } ) );

    const uvPos = frames.map( ( frame ) => {
        const pos = new BufferAttribute(
            new Float32Array( [ -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0 ] ),
            3,
            false
        );
        const uv = new BufferAttribute(
            new Float32Array( [ 0, 0, 1, 0, 1, 1, 0, 1 ] ),
            2,
            false
        );
        const flippedPos = new BufferAttribute(
            new Float32Array( [ -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0 ] ),
            3,
            false
        );
        const flippedUv = new BufferAttribute(
            new Float32Array( [ 0, 0, 1, 0, 1, 1, 0, 1 ] ),
            2,
            false
        );
        calculateFrame(
            frame,
            false,
            sprite.maps.diffuse.width,
            sprite.maps.diffuse.height,
            sprite.w,
            sprite.h,
            pos,
            uv
        );

        calculateFrame(
            frame,
            true,
            sprite.maps.diffuse.width,
            sprite.maps.diffuse.height,
            sprite.w,
            sprite.h,
            flippedPos,
            flippedUv
        );

        pos.needsUpdate = true;
        uv.needsUpdate = true;
        flippedPos.needsUpdate = true;
        flippedUv.needsUpdate = true;

        return { pos, uv, flippedPos, flippedUv };
    } );

    //pos xy, uv xy (4 entries x flipped x 4 verticies = 16 entires per frame)
    const uvPosData = new Float32Array( frames.length * 4 * 8 );

    for ( let frame = 0; frame < uvPos.length; frame++ ) {
        const _uvPos = uvPos[frame];

        let phase = frame * 4;

        for ( let j = 0; j < 4; j++ ) {
            uvPosData[phase + 0] = _uvPos.pos.getX( j );
            uvPosData[phase + 1] = _uvPos.pos.getY( j );
            uvPosData[phase + 2] = _uvPos.uv.getX( j );
            uvPosData[phase + 3] = _uvPos.uv.getY( j );
            phase = phase + uvPos.length * 4;
        }

        for ( let j = 0; j < 4; j++ ) {
            uvPosData[phase + 0] = _uvPos.flippedPos.getX( j );
            uvPosData[phase + 1] = _uvPos.flippedPos.getY( j );
            uvPosData[phase + 2] = _uvPos.flippedUv.getX( j );
            uvPosData[phase + 3] = _uvPos.flippedUv.getY( j );
            phase = phase + uvPos.length * 4;
        }
    }

    const uvPosDataTex = new DataArrayTexture( uvPosData, uvPos.length, 1, 8 );
    uvPosDataTex.format = RGBAFormat;
    uvPosDataTex.type = FloatType;
    uvPosDataTex.magFilter = uvPosDataTex.minFilter = NearestFilter;
    uvPosDataTex.wrapS = uvPosDataTex.wrapT = ClampToEdgeWrapping;
    uvPosDataTex.needsUpdate = true;

    renderComposer.getWebGLRenderer().initTexture( uvPosDataTex );

    return {
        isHD: scale === UnitTileScale.HD,
        isHD2: scale === UnitTileScale.HD2,
        diffuse,
        imageIndex,
        frames,
        uvPos,
        uvPosDataTex,
        textureWidth: sprite.maps.diffuse.width,
        textureHeight: sprite.maps.diffuse.height,
        spriteWidth: sprite.w,
        spriteHeight: sprite.h,
        unitTileScale: scale,
        teammask,
        hdLayers: {
            emissive,
        },
        dispose() {
            janitor.dispose();
        },
    };
};
