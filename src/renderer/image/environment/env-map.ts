import { readFile } from "fs/promises";
import { ClampToEdgeWrapping, DataTexture, EquirectangularReflectionMapping, LinearFilter, LinearMipmapLinearFilter, Texture } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
// import EXRWorker from './exworker?worker'

export async function loadEnvironmentMap(
  filepath: string
): Promise<Texture> {

  if (filepath.endsWith(".hdr")) {
    const loader = new RGBELoader();
    const tex = await loader.loadAsync(filepath);
    tex.mapping = EquirectangularReflectionMapping;

    return tex;
  } else if (filepath.endsWith(".exr")) {
    // const loader = new EXRLoader();

    // const tex = await loader.loadAsync(filepath);
    // tex.mapping = EquirectangularReflectionMapping;

    // return tex;

    const worker = new Worker(new URL("./exr.worker.ts", import.meta.url), { type: "module" });
    const buffer = new Uint8Array(await (await readFile(filepath)).buffer);

    return await new Promise(res => {
      worker.postMessage({ buffer }, [buffer.buffer]);

      worker.onmessage = function ({ data: texData }) {

        const texture = new DataTexture(texData.data, texData.width, texData.height, texData.format, texData.type);

        texture.wrapS = texData.wrapS !== undefined ? texData.wrapS : ClampToEdgeWrapping;
        texture.wrapT = texData.wrapT !== undefined ? texData.wrapT : ClampToEdgeWrapping;

        texture.magFilter = texData.magFilter !== undefined ? texData.magFilter : LinearFilter;
        texture.minFilter = texData.minFilter !== undefined ? texData.minFilter : LinearFilter;

        texture.anisotropy = texData.anisotropy !== undefined ? texData.anisotropy : 1;

        if (texData.encoding !== undefined) {

          texture.encoding = texData.encoding;

        }

        if (texData.flipY !== undefined) {

          texture.flipY = texData.flipY;

        }

        if (texData.format !== undefined) {

          texture.format = texData.format;

        }

        if (texData.type !== undefined) {

          texture.type = texData.type;

        }

        if (texData.mipmaps !== undefined) {

          texture.mipmaps = texData.mipmaps;
          texture.minFilter = LinearMipmapLinearFilter; // presumably...

        }

        if (texData.mipmapCount === 1) {

          texture.minFilter = LinearFilter;

        }

        if (texData.generateMipmaps !== undefined) {

          texture.generateMipmaps = texData.generateMipmaps;

        }

        texture.needsUpdate = true;
        texture.mapping = EquirectangularReflectionMapping;


        res(texture);
      };

    });


  } else {

    throw new Error("Unsupported environment map format");

  }

}