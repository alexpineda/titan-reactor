import { PMREMGenerator, UnsignedByteType } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default function loadEnvironmentMap(renderer, filepath) {
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  function getCubeMapTexture(file) {
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
