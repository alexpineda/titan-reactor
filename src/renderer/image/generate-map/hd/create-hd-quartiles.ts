import {
    MeshBasicMaterial,
    OrthographicCamera,
    Scene,
    Vector3,
    PlaneGeometry,
    Mesh,
    WebGLRenderer,
    Texture,
    WebGLRenderTarget,
    NearestFilter,
    DoubleSide,
    CompressedTexture,
    SRGBColorSpace,
} from "three";
import { parseDdsGrp } from "../../formats/parse-dds-grp";
import { WrappedQuartileTextures, UnitTileScale } from "common/types";
import { Janitor, JanitorLogLevel } from "three-janitor";
import { getJanitorLogLevel } from "@core/global";
import { LookupTextures } from "../lookup-textures";
import { createDDSTexture, parseDDS } from "@image/formats";
import processStore from "@stores/process-store";

// generates map textures
// splits up textures into quadrants if a single texture would be
// over max supported size
export const createHdQuartiles = (
    mapWidth: number,
    mapHeight: number,
    imageData: Buffer,
    mapTilesData: Uint16Array,
    res: UnitTileScale,
    { waterMask, tileMask }: LookupTextures["effectsTextures"],
    renderer: WebGLRenderer
): WrappedQuartileTextures => {
    renderer.clear();

    const PX_PER_TILE_HD = res === UnitTileScale.HD ? 128 : 64;

    const mapQuartiles: Texture[][] = [];
    const waterMaskQuartiles: Texture[][] = [];

    const hdTiles = parseDdsGrp( imageData );
    const webGlMaxTextureSize = renderer.capabilities.maxTextureSize;
    //16384, 8192, 4096

    // tile units
    const maxQuartileSize = Math.min( 32, webGlMaxTextureSize / PX_PER_TILE_HD );
    // 64; //64, 64, 32    0.5->1, 1, 2
    // 96; //96, 48, 32    0.75->1, 1.5->2, 3
    // 128; //128, 64, 32   1, 2, 4
    // 192; //96, 64, 32    1.5->2, 3, 6
    // 256; //128,64,32     2, 4, 8

    const quartileStrideW = Math.ceil( mapWidth / maxQuartileSize );
    const quartileWidth = mapWidth / quartileStrideW;

    const quartileStrideH = Math.ceil( mapHeight / maxQuartileSize );
    const quartileHeight = mapHeight / quartileStrideH;

    const far = Math.max( quartileWidth, quartileHeight );

    const ortho = new OrthographicCamera(
        -quartileWidth / 2,
        quartileWidth / 2,
        -quartileHeight / 2,
        quartileHeight / 2,
        0,
        far * 2
    );
    ortho.position.y = far;
    ortho.lookAt( new Vector3() );

    const hdCache = new Map<number, CompressedTexture>();
    const renderWidth = quartileWidth * PX_PER_TILE_HD;
    const renderHeight = quartileHeight * PX_PER_TILE_HD;

    renderer.setSize( renderWidth, renderHeight );
    const renderTargets: WebGLRenderTarget[] = [];

    const process = processStore().create( "quartiles", quartileWidth * quartileStrideH );

    for ( let qx = 0; qx < quartileStrideW; qx++ ) {
        mapQuartiles[qx] = [];
        waterMaskQuartiles[qx] = [];

        for ( let qy = 0; qy < quartileStrideH; qy++ ) {
            const quartileScene = new Scene();
            quartileScene.name = "quartile-ortho-scene";

            const waterMaskScene = new Scene();
            quartileScene.name = "water-ortho-scene";

            const rt = new WebGLRenderTarget( renderWidth, renderHeight, {
                anisotropy: renderer.capabilities.getMaxAnisotropy(),
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                depthBuffer: false,
                generateMipmaps: true,
            } );
            rt.texture.colorSpace = SRGBColorSpace;

            renderTargets.push( rt );
            renderer.setRenderTarget( rt );
            quartileScene.scale.set( 1, 1, -1 );
            waterMaskScene.scale.set( 1, 1, -1 );

            const waterRT = new WebGLRenderTarget( renderWidth, renderHeight, {
                anisotropy: renderer.capabilities.getMaxAnisotropy(),
                minFilter: NearestFilter,
                magFilter: NearestFilter,
                depthBuffer: false,
                generateMipmaps: true,
            } );

            const mat = new MeshBasicMaterial( {
                side: DoubleSide,
            } );
            const plane = new PlaneGeometry();
            const mesh = new Mesh( plane, mat );

            for ( let x = 0; x < quartileWidth; x++ ) {
                for ( let y = 0; y < quartileHeight; y++ ) {
                    const my = y + qy * quartileHeight;
                    const mx = x + qx * quartileWidth;
                    const tile = mapTilesData[my * mapWidth + mx];
                    if ( hdTiles[tile] ) {
                        const texture =
                            hdCache.get( tile ) ??
                            createDDSTexture( parseDDS( hdTiles[tile] ) );
                        if ( !hdCache.has( tile ) ) {
                            hdCache.set( tile, texture );
                        }
                        texture.colorSpace = SRGBColorSpace;

                        mat.map = texture;
                        mesh.name = "hd-tile";
                        quartileScene.add( mesh );
                        mesh.position.x = x - quartileWidth / 2 + 0.5;
                        mesh.position.z = y - quartileHeight / 2 + 0.5;
                        mesh.rotation.x = Math.PI / 2;

                        if ( waterMask ) {
                            renderer.setRenderTarget( rt );
                        }
                        renderer.render( quartileScene, ortho );

                        if ( waterMask && tileMask ) {
                            renderer.setRenderTarget( waterRT );

                            const waterIdx = tileMask.get( tile );

                            if ( waterIdx !== undefined ) {
                                waterMaskScene.add( mesh );
                                mat.map = waterMask[waterIdx];
                                renderer.render( waterMaskScene, ortho );
                            }
                        }
                    } else {
                        console.error( "no tile", tile );
                    }
                }

                process.increment();
            }

            mapQuartiles[qx][qy] = rt.texture;
            mapQuartiles[qx][qy].colorSpace = SRGBColorSpace;

            waterMaskQuartiles[qx][qy] = waterRT.texture;

            Janitor.logLevel = JanitorLogLevel.None;
            Janitor.trash( "quartileScene", quartileScene );
            Janitor.trash( "waterMaskScene", waterMaskScene );
            Janitor.logLevel = getJanitorLogLevel();
        }
    }

    renderer.setRenderTarget( null );
    hdCache.forEach( ( t ) => t.dispose() );

    return {
        mapQuartiles,
        waterMaskQuartiles,
        quartileHeight,
        quartileWidth,
        dispose() {
            mapQuartiles.flat().forEach( ( t ) => t.dispose() );
            waterMaskQuartiles.flat().forEach( ( t ) => t.dispose() );
            renderTargets.forEach( ( rt ) => rt.dispose() );
        },
    };
};
