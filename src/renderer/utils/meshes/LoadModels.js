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
        function ({ scene }) {
          scene.traverse((o) => {
            if (o.type == "Mesh") {
              o.castShadow = true; //shadow level 1
              o.receiveShadow = true; //shadow level 2
              o.material.encoding = sRGBEncoding;
            }
          });

          scene.name = name;
          scene.userData = userData;

          resolve(scene);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });
  }
}

class LoadModels {
  constructor() {}

  loadAll() {
    const loader = new LoadModel();

    return new Promise((resolve, reject) => {
      Promise.all([
        // loader.load(Mineral1, "Mineral1", {hello:'word'})
      ]).then((models) => {
        this.models = models;
        resolve(models);
      }, reject);
    });
  }

  createInstance(name) {
    return this.models.find((m) => m.name === name).clone();
  }

  dispose() {
    this.models = [];
  }
}

export default LoadModels;
