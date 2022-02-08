import path from "path";
import {
  CubeTextureLoader,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Scene as ThreeScene,
} from "three";

import { TerrainInfo } from "../../common/types";
import Janitor from "../utils/janitor";

function sunlight(mapWidth: number, mapHeight: number) {
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

//@todo remove this class
export class Scene extends ThreeScene {
  private _mapWidth: number;
  private _mapHeight: number;
  private _janitor: Janitor;

  constructor({
    mapWidth,
    mapHeight,
    terrain,
  }: Pick<TerrainInfo, "mapWidth" | "mapHeight" | "terrain">) {
    super();
    this._mapHeight = mapHeight;
    this._mapWidth = mapWidth;

    this._janitor = new Janitor();
    this.addLights();
    this.addTerrain(terrain);
  }

  private addLights() {
    const lights = [
      new HemisphereLight(0xffffff, 0xffffff, 1)
      , sunlight(this._mapWidth, this._mapHeight)
    ]
    lights.forEach(light => this.add(light));
  }

  skybox(key: string) {
    const loader = new CubeTextureLoader();
    const rootPath = path.join(__static, "skybox", key);
    loader.setPath(rootPath);

    const textureCube = loader.load([
      'right.png',
      'left.png',
      'top.png',
      'bot.png',
      'front.png',
      'back.png',
    ]);

    this.background = textureCube;
  }

  addTerrain(
    terrain: Mesh
  ) {
    this.userData = { terrain };
    this.add(terrain);
    this._janitor.object3d(terrain);

  }

  replaceTerrain(terrain: Mesh) {
    this._janitor.mopUp();
    this.addTerrain(terrain);
  }

  get terrain() {
    return this.userData.terrain;
  }

  incrementTileAnimation() {
    if (
      this.terrain.name === "SDTerrain" && this.terrain?.material.userData.tileAnimationCounter !== undefined
    ) {
      this.terrain.material.userData.tileAnimationCounter.value++;
    }
  }
}
export default Scene;
