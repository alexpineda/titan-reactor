import { GridHelper, HemisphereLight, Scene } from "three";
import { disposeMeshes } from "./utils/dispose";
import { getTerrainY } from "../common/map/displacementGeometry";
import { fog, sunlight } from "./scene/lights";
import BackgroundTerrain from "./scene/BackgroundTerrain";
import loadTileSetFiles from "../common/map/loadTileSetFiles";
import readCascFile from "../common/utils/casclib";
import generateMaterialsAndMeshes from "../common/map/generateMaterialsAndMeshes";
import generateTextures from "../common/map/generateTextures";

const DEFAULT_GEOM_OPTIONS = {
  //low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
  elevationLevels: [0, 0.05, 0.25, 0.25, 0.4, 0.4, 0.25],
  ignoreLevels: [0, 1, 0, 1, 0, 1, 0],
  normalizeLevels: true,
  displaceDimensionScale: 16,
  displaceVertexScale: 2,
  blendNonWalkableBase: true,
  firstPass: true,
  secondPass: true,
  processWater: true,
  displacementScale: 4,
  drawMode: { value: 1 },
  detailsMix: 0.05,
  bumpScale: 0.1,
  firstBlur: 4,
};

export default class TitanReactorScene extends Scene {
  constructor(chk) {
    super();
    this.chk = chk;
  }

  async build() {
    const [w, h] = this.chk.size;

    // load all the tile files we need
    const tileFilesData = await loadTileSetFiles(readCascFile, this.chk);

    // interpret them and create intermediate bitmaps and textures
    const mapData = await generateTextures(w, h, tileFilesData);

    // compile bitmaps and textures into shader programs, materials and meshes
    const [
      terrainSD,
      terrainHD,
      displaceCanvas,
      creepUniform,
      creepEdgesUniform,
      minimapBitmap,
    ] = await generateMaterialsAndMeshes(mapData, DEFAULT_GEOM_OPTIONS);

    this.creepUniform = creepUniform;
    this.creepEdgesUniform = creepEdgesUniform;
    this.minimapBitmap = minimapBitmap;
    this.displaceImageData = displaceCanvas
      .getContext("2d")
      .getImageData(0, 0, displaceCanvas.width, displaceCanvas.height);

    terrainSD.visible = false;
    this.add(terrainSD);
    this.add(terrainHD);
    this.terrain = this.terrainHD = terrainHD;
    this.terrainSD = terrainSD;

    this.fog = fog(w, h);
    this.background = this.fog.color;
    this.bgTerrain = BackgroundTerrain(w, h, terrainSD.material.map);
    // this.add(this.bgTerrain);

    const gridHelper = new GridHelper(128, 128, 0xff0000, 0x009900);
    gridHelper.position.set(0, 6, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    gridHelper.visible = false;
    gridHelper.matrixAutoUpdate = false;
    gridHelper.updateMatrix();
    this.add(gridHelper);

    const light = sunlight(w, h);
    this.add(light);

    const hemi = new HemisphereLight(0xffffff, 0xffffff, 5);
    this.add(hemi);

    this.gridHelper = gridHelper;
    this.light = light;
    this.hemi = hemi;
  }

  toggleElevation() {
    this.terrainSD.visible = !this.terrainSD.visible;
    this.terrainHD.visible = !this.terrainHD.visible;
  }

  getTerrainY() {
    return getTerrainY(
      this.displaceImageData,
      DEFAULT_GEOM_OPTIONS.displacementScale,
      this.chk.size[0],
      this.chk.size[1]
    );
  }

  dispose() {
    disposeMeshes(this);
  }
}
