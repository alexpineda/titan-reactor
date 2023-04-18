import { readFile } from "fs/promises";
import {
    ClampToEdgeWrapping,
    DataTexture,
    EquirectangularReflectionMapping,
    LinearFilter,
} from "three";
import { RGBE } from "three/examples/jsm/loaders/RGBELoader";
import { EXR } from "three/examples/jsm/loaders/EXRLoader";

// from DataTextureLoader
const createDataTextureFromResult = ( texData: RGBE | EXR, texture: DataTexture ) => {
    //@ts-expect-error
    texture.image.width = texData.width;
    //@ts-expect-error
    texture.image.height = texData.height;
    //@ts-expect-error
    texture.image.data = texData.data;

    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;

    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;

    texture.anisotropy = 1;

    // @ts-expect-error
    if ( texData.format ) {
        // eslint-disable-next-line
        texture.format = texData.format;
    }

    texture.type = texData.type;

    texture.needsUpdate = true;
    texture.mapping = EquirectangularReflectionMapping;

    return texture;
};

export function loadEnvironmentMap(
    filepath: string,
    onLoaded?: ( tex: DataTexture ) => void
): DataTexture {
    const worker = filepath.endsWith( ".hdr" )
        ? new Worker( new URL( "./rgbe.worker.ts", import.meta.url ), {
              type: "module",
          } )
        : new Worker( new URL( "./exr.worker.ts", import.meta.url ), {
              type: "module",
          } );

    const texture = new DataTexture();

    const execute = async () => {
        const buffer = new Uint8Array( ( await readFile( filepath ) ).buffer );
        worker.postMessage( { buffer }, [ buffer.buffer ] );

        worker.onmessage = function ( { data: texData }: { data: RGBE } ) {
            onLoaded && onLoaded( createDataTextureFromResult( texData, texture ) );

            worker.terminate();
        };
    };
    execute();

    return texture;
}
