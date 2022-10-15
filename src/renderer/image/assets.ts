import { promises as fsPromises } from "fs";
import path from "path";
import fileExists from "common/utils/file-exists";
import { AnimAtlas, BwDAT, Settings, UnitTileScale } from "common/types";
import electronFileLoader from "common/utils/electron-file-loader";

import { openCascStorage, readCascFile } from "common/casclib";

import { createDDSTexture, loadAnimAtlas, loadGlbAtlas, parseAnim } from ".";

import gameStore, { setAsset } from "@stores/game-store";
import { generateCursorIcons, generateUIIcons } from "./generate-icons/generate-icons";
import { log } from "@ipc/log";
import { loadEnvironmentMap } from "./environment/env-map";
import { imageTypes } from "common/enums";
import { CubeTexture, CubeTextureLoader, Texture } from "three";
import { settingsStore } from "@stores/settings-store";
import { modelSetFileRefIds } from "@core/model-effects-configuration";
import { renderComposer } from "@render/render-composer";
import { loadDatFilesRemote } from "@ipc/files";
import { parseDDS } from "./formats/parse-dds";
import { b2ba } from "@utils/bin-utils";

if ( module.hot ) {
    module.hot.accept( "@core/model-effects-configuration" );
}

const genFileName = ( i: number, prefix = "" ) =>
    `${prefix}anim/main_${`00${i}`.slice( -3 )}.anim`;
const loadAnimBuffer = ( refImageId: number, res: UnitTileScale ) =>
    readCascFile( genFileName( refImageId, res === UnitTileScale.HD2 ? "HD2/" : "" ) );

const setHDMipMaps = ( hd: AnimAtlas, hd2: AnimAtlas ) => {
    hd.diffuse.mipmaps.push( hd2.diffuse.mipmaps[0] );

    if ( hd2.teammask ) {
        hd.teammask?.mipmaps.push( hd2.teammask.mipmaps[0] );
    }
};

export type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
} & Partial<Awaited<ReturnType<typeof generateUIIcons>>>;

export type UIStateAssets = Pick<
    Assets,
    | "bwDat"
    | "gameIcons"
    | "cmdIcons"
    | "raceInsetIcons"
    | "workerIcons"
    | "wireframeIcons"
>;

const _hardfiles = [".glb", ".hdr", ".png", ".exr", ".js", ".wasm"];

export const initializeAssets = async ( directories: Settings["directories"] ) => {
    electronFileLoader( ( file: string, directory: string ) => {
        log.debug( file );

        if ( file.startsWith( "blob:" ) ) {
            return fetch( file ).then( ( r ) => r.arrayBuffer() );
        }
        if ( _hardfiles.some( ( ext ) => file.endsWith( ext ) ) ) {
            const fullPath = path.join( directory ?? "", file );
            return file.endsWith( ".js" )
                ? fsPromises.readFile( fullPath, { encoding: "utf-8" } )
                : fsPromises.readFile( fullPath ).then( ( buffer ) => buffer.buffer );
        } else {
            return readCascFile( file );
        }
    } );

    await openCascStorage( directories.starcraft );

    log.debug( "@load-assets/images" );
    const sdAnimBuf = await readCascFile( "SD/mainSD.anim" );
    const sdAnim = parseAnim( sdAnimBuf );

    log.debug( "@load-assets/selection-circles" );
    const selectionCircles: AnimAtlas[] = [];
    for ( let i = 561; i < 571; i++ ) {
        const selCircleGRP = await loadAnimAtlas(
            await readCascFile( `anim/main_${i}.anim` ),
            i,
            UnitTileScale.HD
        );

        selectionCircles.push( selCircleGRP );
        renderComposer.getWebGLRenderer().initTexture( selCircleGRP.diffuse );
    }

    const minimapConsole = {
        clock: createDDSTexture(
            parseDDS(
                b2ba( await readCascFile( "game/observer/UIObserverSquareRight.DDS" ) )
            )
        ),
        square: createDDSTexture(
            parseDDS( b2ba( await readCascFile( "game/observer/UIObserverSquareFull.DDS" ) ) )
        ),
    };

    const envEXRAssetFilename = path.join( directories.assets, "envmap.exr" );
    const envMapFilename = ( await fileExists( envEXRAssetFilename ) )
        ? envEXRAssetFilename
        : path.join( __static, "./envmap.hdr" );
    log.debug( `@load-assets/envmap: ${envMapFilename}` );
    loadEnvironmentMap( envMapFilename ).then( ( tex ) => {
        setAsset( "envMap", tex );
        renderComposer.getWebGLRenderer().initTexture( tex );
    } );

    generateUIIcons( readCascFile ).then( ( icons ) => {
        setAsset( "gameIcons", icons.gameIcons );
        setAsset( "cmdIcons", icons.cmdIcons );
        setAsset( "raceInsetIcons", icons.raceInsetIcons );
        setAsset( "workerIcons", icons.workerIcons );
    } );

    const cursorIcons = await generateCursorIcons( readCascFile );

    const refId = ( id: number ) => {
        if ( sdAnim[id]?.refId !== undefined ) {
            return sdAnim[id].refId!;
        }
        return id;
    };

    const loadingHD2 = new Set();
    const loadingHD = new Set();
    const glbExists = new Map<number, boolean>();
    const atlases: AnimAtlas[] = [];
    const glbFileName = ( imageId: number ) =>
        path.join( directories.assets, `00${imageId}`.slice( -3 ) + ".glb" );

    /**
     * Loads an image atlas for HD2, HD and GLTF.
     * It will load HD2/GLB at once then load HD once HD2.
     * If HD2 is ignored than only HD and GLB will be loaded.
     * if HD2 is forced than HD2 will be loaded and HD will be ignored.
     * refImageId means we use the same images and iscript with another image id.
     * glbRefImageId means we use the same glb/frame count with another image id.
     */
    const loadImageAtlas = async ( imageId: number, bwDat: BwDAT ) => {
        const refImageId = refId( imageId );
        const glbRefImageId = modelSetFileRefIds.get( refImageId ) ?? refImageId;
        const settings = settingsStore().data.graphics.useHD2;

        let res = UnitTileScale.HD2;
        if ( loadingHD.has( refImageId ) ) {
            return;
        } else if ( atlases[refImageId]?.isHD2 || settings !== "auto" ) {
            if ( loadingHD.has( refImageId ) ) {
                return;
            }
            res = settings === "force" ? UnitTileScale.HD2 : UnitTileScale.HD;
            loadingHD.add( refImageId );
            loadingHD.add( imageId );
            if ( settings !== "auto" ) {
                glbExists.set( refImageId, await fileExists( glbFileName( glbRefImageId ) ) );
            }
        } else if ( loadingHD2.has( refImageId ) ) {
            return;
        } else if ( !loadingHD2.has( refImageId ) ) {
            loadingHD2.add( refImageId );
            loadingHD2.add( imageId );
            glbExists.set( refImageId, await fileExists( glbFileName( glbRefImageId ) ) );
        }

        const anim = await loadAnimAtlas(
            await loadAnimBuffer( refImageId, res ),
            imageId,
            res
        );

        renderComposer.getWebGLRenderer().initTexture( anim.diffuse );

        if ( atlases[imageId]?.isHD2 && anim.isHD ) {
            setHDMipMaps( anim, atlases[imageId] );
        }

        if ( anim.isHD2 && atlases[imageId]?.isHD ) {
            log.warn( "hd2 after hd" );
        }

        // assigning to a new object since ImageHD needs to test against its existing atlas
        atlases[imageId] = Object.assign( {}, atlases[imageId], anim, {
            isHD: settings === "force" ? true : anim.isHD,
        } );
        atlases[refImageId] = Object.assign( {}, atlases[refImageId], anim, {
            isHD: settings === "force" ? true : anim.isHD,
        } );

        if ( glbExists.get( refImageId ) ) {
            glbExists.set( refImageId, false );

            const glb = await loadGlbAtlas(
                glbFileName( glbRefImageId ),
                // use grp frames for convenience since we might fake being another image for re-use
                // and we'll need access to those original frames in order to manipulate things
                bwDat.grps[glbRefImageId].frames,
                bwDat.images[imageId],
                null
            );

            atlases[imageId] = Object.assign( {}, atlases[imageId], glb );
            atlases[refImageId] = Object.assign( {}, atlases[refImageId], glb );

            if ( glb?.mesh?.material.map ) {
                renderComposer.getWebGLRenderer().initTexture( glb.mesh.material.map );
            }
        }
    };

    log.debug( "@load-assets/skybox" );
    const loader = new CubeTextureLoader();
    const rootPath = path.join( __static, "/skybox/sparse" );
    log.debug( rootPath );

    loader.setPath( rootPath );

    const skyBox = await new Promise( ( res ) =>
        loader.load(
            ["right.png", "left.png", "top.png", "bot.png", "front.png", "back.png"],
            res
        )
    );

    loadDatFilesRemote().then( ( dat ) => {
        setAsset( "bwDat", dat );
        // preload some assets that will not be loaded otherwise?
        loadImageAtlas( imageTypes.warpInFlash, dat );
    } );

    const r = {
        remaining: 7,
        atlases,
        ...cursorIcons,
        selectionCircles,
        minimapConsole,
        loadImageAtlas( imageId: number, bwDat: BwDAT ) {
            loadImageAtlas( imageId, bwDat );
            return this.getImageAtlas( imageId );
        },
        getImageAtlas( imageId: number ) {
            return atlases[refId( imageId )] as AnimAtlas | undefined;
        },
        loadImageAtlasAsync( imageId: number, bwDat: BwDAT ) {
            return loadImageAtlas( imageId, bwDat );
        },
        skyBox,
        refId,
        resetAssetCache: () => {
            atlases.length = 0;
            loadingHD.clear();
            loadingHD2.clear();
            glbExists.clear();
        },
    };

    gameStore().setAssets( r as Assets );

    return r;
};

export const loadImageAtlasDirect = async ( imageId: number, image3d: boolean ) => {
    const assets = gameStore().assets!;
    const settings = settingsStore().data;

    const refImageId = assets.refId( imageId );

    const glbFileName = path.join(
        settings.directories.assets,
        `00${refImageId}`.slice( -3 ) + ".glb"
    );
    const glbFileExists = image3d ? await fileExists( glbFileName ) : false;

    const imageDat = assets.bwDat.images[imageId];

    if ( glbFileExists ) {
        log.debug( `loading glb  ${glbFileName}` );

        const anim = await loadAnimAtlas(
            await loadAnimBuffer( refImageId, UnitTileScale.HD ),
            imageId,
            UnitTileScale.HD
        );

        return {
            ...anim,
            ...( await loadGlbAtlas( glbFileName, anim.frames, imageDat, assets.envMap! ) ),
        };
    } else {
        return await loadAnimAtlas(
            await loadAnimBuffer( refImageId, UnitTileScale.HD ),
            imageId,
            UnitTileScale.HD
        );
    }
};
