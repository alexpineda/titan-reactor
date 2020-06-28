function onResize(camera, renderer, cb) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function handleResize(camera, renderer) {
  window.addEventListener(
    "resize",
    onResize.bind(null, camera, renderer),
    false
  );
  return () => window.removeEventListener("resize");
}
