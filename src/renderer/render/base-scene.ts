import {
  CubeTexture,
  Scene,
  Texture
} from "three";

import { Terrain } from "@core/terrain";
import { BorderTiles } from "./border-tiles";
import { Sunlight } from "./sunlight";

export class BaseScene extends Scene {
  #borderTiles: BorderTiles;
  mapWidth: number;
  mapHeight: number;

  sunlight: Sunlight;
  terrain: Terrain;

  constructor(
    mapWidth: number,
    mapHeight: number,
    terrain: Terrain,
    skyBox?: CubeTexture,
    envMap?: Texture
  ) {
    super();
    //@ts-expect-error
    this.matrixWorldAutoUpdate = false;

    this.sunlight = new Sunlight(mapWidth, mapHeight);
    this.add(...this.sunlight.children);

    this.add(terrain);
    this.terrain = terrain;
    terrain.updateMatrixWorld();

    this.#borderTiles = new BorderTiles(terrain);
    this.add(this.#borderTiles);

    this.#borderTiles.rotation.x = -Math.PI / 2;
    this.#borderTiles.updateMatrixWorld();

    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;

    if (skyBox) {
      this.background = skyBox;
    }

    if (envMap) {
      this.environment = envMap;
    }
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

  dispose() {
    this.sunlight.dispose();
  }
}
export default BaseScene;
