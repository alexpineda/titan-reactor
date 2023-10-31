import { UnitTileScale } from "common/types";
import { AnimAtlas } from "../atlas";
import {
    getCascUrl,
} from "@ipc/casclib";
import { ResourceIncrementalLoader } from "./resource-incremental-loader";
import {
    loadAnimAtlas,
    // loadGlbAtlas,
} from "../atlas";
import { ResourceLoaderStatus } from "./resource-loader-status";
import { ResourceLoader } from "./resource-loader";

const genFileName = ( i: number, prefix = "" ) =>
    `${prefix}anim/main_${`00${i}`.slice( -3 )}.anim`;

// const setHDMipMaps = ( hd: AnimAtlas, hd2: AnimAtlas ) => {
//     hd.diffuse.mipmaps.push( hd2.diffuse.mipmaps[0] );

//     if ( hd2.teammask ) {
//         hd.teammask?.mipmaps.push( hd2.teammask.mipmaps[0] );
//     }
// };


// const _loadAtlas = async ( imageId: number, res: UnitTileScale ) => {
//     const refImageId = refId( imageId );

//     const anim = loadAnimAtlas( await loadAnimBuffer( refImageId, res ), imageId, res );

//     if ( atlases[refImageId]?.isHD2 && anim.isHD ) {
//         setHDMipMaps( anim, atlases[refImageId] );
//     }

//     if ( anim.isHD2 && atlases[refImageId]?.isHD ) {
//         log.warn( "hd2 after hd" );
//     }

//     // assigning to a new object since ImageHD needs to test against its existing atlas
//     atlases[imageId] = Object.assign( {}, atlases[imageId], anim  );
//     atlases[refImageId] = Object.assign( {}, atlases[refImageId], anim );
// };


export class ImageLoader {
    atlas: AnimAtlas | null = null;
    loader: ResourceLoader;
    imageId = 0;
    priority = 3;
    status: ResourceLoaderStatus = "idle";

    constructor(url: string, imageId: number) {
        this.imageId = imageId;
        this.loader = new ResourceIncrementalLoader(`${getCascUrl()}/${url}`);
        this.loader.onStatusChange = ( status ) => {
            this.status = status;
            if (status === "loaded") {
                this.atlas = loadAnimAtlas( this.loader.buffer!, this.imageId, UnitTileScale.HD2 );
                this.priority--;
                //todo: if load 3d, load 3d
            }
        }
    }

}

export class ImageLoaderManager {
    maxDownloads = 8;
    currentDownloads = 0;
    imageLoaders = new Map<number, ImageLoader>();
    #refId: ( id: number ) => number;

    constructor( refId: ( id: number ) => number ) {
        this.#refId = refId;
    }

    getImage( imageId: number, useRefId = true ): AnimAtlas | null {
        const refId = useRefId ? this.#refId( imageId ) : imageId;
        return this.imageLoaders.get( refId )?.atlas ?? null;
    }

    loadImage( imageId: number  ) {
        const refId = this.#refId( imageId );

        if ( this.imageLoaders.has( refId ) ) {
            this.processQueue();
            return;
        }

        const loader = new ImageLoader(genFileName( refId, "HD2/" ), imageId);
        // const loader = new ImageLoader(genFileName( refId, res === UnitTileScale.HD2 ? "HD2/" : ""));

        this.imageLoaders.set( refId, loader );
        this.processQueue();
    }

    async loadImageImmediate( imageId: number ) {
        const refId = this.#refId( imageId );

        if ( this.imageLoaders.has( refId ) ) {
            return this.imageLoaders.get( refId )?.atlas ?? null;
        }

        const imageLoader = new ImageLoader(genFileName( refId, "HD2/" ), imageId);
        this.imageLoaders.set( refId, imageLoader );
        await imageLoader.loader.fetch();
        return imageLoader.atlas;
    }


    async processQueue() {
        if ( this.currentDownloads >= this.maxDownloads ) {
            return;
        }

        const imageLoaders = Array.from( this.imageLoaders.values() )
            .filter( ( loader ) => loader.status === "idle" )
            .sort( ( a, b ) => a.priority - b.priority );

        for ( const image of imageLoaders ) {
            this.currentDownloads++;
            image.loader.fetch().finally( () => {
                this.currentDownloads--;
                this.processQueue();
            });
        }
    }
    
    dispose() {
        for (const image of this.imageLoaders.values()) {
            image.atlas?.dispose();
            image.loader.cancel();
        }
        this.imageLoaders.clear();
    }
}
