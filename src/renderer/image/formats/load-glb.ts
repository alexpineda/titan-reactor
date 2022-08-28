import {
  AnimationClip,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  sRGBEncoding,
  Texture
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export type GlbResponse = {
  model: Group;
  animations: AnimationClip[];
};
export function loadGlb(
  file: string,
  envMap: Texture | null,
  name = "",
  meshCb: (mesh: Mesh) => void = () => { }
): Promise<GlbResponse> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      file,
      (glb: any) => {
        const { scene: model, animations } = glb;
        model.traverse((o: Object3D) => {
          if (o instanceof Mesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if ((o.material as MeshStandardMaterial).map) {
              (o.material as MeshStandardMaterial).map!.encoding = sRGBEncoding;
            }
            (o.material as MeshStandardMaterial).envMap = envMap;
            (o.material as MeshStandardMaterial).emissive = new Color(0xffffff);
            (o.material as MeshStandardMaterial).emissiveIntensity = 0;
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
