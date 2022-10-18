import { Texture } from "three";
import { SimpleBufferView } from "@buffer-view";

import { Janitor } from "three-janitor";
import { generateCreep } from "./generate-creep";

export class Creep {
    mapWidth: number;
    mapHeight: number;
    creepValuesTexture: Texture;
    creepEdgesValuesTexture: Texture;
    minimapImageData: ImageData;
    worker: Worker;

    #janitor = new Janitor( "Creep" );
    #waiting = false;

    constructor(
        mapWidth: number,
        mapHeight: number,
        creepValuesTexture: Texture,
        creepEdgesValuesTexture: Texture
    ) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.creepValuesTexture = creepValuesTexture;
        this.creepEdgesValuesTexture = creepEdgesValuesTexture;
        this.minimapImageData = new ImageData( mapWidth, mapHeight );

        this.worker = new Worker( new URL( "./creep.worker.ts", import.meta.url ), {
            type: "module",
        } ); // new Worker();

        this.worker.onmessage = ( {
            data,
        }: {
            data: {
                imageData: ImageData;
                creepData: Uint8Array;
                edgesData: Uint8Array;
            };
        } ) => {
            const { creepData, edgesData, imageData } = data;

            this.creepValuesTexture.image.data = creepData;
            this.creepEdgesValuesTexture.image.data = edgesData;
            this.creepValuesTexture.needsUpdate = true;
            this.creepEdgesValuesTexture.needsUpdate = true;

            this.minimapImageData = imageData;
            this.#waiting = false;
        };
        this.#janitor.mop( () => this.worker.terminate(), "worker" );
        this.#janitor.mop( this.creepEdgesValuesTexture, "creepEdgesValuesTexture" );
        this.#janitor.mop( this.creepValuesTexture, "creepValuesTexture" );
    }

    generate( tiles: SimpleBufferView<Uint8Array>, frame: number ) {
        if ( this.#waiting ) return;

        this.#waiting = true;

        const msg = {
            buffer: tiles.copy(),
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            frame,
        };

        this.worker.postMessage( msg, [ msg.buffer.buffer ] );
    }

    generateImmediate( tiles: SimpleBufferView<Uint8Array> ) {
        const { creepData, edgesData, imageData } = generateCreep(
            tiles.shallowCopy(),
            this.mapWidth,
            this.mapHeight
        );

        this.creepValuesTexture.image.data = creepData;
        this.creepEdgesValuesTexture.image.data = edgesData;
        this.creepValuesTexture.needsUpdate = true;
        this.creepEdgesValuesTexture.needsUpdate = true;

        this.minimapImageData = imageData;
    }

    dispose() {
        this.#janitor.dispose();
    }
}
