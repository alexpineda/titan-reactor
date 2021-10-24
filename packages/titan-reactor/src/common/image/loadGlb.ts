import { Color, CubeTexture, Mesh, Scene, sRGBEncoding } from "three";

import ElectronGLTFLoader from "../utils/GLTFLoader";

type GlbResponse = {
  scene: Scene;
  animations: any;
};
export default function loadGlb(
  file: string,
  envMap: CubeTexture | null,
  name = "",
  meshCb: (mesh: Mesh) => void = () => {}
) {
  return new Promise((resolve, reject) => {
    //@todo refactor GLTF Loader to classes
    new ElectronGLTFLoader().load(
      file,
      (glb: GlbResponse) => {
        const { scene: model, animations } = glb;
        model.traverse((o) => {
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
      (error: Error) => {
        console.error(error);
        reject(error);
      }
    );
  });
}
