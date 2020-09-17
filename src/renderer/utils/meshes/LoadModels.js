import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { sRGBEncoding, DefaultLoadingManager } from "three";

export class LoadModel {
  constructor(loadingManager = DefaultLoadingManager) {
    this.loadingManager = loadingManager;
  }

  load(file, name = "", userData = {}) {
    return new Promise((resolve, reject) => {
      new GLTFLoader(this.loadingManager).load(
        file,
        ({ scene }) => {
          scene.traverse((o) => {
            if (o.type == "Mesh") {
              o.castShadow = true; //shadow level 1
              o.receiveShadow = true; //shadow level 2
              o.material.encoding = sRGBEncoding;
            }
          });

          Object.assign(scene, { name, userData });

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
