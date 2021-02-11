import { Color, sRGBEncoding } from "three";
import GLTFLoader from "../utils/GLTFLoader";

export default function loadGlb(file, envMap, name = "", meshCb = (x) => x) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      file,
      (glb) => {
        const { scene: model, animations } = glb;
        model.traverse((o) => {
          if (o.type == "Mesh" || o.type == "SkinnedMesh") {
            o.castShadow = true;
            o.receiveShadow = true;
            o.material.encoding = sRGBEncoding;
            o.material.envMap = envMap;
            o.material.emissive = new Color(0xffffff);
            model.userData.mesh = o;
            if (meshCb) {
              meshCb(o);
            }
          }
        });

        Object.assign(model, { name });

        resolve({ model, animations });
      },
      undefined,
      (error) => {
        console.error(error);
        reject(error);
      }
    );
  });
}
