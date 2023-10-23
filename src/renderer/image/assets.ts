import { BwDAT, UnitTileScale } from "common/types";

import {
    readCascFileRemote as readCascFile,
    closeCascStorageRemote as closeCascStorage,
    openCascStorageRemote as openCascStorage,
    readCascFileRemote,
} from "@ipc/casclib";

import {
    AnimAtlas,
    createDDSTexture,
    loadAnimAtlas,
    // loadGlbAtlas,
    parseAnim,
    RefAnim,
} from ".";

import gameStore, { setAsset } from "@stores/game-store";
import { generateCursorIcons, generateUIIcons } from "./generate-icons/generate-icons";
import { log } from "@ipc/log";
import { imageTypes } from "common/enums";
import { settingsStore } from "@stores/settings-store";
// import { modelSetFileRefIds } from "@core/model-effects-configuration";
import { parseDDS } from "./formats/parse-dds";
import { b2ba } from "@utils/bin-utils";
import processStore from "@stores/process-store";
import { TimeSliceJob } from "@utils/time-slice-job";
import { CubeTexture, CubeTextureLoader, Texture } from "three";
import { loadEnvironmentMap } from "./environment/env-map";
import { loadDATFiles } from "common/bwdat/load-dat-files";

// if ( import.meta.hot ) {
//     import.meta.hot.accept( "@core/model-effects-configuration" );
// }

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

/**
 * @public
 * Most game assets excepting sprites / images.
 */
export type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
} & Partial<Awaited<ReturnType<typeof generateUIIcons>>>;

export const initializeAssets = async () => {
    const bwDat = await loadDATFiles( readCascFileRemote );
    setAsset( "bwDat", bwDat );

    log.debug( "@load-assets/images" );
    const sdAnimBuf = await readCascFile( "SD/mainSD.anim" );
    const sdAnim = parseAnim( sdAnimBuf );

    processStore().increment();

    log.debug( "@load-assets/selection-circles" );
    const selectionCircles: AnimAtlas[] = [];
    for ( let i = 561; i < 571; i++ ) {
        const selCircleGRP = loadAnimAtlas(
            await readCascFile( `anim/main_${i}.anim` ),
            i,
            UnitTileScale.HD
        );

        selectionCircles.push( selCircleGRP );
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

    const envMapFilename = __static + "/envmap.hdr";
    log.debug( `@load-assets/envmap: ${envMapFilename}` );
    loadEnvironmentMap( envMapFilename, ( tex ) => {
        setAsset( "envMap", tex );
    } );

    processStore().increment();

    generateUIIcons( readCascFile ).then( ( icons ) => {
        setAsset( "gameIcons", icons.gameIcons );
        setAsset( "cmdIcons", icons.cmdIcons );
        setAsset( "raceInsetIcons", icons.raceInsetIcons );
        setAsset( "workerIcons", icons.workerIcons );
    } );

    const cursorIcons = await generateCursorIcons( readCascFile );

    const refId = ( id: number ) => {
        if ( sdAnim[id].type === "ref" ) {
            return ( sdAnim[id] as RefAnim ).refId;
        }
        return id;
    };

    const loadingHD2 = new Set();
    const loadingHD = new Set();
    const glbExists = new Map<number, boolean>();
    const atlases: AnimAtlas[] = [];
    // const glbFileName = ( imageId: number ) =>
    //     path.join( directories.assets, `00${imageId}`.slice( -3 ) + ".glb" );

    const hdLoaderJob = new TimeSliceJob<number>(
        ( imageId: number, next ) => {
            _loadAtlas( imageId, UnitTileScale.HD ).then( next );
        },
        [],
        400
    );
    hdLoaderJob.autoUpdate = true;

    const _loadAtlas = async ( imageId: number, res: UnitTileScale, fakeHD = false ) => {
        const refImageId = refId( imageId );

        const anim = loadAnimAtlas( await loadAnimBuffer( refImageId, res ), imageId, res );

        if ( atlases[refImageId]?.isHD2 && anim.isHD ) {
            setHDMipMaps( anim, atlases[refImageId] );
        }

        if ( anim.isHD2 && atlases[refImageId]?.isHD ) {
            log.warn( "hd2 after hd" );
        }

        // assigning to a new object since ImageHD needs to test against its existing atlas
        atlases[imageId] = Object.assign( {}, atlases[imageId], anim, {
            isHD: fakeHD ? true : anim.isHD,
        } );
        atlases[refImageId] = Object.assign( {}, atlases[refImageId], anim, {
            isHD: fakeHD ? true : anim.isHD,
        } );
    };

    /**
     * Loads an image atlas for HD2, HD and GLTF.
     * It will load HD2/GLB at once then load HD once HD2.
     * If HD2 is ignored than only HD and GLB will be loaded.
     * if HD2 is forced than HD2 will be loaded and HD will be ignored.
     * refImageId means we use the same images and iscript with another image id.
     * glbRefImageId means we use the same glb/frame count with another image id.
     */
    const loadImageAtlas = async ( imageId: number ) => {
        const refImageId = refId( imageId );
        // const glbRefImageId = modelSetFileRefIds.get( refImageId ) ?? refImageId;
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
                // glbExists.set( refImageId, await fileExists( glbFileName( glbRefImageId ) ) );
            }
        } else if ( loadingHD2.has( refImageId ) ) {
            return;
        } else if ( !loadingHD2.has( refImageId ) ) {
            loadingHD2.add( refImageId );
            loadingHD2.add( imageId );
            // glbExists.set( refImageId, await fileExists( glbFileName( glbRefImageId ) ) );
        }

        if ( res === UnitTileScale.HD && settings !== "ignore" ) {
            hdLoaderJob.addWork( imageId );
        } else {
            await _loadAtlas( imageId, res, settings === "force" );
        }

        // if ( glbExists.get( refImageId ) ) {
        //     glbExists.set( refImageId, false );

        //     const glb = await loadGlbAtlas(
        //         glbFileName( glbRefImageId ),
        //         // use grp frames for convenience since we might fake being another image for re-use
        //         // and we'll need access to those original frames in order to manipulate things
        //         bwDat.grps[glbRefImageId].frames,
        //         bwDat.images[imageId],
        //         null
        //     );

        //     atlases[imageId] = Object.assign( {}, atlases[imageId], glb );
        //     atlases[refImageId] = Object.assign( {}, atlases[refImageId], glb );
        // }
    };

    // log.debug( "@load-assets/skybox" );
    const loader = new CubeTextureLoader();
    const rootPath = __static + "/skybox/sparse/";
    // log.debug( rootPath );

    loader.setPath( rootPath );

    const skyBox = await new Promise( ( res: ( t: CubeTexture ) => void ) =>
        loader.load(
            [ "right.png", "left.png", "top.png", "bot.png", "front.png", "back.png" ],
            res
        )
    );

    processStore().increment();

    loadImageAtlas( imageTypes.warpInFlash );

    const r = {
        openCascStorage,
        closeCascStorage,
        readCascFile,
        remaining: 7,
        atlases,
        ...cursorIcons,
        selectionCircles,
        minimapConsole,
        loadImageAtlas( imageId: number ) {
            loadImageAtlas( imageId );
            return this.getImageAtlas( imageId );
        },
        getImageAtlas( imageId: number ): AnimAtlas | undefined {
            return atlases[refId( imageId )];
        },
        hasImageAtlas( imageId: number ): boolean {
            return !!this.getImageAtlas( imageId );
        },
        loadImageAtlasAsync( imageId: number ) {
            return loadImageAtlas( imageId );
        },
        skyBox,
        refId,
        resetImagesCache: () => {
            for ( const atlas of atlases ) {
                // might be gaps in the atlases when preloaded and we reset,
                // todo: figure out which case this is and why
                if ( atlas ) {
                    debugger;
                    atlas.dispose();
                }
            }
            atlases.length = 0;
            loadingHD.clear();
            loadingHD2.clear();
            glbExists.clear();

            // special case because this is an overlay? todo: figure this out please
            loadImageAtlas( imageTypes.warpInFlash );
        },
    };

    gameStore().setAssets( r as Assets );

    return r;
};

export const loadImageAtlasDirect = async ( imageId: number ) => {
    //, image3d: boolean ) => {
    const assets = gameStore().assets!;
    // const settings = settingsStore().data;

    const refImageId = assets.refId( imageId );

    // const glbFileName = path.join(
    //     settings.directories.assets,
    //     `00${refImageId}`.slice( -3 ) + ".glb"
    // );
    // const glbFileExists = image3d ? await fileExists( glbFileName ) : false;

    // const imageDat = assets.bwDat.images[imageId];

    // if ( glbFileExists ) {
    //     log.debug( `loading glb  ${glbFileName}` );

    //     const anim = loadAnimAtlas(
    //         await loadAnimBuffer( refImageId, UnitTileScale.HD ),
    //         imageId,
    //         UnitTileScale.HD
    //     );

    //     return {
    //         ...anim,
    //         ...( await loadGlbAtlas( glbFileName, anim.frames, imageDat, assets.envMap! ) ),
    //     };
    // } else {
    return loadAnimAtlas(
        await loadAnimBuffer( refImageId, UnitTileScale.HD ),
        imageId,
        UnitTileScale.HD
    );
    // }
};
