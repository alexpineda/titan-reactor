import { PMREMGenerator, UnsignedByteType, WebGLRenderer } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default function loadEnvironmentMap(
  renderer: WebGLRenderer,
  filepath: string
) {
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  function getCubeMapTexture(file: string) {
    return new Promise((resolve, reject) => {
      new RGBELoader().setDataType(UnsignedByteType).load(
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
