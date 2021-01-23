import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { sRGBEncoding, DefaultLoadingManager } from "three";

export class LoadModel {
  constructor(loadingManager = DefaultLoadingManager) {
    this.loadingManager = loadingManager;
  }

  load(file, name = "", meshCb = (x) => x) {
    return new Promise((resolve, reject) => {
      new GLTFLoader(this.loadingManager).load(
        file,
        ({ scene }) => {
          scene.traverse((o) => {
            if (o.type == "Mesh") {
              o.castShadow = true;
              o.receiveShadow = true;
              o.material.encoding = sRGBEncoding;
              if (meshCb) {
                meshCb(o);
              }
            }
          });

          Object.assign(scene, { name });

          resolve(scene);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }
}
