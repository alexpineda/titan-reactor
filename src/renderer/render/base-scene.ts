import {
  Scene
} from "three";

import Janitor from "@utils/janitor";
import { disposeObject3D } from "@utils/dispose";
import { Terrain } from "@core/terrain";
import { BorderTiles } from "./border-tiles";
import { Sunlight } from "./sunlight";

export class BaseScene extends Scene {
  #janitor: Janitor;
  #borderTiles: BorderTiles;
  mapWidth: number;
  mapHeight: number;

  sunlight: Sunlight;

  //@ts-ignore
  userData: {
    terrain: Terrain
  }

  constructor(
    mapWidth: number,
    mapHeight: number,
    terrain: Terrain) {
    super();
    this.autoUpdate = false;

    this.#janitor = new Janitor();
    this.#janitor.mop(this);

    this.sunlight = new Sunlight(mapWidth, mapHeight);
    this.add(...this.sunlight.children);
    this.addTerrain(terrain);

    this.#borderTiles = new BorderTiles(terrain);
    this.add(this.#borderTiles);

    this.#borderTiles.rotation.x = -Math.PI / 2;
    this.#borderTiles.updateMatrixWorld();

    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;

    // this.overrideMaterial = new MeshBasicMaterial({ color: "white" });
  }

  createSunlight() {
    this.sunlight.dispose();
    for (const child of this.sunlight.children) {
      this.remove(child);
    }
    this.sunlight = new Sunlight(this.mapWidth, this.mapHeight);
    this.add(...this.sunlight.children);
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
    this.sunlight.dispose();
    this.#janitor.dispose();
  }
}
export default BaseScene;
