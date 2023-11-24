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
import { IndexedDBCache } from "./indexed-db-cache";
import { renderComposer } from "@render/index";

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
    onLoaded = () => {};

    constructor(url: string, imageId: number, cache: IndexedDBCache) {
        this.imageId = imageId;
        this.loader = new ResourceIncrementalLoader(`${getCascUrl()}/${url}`, url, cache);
        this.loader.onStatusChange = ( status ) => {
            this.status = status;
            if (status === "loaded") {
                this.atlas = loadAnimAtlas( this.loader.buffer!, this.imageId, UnitTileScale.HD2 );
                renderComposer.glRenderer.initTexture( this.atlas.diffuse );
                this.atlas.teammask && renderComposer.glRenderer.initTexture( this.atlas.teammask );
                this.atlas.hdLayers.emissive && renderComposer.glRenderer.initTexture( this.atlas.hdLayers.emissive );
                this.loader.buffer = null;
                this.priority--;
                this.onLoaded();
                //todo: if load 3d, load 3d
            }
        }
    }

}