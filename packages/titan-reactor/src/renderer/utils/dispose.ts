import { Mesh, Scene, Object3D, Material, Texture } from "three";

const textureKeyNames = [
  "map",
  "normalMap",
  "bumpMap",
  "displacementMap",
  "roughnessMap",
  "emissiveMap",
];

export const disposeMesh = (mesh: Mesh) => {
  // dispose textures first
  if (mesh.material) {
    for (const textureKeyName of textureKeyNames) {
      const textureKey = textureKeyName as keyof Material;
      try {
        if (
          mesh.material instanceof Material &&
          mesh.material[textureKey] instanceof Texture
        ) {
          mesh.material[textureKey].dispose();
        } else if (Array.isArray(mesh.material)) {
          for (const material of mesh.material) {
            material[textureKey] instanceof Texture &&
              material[textureKey].dispose();
          }
        }
      } catch (e) {
        console.error("error disposing map", e);
      }
    }

    // then material(s)
    try {
      if (mesh.material instanceof Material) {
        mesh.material.dispose();
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      }
    } catch (e) {
      console.error("error disposing material", e);
    }
  }
  try {
    mesh.geometry && mesh.geometry.dispose();
  } catch (e) {
    console.error("error disposing geometry", e);
  }
};

export const disposeMeshes = (_meshes: Array<Object3D>) => {
  const meshes: Array<Mesh> = [];

  for (const o of _meshes) {
    if (o instanceof Mesh) {
      meshes.push(o);
    }
  }

  meshes.forEach(disposeMesh);
};

export const disposeScene = (scene: Scene) => {
  const meshes: Array<Mesh> = [];

  scene.traverse((o: Object3D) => {
    if (o instanceof Mesh) {
      meshes.push(o);
    }
  });

  meshes.forEach(disposeMesh);
};
