function onResize(camera, renderer) {
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
}

export function cancelResize() {
  window.removeEventListener("resize");
}
