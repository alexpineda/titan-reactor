export const findObject = (testFn) => {
  scene.traverse((o) => {
    if (testFn(o)) {
      return mesh;
    }
  });
};

export const findObjects = (testFn) => {
  const meshes = [];
  scene.traverse((o) => {
    if (testFn(o)) {
      meshes.push(o);
    }
  });
  return meshes;
};
