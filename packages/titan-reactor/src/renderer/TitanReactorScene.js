import { GridHelper, HemisphereLight, Scene } from "three";
import { disposeMeshes } from "./utils/dispose";
import { getTerrainY } from "titan-reactor-shared/map/displacementGeometry";
import { fog, sunlight } from "./3d-map-rendering/lights";
import { backgroundTerrainMesh } from "./3d-map-rendering/meshes/backgroundTerrainMesh";
import Terrain from "./3d-map-rendering/Terrain2";
import readBwFile from "titan-reactor-shared/utils/readBwFile";

const displacementScale = 4;

export class TitanReactorScene extends Scene {
  constructor(chk, anisotropy) {
    super();
    this.chk = chk;
    this.anisotropy = anisotropy;
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

    const [terrain, terrainHD, displaceCanvas] = await terrainMesh.generate({
      displacementScale,
    });

    const bgTerrain = backgroundTerrainMesh(w, h, terrain.material.map);

    terrain.visible = false;
    this.add(terrain);
    this.add(terrainHD);
    // this.add(bgTerrain);

    this.fog = fog(w, h);
    this.background = this.fog.color;

    this.terrain = terrain;
    this.terrainHD = terrainHD;
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
