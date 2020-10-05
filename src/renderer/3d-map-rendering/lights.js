import { DirectionalLight, Object3D, Fog, Color } from "three";

export function sunlight(mapWidth, mapHeight) {
  const light = new DirectionalLight(0xffffff, 1.5);
  light.position.set(-32, 13, -26);
  light.target = new Object3D();
  light.castShadow = true;
  light.shadow.camera.near = 0.5; // default
  light.shadow.camera.far = 250; // default

  const sizeW = mapWidth * 0.75;
  const sizeh = mapHeight * 0.75;

  light.shadow.camera.left = -sizeW;
  light.shadow.camera.right = sizeW;
  light.shadow.camera.top = sizeh;
  light.shadow.camera.bottom = -sizeh;
  light.shadow.mapSize.width = 512 * 8; // default
  light.shadow.mapSize.height = 512 * 8; // default
  light.name = "sunlight";
  return light;
}

export function fog(mapWidth, mapHeight, fogColor = 0x080820) {
  const mapSize = Math.min(mapWidth, mapHeight);
  return new Fog(fogColor, mapSize * 4, mapSize * 6);
}
