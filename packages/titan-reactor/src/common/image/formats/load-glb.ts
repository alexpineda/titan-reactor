import {
  AnimationClip,
  Color,
  CubeTexture,
  Group,
  Mesh,
  Object3D,
  sRGBEncoding
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// import ElectronGLTFLoader from "./gltf-loader";

export type GlbResponse = {
  model: Group;
  animations: AnimationClip[];
};
export function loadGlb(
  file: string,
  envMap: CubeTexture | null,
  name = "",
  meshCb: (mesh: Mesh) => void = () => { }
) {
  return new Promise((resolve, reject) => {
    //@todo refactor GLTF Loader to classes
    // @ts-ignore
    new GLTFLoader().load(
      file,
      (glb: any) => {
        const { scene: model, animations } = glb;
        model.traverse((o: Object3D) => {
          if (o instanceof Mesh) {
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
      (error: any) => {
        console.error(error);
        reject(error);
      }
    );
  });
}
export default loadGlb;
