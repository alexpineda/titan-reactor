import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  Object3D,
  Scene as ThreeScene,
} from "three";

import { TerrainInfo } from "../../common/types";
import { disposeMesh, disposeMeshes, disposeScene } from "../utils/dispose";

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
  private _mapWidth: number;
  private _mapHeight: number;
  private _disposable: Mesh[] = [];

  constructor({
    mapWidth,
    mapHeight,
    sdTerrain,
    terrain,
  }: Pick<TerrainInfo, "mapWidth" | "mapHeight" | "sdTerrain" | "terrain">) {
    super();
    this._mapHeight = mapHeight;
    this._mapWidth = mapWidth;

    this.addLights();
    this.addTerrain(sdTerrain, terrain);
  }

  private addLights() {
    const lights = [
      new HemisphereLight(0xffffff, 0xffffff, 5),
      sunlight(this._mapWidth, this._mapHeight)
    ]
    lights.forEach(light => this.add(light));
  }

  addTerrain(
    sdTerrain: Mesh,
    terrain?: Mesh,
  ) {
    this.userData = { terrain: sdTerrain, sdTerrain };
    // sdTerrain.visible = false;
    this.add(sdTerrain);
    // this.add(terrain);

    this._disposable.push(sdTerrain);
    // this._disposable.push(terrain);
  }

  replaceTerrain(sdTerrain: Mesh,
    terrain?: Mesh,) {
    this._disposable.forEach(mesh => {
      disposeMesh(mesh);
      mesh.removeFromParent()
    });
    this._disposable = [];
    this.addTerrain(sdTerrain, terrain);
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
    disposeScene(this)
    this.userData = {};
  }
}
export default Scene;
