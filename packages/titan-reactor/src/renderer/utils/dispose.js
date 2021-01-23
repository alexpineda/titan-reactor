export const disposeMesh = (mesh) => {
  const maps = [
    "map",
    "normalMap",
    "bumpMap",
    "displacementMap",
    "roughnessMap",
    "emissiveMap",
  ];

  if (mesh.material) {
    maps.forEach((map) => {
      try {
        if (mesh.material[map] && mesh.material[map].dispose) {
          mesh.material[map].dispose();
        }

        if (mesh.userData[map] && mesh.userData[map].dispose) {
          mesh.userData[map].dispose();
        }
      } catch (e) {
        console.error(`error disposing map`, e);
      }
    });

    try {
      mesh.material && mesh.material.dispose();
    } catch (e) {
      console.error(`error disposing material`, e);
    }
  }
  try {
    mesh.geometry && mesh.geometry.dispose();
  } catch (e) {
    console.error(`error disposing geometry`, e);
  }
};

export const disposeMeshes = (scene) => {
  const meshes = [];

  scene.traverse((o) => {
    if (o.type === "Mesh") {
      meshes.push(o);
    }
  });

  meshes.forEach(disposeMesh);
};
