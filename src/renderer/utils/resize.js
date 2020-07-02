function onResize(camera, renderer, cb) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function handleResize(camera, renderer) {
  const handler = onResize.bind(null, camera, renderer);
  window.addEventListener("resize", handler, false);
  return () => window.removeEventListener("resize", handler);
}
