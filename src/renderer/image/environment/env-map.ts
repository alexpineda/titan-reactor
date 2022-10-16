import { readFile } from "fs/promises";
import {
    ClampToEdgeWrapping,
    DataTexture,
    EquirectangularReflectionMapping,
    LinearFilter,
    Texture,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EXR } from "three/examples/jsm/loaders/EXRLoader";

export async function loadEnvironmentMap( filepath: string ): Promise<Texture> {
    if ( filepath.endsWith( ".hdr" ) ) {
        const loader = new RGBELoader();
        const tex = await loader.loadAsync( filepath );
        tex.mapping = EquirectangularReflectionMapping;

        return tex;
    } else if ( filepath.endsWith( ".exr" ) ) {
        const worker = new Worker( new URL( "./exr.worker.ts", import.meta.url ), {
            type: "module",
        } );
        const buffer = new Uint8Array( ( await readFile( filepath ) ).buffer );

        return await new Promise( ( res ) => {
            worker.postMessage( { buffer }, [buffer.buffer] );

            worker.onmessage = function ( { data: texData }: { data: EXR } ) {
                const texture = new DataTexture(
                    texData.data,
                    texData.width,
                    texData.height,
                    texData.format,
                    texData.type
                );

                texture.wrapS = ClampToEdgeWrapping;
                texture.wrapT = ClampToEdgeWrapping;

                texture.magFilter = LinearFilter;
                texture.minFilter = LinearFilter;

                texture.anisotropy = 1;
                texture.format = texData.format;

                texture.type = texData.type;

                texture.needsUpdate = true;
                texture.mapping = EquirectangularReflectionMapping;

                res( texture );

                worker.terminate();
            };
        } );
    } else {
        throw new Error( "Unsupported environment map format" );
    }
}
