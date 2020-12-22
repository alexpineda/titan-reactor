import { DirectionalLight, Object3D, Fog, Color } from "three";

export function sunlight(mapWidth, mapHeight) {
  const light = new DirectionalLight(0xffffff, 2);
  light.position.set(-32, 13, -26);
  light.target = new Object3D();
  light.castShadow = true;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 200;
  light.shadow.bias = 0.0001;

  const sizeW = mapWidth * 0.75;
  const sizeh = mapHeight * 0.75;

  light.shadow.camera.left = -sizeW;
  light.shadow.camera.right = sizeW;
  light.shadow.camera.top = sizeh;
  light.shadow.camera.bottom = -sizeh;
  light.shadow.mapSize.width = 512 * 4;
  light.shadow.mapSize.height = 512 * 4;
  light.name = "sunlight";
  return light;
}

export function fog(mapWidth, mapHeight, fogColor = 0x080820) {
  const mapSize = Math.min(mapWidth, mapHeight);
  return new Fog(fogColor, mapSize * 4, mapSize * 6);
}
