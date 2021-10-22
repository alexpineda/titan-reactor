import { Mesh, Scene, Object3D, Material, Texture} from "three";

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
        if (mesh.material instanceof Material && textureKey in mesh.material) {
          (mesh.material[textureKey] as Texture).dispose();
        } else if (Array.isArray(mesh.material)) {
          mesh.material.forEach(material => textureKey in mesh.material && (material[textureKey] as Texture).dispose());
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
        mesh.material.forEach(material => material.dispose());
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

export const disposeMeshes = (scene: Scene) => {
  const meshes:Array<Mesh> = [];

  scene.traverse((o: Object3D) => {
    if (o instanceof Mesh) {
      meshes.push(o);
    }
  });

  meshes.forEach(disposeMesh);
};
