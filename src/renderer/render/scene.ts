import path from "path";
import {
  Color,
  CubeTextureLoader,
  DirectionalLight,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene as ThreeScene,
  Texture,
} from "three";

import { TerrainMesh, TerrainInfo, TerrainQuartile } from "common/types";
import Janitor from "@utils/janitor";
import { Layers } from "./layers";


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
  light.shadow.mapSize.width = 512 * 2;
  light.shadow.mapSize.height = 512 * 2;
  light.shadow.autoUpdate = false;
  light.shadow.needsUpdate = true;
  light.name = "sunlight";
  return light;
}

export class Scene extends ThreeScene {
  #mapWidth: number;
  #mapHeight: number;
  #janitor: Janitor;
  #skybox: Texture;
  #borderTiles: Group;

  hemilight: HemisphereLight;
  sunlight: DirectionalLight;

  //@ts-ignore
  userData: {
    terrain: TerrainMesh
  }

  constructor(
    mapWidth: number,
    mapHeight: number,
    {
      mesh: terrain,
    }: Pick<TerrainInfo, "mesh">) {
    super();
    this.#mapHeight = mapHeight;
    this.#mapWidth = mapWidth;

    this.#janitor = new Janitor();

    this.autoUpdate = false;

    this.hemilight = new HemisphereLight(0xffffff, 0xffffff, 1);
    this.sunlight = sunlight(this.#mapWidth, this.#mapHeight);

    this.hemilight.layers.enableAll();
    this.sunlight.layers.enableAll();
    this.hemilight.updateMatrixWorld();
    this.sunlight.updateMatrixWorld();

    this.add(this.hemilight);
    this.add(this.sunlight);
    this.addTerrain(terrain);
    terrain.updateMatrixWorld();

    this.#skybox = this.skybox("sparse");
    this.enableSkybox();

    this.#borderTiles = new Group();
    this.#borderTiles.layers.enable(Layers.Terrain);
    this.add(this.#borderTiles);

    // this.overrideMaterial = new MeshBasicMaterial({ color: "white" });

    const tx = terrain.userData.tilesX;
    const ty = terrain.userData.tilesY;
    const qw = terrain.userData.quartileWidth;
    const qh = terrain.userData.quartileHeight;

    const createMesh = (q: TerrainQuartile, edgeMaterial: Material) => {
      const mesh = new Mesh();
      mesh.geometry = q.geometry;
      mesh.material = edgeMaterial;
      mesh.position.copy(q.position);
      return mesh;
    }

    for (let i = 0; i < terrain.children.length; i++) {
      const q = terrain.children[i];
      const qx = q.userData.qx;
      const qy = q.userData.qy;

      const edgeMaterial = new MeshBasicMaterial({
        map: q.material.map,
        color: new Color(0x999999)
      });

      if (qx === 0 && qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === tx - 1 && qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === tx - 1 && qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qx === 0 && qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setY(-1);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

      if (qy === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y + qh);
        mesh.scale.setY(-1);
        this.#borderTiles.add(mesh);
      }
      if (qx === 0) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setX(mesh.position.x - qw);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }
      if (qy === ty - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setY(mesh.position.y - qh);
        mesh.scale.setY(-1);
        this.#borderTiles.add(mesh);
      }
      if (qx === tx - 1) {
        const mesh = createMesh(q, edgeMaterial);
        mesh.position.setX(mesh.position.x + qw);
        mesh.scale.setX(-1);
        this.#borderTiles.add(mesh);
      }

    }

    this.#borderTiles.rotation.x = -Math.PI / 2;
    this.#borderTiles.updateMatrixWorld();

  }

  setBorderTileOpacity(opacity: number) {
    this.#borderTiles.children.forEach((mesh) => {
      ((mesh as Mesh).material as MeshBasicMaterial).opacity = opacity;
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
    this.background = new Color(0x000000);
  }

  enableSkybox() {
    this.background = this.#skybox;
  }

  addTerrain(
    terrain: TerrainMesh
  ) {
    this.userData.terrain = terrain;
    this.add(terrain);
    this.#janitor.object3d(terrain);
  }

  replaceTerrain(
    terrain: TerrainMesh
  ) {
    this.remove(this.userData.terrain);
    this.addTerrain(terrain);
    this.#janitor.object3d(terrain);
  }

  get terrain() {
    return this.userData.terrain;
  }

  dispose() {
    this.#skybox.dispose();
    this.#janitor.mopUp();
  }
}
export default Scene;
