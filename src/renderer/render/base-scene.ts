import {
  DirectionalLight,
  Object3D,
  Scene as ThreeScene,
} from "three";

import Janitor from "@utils/janitor";
import { disposeObject3D } from "@utils/dispose";
import { Terrain } from "@core/terrain";
import { BorderTiles } from "./border-tiles";

function sunlight(mapWidth: number, mapHeight: number) {
  const light = new DirectionalLight(0xffffff, 2.5);
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
  light.shadow.mapSize.width = 512 * 2;
  light.shadow.mapSize.height = 512 * 2;
  light.shadow.autoUpdate = true;
  light.shadow.needsUpdate = true;
  light.name = "sunlight";
  return light;
}

export class BaseScene extends ThreeScene {
  #mapWidth: number;
  #mapHeight: number;
  #janitor: Janitor;
  #borderTiles: BorderTiles;

  sunlight: DirectionalLight;

  //@ts-ignore
  userData: {
    terrain: Terrain
  }

  constructor(
    mapWidth: number,
    mapHeight: number,
    terrain: Terrain) {
    super();
    this.#mapHeight = mapHeight;
    this.#mapWidth = mapWidth;

    this.#janitor = new Janitor();
    this.#janitor.add(this);

    this.autoUpdate = false;

    this.sunlight = sunlight(this.#mapWidth, this.#mapHeight);

    this.sunlight.layers.enableAll();
    this.sunlight.updateMatrixWorld();

    this.add(this.sunlight);
    this.addTerrain(terrain);

    this.#borderTiles = new BorderTiles(terrain);
    this.add(this.#borderTiles);

    this.#borderTiles.rotation.x = -Math.PI / 2;
    this.#borderTiles.updateMatrixWorld();

    // this.overrideMaterial = new MeshBasicMaterial({ color: "white" });
  }

  setBorderTileColor(color: number) {
    this.#borderTiles.color = color;
  }

  addTerrain(
    terrain: Terrain
  ) {
    this.userData.terrain = terrain;
    this.add(terrain);
    terrain.updateMatrixWorld();
  }

  replaceTerrain(
    terrain: Terrain
  ) {
    disposeObject3D(this.userData.terrain)
    this.remove(this.userData.terrain);
    this.addTerrain(terrain);
  }

  get terrain() {
    return this.userData.terrain;
  }

  dispose() {
    this.#janitor.dispose();
  }
}
export default BaseScene;
