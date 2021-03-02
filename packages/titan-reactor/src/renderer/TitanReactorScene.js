import { GridHelper, HemisphereLight, Scene } from "three";
import { disposeMeshes } from "./utils/dispose";
import { getTerrainY } from "titan-reactor-shared/map/displacementGeometry";
import { fog, sunlight } from "./terrain/lights";
import Background from "./terrain/Background";
import Terrain from "./terrain/Terrain";
import readBwFile from "titan-reactor-shared/utils/readBwFile";
import { RenderMode } from "common/settings";

const displacementScale = 4;

export class TitanReactorScene extends Scene {
  constructor(chk, anisotropy, renderMode) {
    super();
    this.chk = chk;
    this.anisotropy = anisotropy;
    this.renderMode = renderMode;
  }

  async init() {
    const [w, h] = this.chk.size;

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

    const terrainMesh = new Terrain(
      readBwFile,
      this.chk,
      this.textureCache,
      this.anisotropy
    );

    const [
      terrain,
      terrainHD,
      displaceCanvas,
      creepUniform,
    ] = await terrainMesh.generate({
      displacementScale,
    });

    this.creepUniform = creepUniform;

    const bgTerrain = Background(w, h, terrain.material.map);

    if (this.renderMode === RenderMode.SD) {
      this.add(terrain);
      this.terrain = terrain;
    } else {
      this.add(terrainHD);
      this.terrain = terrainHD;
    }

    // this.add(bgTerrain);
    this.terrainSD = terrain;
    this.terrainHD = terrainHD;

    this.fog = fog(w, h);
    this.background = this.fog.color;
    this.bgTerrain = bgTerrain;
    this.gridHelper = gridHelper;
    this.light = light;
    this.hemi = hemi;
    this.displaceCanvas = displaceCanvas;
  }

  getTerrainY() {
    return getTerrainY(
      this.displaceCanvas
        .getContext("2d")
        .getImageData(
          0,
          0,
          this.displaceCanvas.width,
          this.displaceCanvas.height
        ),
      displacementScale,
      this.chk.size[0],
      this.chk.size[1]
    );
  }

  dispose() {
    disposeMeshes(this);
  }
}
