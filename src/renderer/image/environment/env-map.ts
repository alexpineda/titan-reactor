import { PMREMGenerator, Texture } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { renderComposer } from "@render/render-composer"

export default function loadEnvironmentMap(
  filepath: string
): Promise<Texture> {
  const pmremGenerator = new PMREMGenerator(renderComposer.getWebGLRenderer());
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
