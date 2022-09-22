import { Object3D, Material, Texture, BufferGeometry } from "three";

export type Object3DLike = {
  type?: string;
  material?: Material | Material[],
  geometry?: BufferGeometry,
  children?: Object3D[],
  clear?: () => void,
}

const textureKeyNames = [
  "map",
  "normalMap",
  "bumpMap",
  "displacementMap",
  "roughnessMap",
  "emissiveMap",
];

export const disposeMesh = (mesh: Object3DLike, log: (message: string) => void = () => { }) => {

  if (mesh.material) {
    for (const textureKeyName of textureKeyNames) {

      const textureKey = textureKeyName as keyof Material;
      try {

        if (
          mesh.material instanceof Material &&
          mesh.material[textureKey] instanceof Texture
        ) {

          log(`${textureKey} ${mesh.material[textureKey].name}`);
          mesh.material[textureKey].dispose();
          delete mesh.material[textureKey];

        } else if (Array.isArray(mesh.material)) {

          for (const material of mesh.material) {

            if (material[textureKey] instanceof Texture) {

              log(`${textureKey} ${material[textureKey].name}`);
              material[textureKey].dispose();
              delete material[textureKey];

            }

          }

        }

      } catch (e) {
        console.error("error disposing map", e);
      }
    }

    // then material(s)
    try {

      if (mesh.material instanceof Material) {

        log(`material ${mesh.material.name}`);
        mesh.material.dispose();

      } else if (Array.isArray(mesh.material)) {

        mesh.material.forEach((material, i) => {
          log(`material ${i} ${material.name}`);
          material.dispose()
        });

      }

    } catch (e) {

      console.error("error disposing material", e);

    }
    mesh.material = undefined;

  }

  try {

    if (mesh.geometry) {

      mesh.geometry.dispose();
      log(`geometry ${mesh.geometry.name}`);
      mesh.geometry = undefined;

    }
  } catch (e) {

    console.error("error disposing geometry", e);

  }

};