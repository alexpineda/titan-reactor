import { DirectionalLight } from "three";

export function sunlight(mapWidth, mapHeight) {
  const light = new DirectionalLight(0xffffff, 3);
  light.position.set(-40, 20, -60);
  light.castShadow = true;
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 100; // default

  const sizeW = mapWidth * 0.65;
  const sizeh = mapHeight * 0.65;

  light.shadow.camera.left = -sizeW;
  light.shadow.camera.right = sizeW;
  light.shadow.camera.top = sizeh;
  light.shadow.camera.bottom = -sizeh;
  light.shadow.mapSize.width = 512 * 8; // default
  light.shadow.mapSize.height = 512 * 8; // default
  return light;
}
