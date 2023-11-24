import { AnimAtlas } from "../atlas";
import { settingsStore } from "@stores/settings-store";
import { IndexedDBCache } from "./indexed-db-cache";
import { ImageLoader } from "./image-loader";

const genFileName = ( i: number, prefix = "" ) =>
    `${prefix}anim/main_${`00${i}`.slice( -3 )}.anim`;

export class ImageLoaderManager {
    maxDownloads = 8;
    currentDownloads = 0;
    imageLoaders = new Map<number, ImageLoader>();
    #refId: ( id: number ) => number;
    #cache = new IndexedDBCache( "image-cache" );

    constructor( refId: ( id: number ) => number ) {
        this.#refId = refId;
        this.#cache.enabled = settingsStore().data.utilities.cacheLocally;
    }

    exists( imageId: number ) {
        const refId = this.#refId( imageId );
        return this.imageLoaders.has( refId );
    }

    getImage( imageId: number, useRefId = true ): AnimAtlas | null {
        const refId = useRefId ? this.#refId( imageId ) : imageId;
        return this.imageLoaders.get( refId )?.atlas ?? null;
    }

    loadImage( imageId: number, priority = 3  ) {
        const refId = this.#refId( imageId );

        if ( this.imageLoaders.has( refId )) {
            this.processQueue();
            return;
        }

        const loader = new ImageLoader(genFileName( refId, "HD2/" ), refId, this.#cache);
        loader.priority = priority;
        // const loader = new ImageLoader(genFileName( refId, res === UnitTileScale.HD2 ? "HD2/" : ""));

        this.imageLoaders.set( refId, loader );
        this.processQueue();

        return new Promise<void>( ( resolve ) => loader.onLoaded = () => {
            resolve();
        } );
    }

    async loadImageImmediate( imageId: number ) {
        const refId = this.#refId( imageId );

        if ( this.imageLoaders.has( refId ) ) {
            return this.imageLoaders.get( refId )?.atlas ?? null;
        }

        const imageLoader = new ImageLoader(genFileName( refId, "HD2/" ), refId, this.#cache);
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
            .sort( ( a, b ) => b.priority - a.priority );

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
