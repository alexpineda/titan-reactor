import Chk from "libs/bw-chk";
import { DirectionalLight, HemisphereLight, Object3D, Scene as ThreeScene } from "three";

import { generateMaterialsAndMeshes, generateTextures } from "../../common/image/generate-map";
import { loadTilesetFilesAsync } from "../../common/image/generate-map/map-data";
import { TerrainInfo } from "../../common/types";
import { readCascFile } from "../../common/utils/casclib";
import { disposeMeshes } from "../utils/dispose";

export async function generateTerrain(chk: Chk) {
  // load all the tile files we need
  const tileFilesData = await loadTilesetFilesAsync(readCascFile, chk);

  // interpret them and create intermediate bitmaps and textures
  const mapData = await generateTextures(
    chk.size[0],
    chk.size[1],
    tileFilesData
  );

  // compile bitmaps and textures into shader programs, materials and meshes
  return await generateMaterialsAndMeshes(mapData);
}

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

export class Scene extends ThreeScene {
  constructor({
    mapWidth,
    mapHeight,
    sdTerrain,
    terrain,
  }: Pick<TerrainInfo, "mapWidth" | "mapHeight" | "sdTerrain" | "terrain">) {
    super();
    this.userData = { sdTerrain, terrain };
    sdTerrain.visible = false;
    this.add(sdTerrain);
    this.add(terrain);
    this.add(sunlight(mapWidth, mapHeight));
    this.add(new HemisphereLight(0xffffff, 0xffffff, 5));
  }

  toggleElevation() {
    this.userData.sdTerrain.visible = !this.userData.sdTerrain.visible;
    this.userData.terrain.visible = !this.userData.terrain.visible;
  }

  get terrain() {
    return this.userData.terrain;
  }

  incrementTileAnimation() {
    if (
      this.userData.sdTerrain.material.userData.tileAnimationCounter !==
      undefined
    ) {
      this.userData.sdTerrain.material.userData.tileAnimationCounter.value++;
    }
  }

  dispose() {
    disposeMeshes(this);
    this.userData = {};
  }
}
export default Scene;
