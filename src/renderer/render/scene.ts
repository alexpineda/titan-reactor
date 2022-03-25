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
  Texture,
} from "three";

import { TerrainInfo } from "common/types";
import Janitor from "@utils/janitor";
import { onTerrainGenerated } from "../plugins";


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
  private _janitor: Janitor;
  private _skybox: Texture;

  constructor({
    mapWidth,
    mapHeight,
    terrain,
  }: Pick<TerrainInfo, "mapWidth" | "mapHeight" | "terrain" | "tileset">) {
    super();
    this._mapHeight = mapHeight;
    this._mapWidth = mapWidth;

    this._janitor = new Janitor();
    this.addLights();
    this.addTerrain(terrain);
    this._skybox = this.skybox("sparse");

    onTerrainGenerated(this, terrain, mapWidth, mapHeight);
    // this.enableSkybox();

    const edgeMaterial = new MeshBasicMaterial({
      map: (terrain.material as MeshStandardMaterial).map
    });
    edgeMaterial.transparent = true;
    edgeMaterial.opacity = 0.5;

    const bc = new Mesh();
    bc.geometry = terrain.geometry;
    bc.material = edgeMaterial;
    bc.rotation.x = -Math.PI / 2;
    bc.position.set(0, 0, mapHeight);
    bc.scale.setY(-1);
    this.add(bc);

    const br = new Mesh();
    br.geometry = terrain.geometry;
    br.material = edgeMaterial;
    br.rotation.x = -Math.PI / 2;
    br.position.set(mapWidth, 0, mapHeight);
    br.scale.setY(-1);
    br.scale.setX(-1);
    this.add(br)

    const bl = new Mesh();
    bl.geometry = terrain.geometry;
    bl.material = edgeMaterial;
    bl.rotation.x = -Math.PI / 2;
    bl.position.set(-mapWidth, 0, mapHeight);
    bl.scale.setY(-1);
    bl.scale.setX(-1);
    this.add(bl)


    const tc = new Mesh();
    tc.geometry = terrain.geometry;
    tc.material = edgeMaterial;
    tc.rotation.x = -Math.PI / 2;
    tc.position.set(0, 0, -mapHeight);
    tc.scale.setY(-1);
    this.add(tc);

    const tr = new Mesh();
    tr.geometry = terrain.geometry;
    tr.material = edgeMaterial;
    tr.rotation.x = -Math.PI / 2;
    tr.position.set(mapWidth, 0, -mapHeight);
    tr.scale.setY(-1);
    tr.scale.setX(-1);
    this.add(tr)

    const tl = new Mesh();
    tl.geometry = terrain.geometry;
    tl.material = edgeMaterial;
    tl.rotation.x = -Math.PI / 2;
    tl.position.set(-mapWidth, 0, -mapHeight);
    tl.scale.setY(-1);
    tl.scale.setX(-1);
    this.add(tl)

    const l = new Mesh();
    l.geometry = terrain.geometry;
    l.material = edgeMaterial;
    l.rotation.x = -Math.PI / 2;
    l.position.set(-mapWidth, 0, 0);
    l.scale.setX(-1);
    this.add(l)

    const r = new Mesh();
    r.geometry = terrain.geometry;
    r.material = edgeMaterial;
    r.rotation.x = -Math.PI / 2;
    r.position.set(mapWidth, 0, 0);
    r.scale.setX(-1);
    this.add(r)
  }

  private addLights() {
    const lights = [
      new HemisphereLight(0xffffff, 0xffffff, 1)
      , sunlight(this._mapWidth, this._mapHeight)
    ]
    lights.forEach(light => {
      this.add(light)
    });
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

    return textureCube;
  }

  disableSkybox() {
    this.background = null;
  }

  enableSkybox() {
    this.background = this._skybox;
  }

  addTerrain(
    terrain: Mesh
  ) {
    this.userData = { terrain };
    this.add(terrain);
    this._janitor.object3d(terrain);

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

  dispose() {
    this._skybox.dispose();
    this._janitor.mopUp();
  }
}
export default Scene;
