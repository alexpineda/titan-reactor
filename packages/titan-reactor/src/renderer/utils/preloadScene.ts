import {
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Texture,
  WebGLRenderer,
} from "three";

const textureKeyNames = [
  "map",
  "normalMap",
  "bumpMap",
  "displacementMap",
  "roughnessMap",
  "emissiveMap",
];

export default (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera
) => {
  renderer.compile(scene, camera);

  const meshes: Array<Mesh> = [];

  scene.traverse((o: Object3D) => {
    if (o instanceof Mesh) {
      meshes.push(o);
    }
  });

  for (const mesh of meshes) {
    if (mesh.material) {
      for (const textureKeyName of textureKeyNames) {
        const textureKey = textureKeyName as keyof Material;
        if (
          mesh.material instanceof Material &&
          mesh.material[textureKey] instanceof Texture
        ) {
          renderer.initTexture(mesh.material[textureKey]);
        } else if (Array.isArray(mesh.material)) {
          for (const material of mesh.material) {
            if (material[textureKey] instanceof Texture) {
              renderer.initTexture(material[textureKey]);
            }
          }
        }
      }
    }
  }
};
