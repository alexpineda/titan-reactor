import { DirectionalLight, Object3D, Fog, Color } from "three";

export function sunlight(mapWidth, mapHeight) {
  const light = new DirectionalLight(0xffffff, 3);
  light.position.set(-40, 20, -60);
  light.target = new Object3D();
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
  light.name = "sunlight";
  return light;
}

export function fog(mapWidth, mapHeight, fogColor = 0x080820) {
  const mapSize = Math.min(mapWidth, mapHeight);
  return new Fog(fogColor, mapSize * 2, mapSize * 4);
}