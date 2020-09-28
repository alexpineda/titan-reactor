import * as THREE from "three";

export const initRenderer = ({
  width,
  height,
  antialias = true,
  shadowMap = true,
  canvas = document.createElement("canvas"),
  physicallyCorrectLights = true,
  logarithmicDepthBuffer = false,
}) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
    logarithmicDepthBuffer,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.autoClear = false;
  renderer.toneMapping = THREE.CineonToneMapping; //THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = physicallyCorrectLights;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = shadowMap;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true;

  return renderer;
};
