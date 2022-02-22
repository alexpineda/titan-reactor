import { PMREMGenerator, Texture, WebGLRenderer } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default function loadEnvironmentMap(
  filepath: string
): Promise<Texture> {
  const renderer = new WebGLRenderer();
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  function getCubeMapTexture(file: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      new RGBELoader().load(
        file,
        (texture) => {
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          pmremGenerator.dispose();

          resolve(envMap);
        },
        undefined,
        reject
      );
    });
  }

  return getCubeMapTexture(filepath);
}
