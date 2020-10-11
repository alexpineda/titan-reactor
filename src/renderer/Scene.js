import { GridHelper, HemisphereLight, Scene } from "three";
import { disposeMeshes } from "./utils/dispose";
import { getTerrainY } from "./3d-map-rendering/displacementGeometry";
import { fog, sunlight } from "./3d-map-rendering/lights";
import { backgroundTerrainMesh } from "./3d-map-rendering/meshes/backgroundTerrainMesh";
import { Terrain } from "./3d-map-rendering/Terrain";
import { bgMapCanvasTexture } from "./3d-map-rendering/textures/bgMapCanvasTexture";

export class TitanReactorScene extends Scene {
  constructor(chk, textureCache) {
    super();
    this.chk = chk;
    this.textureCache = textureCache;
  }

  async init() {
    const [w, h] = this.chk.size;

    const gridHelper = new GridHelper(128, 128, 0xff0000, 0x009900);
    gridHelper.position.set(0, 6, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    gridHelper.visible = false;
    this.add(gridHelper);

    const light = sunlight(w, h);
    this.add(light);

    const hemi = new HemisphereLight(0xffffff, 0xffffff, 5);
    this.add(hemi);

    const terrainMesh = new Terrain(this.chk, this.textureCache);
    const terrain = await terrainMesh.generate();
    const bg = await bgMapCanvasTexture(this.chk);
    const bgTerrain = backgroundTerrainMesh(w, h, bg);

    this.add(terrain);
    // @todo fix sprite black box issue
    this.add(bgTerrain);

    this.fog = fog(w, h);
    this.background = this.fog.color;

    this.terrain = terrain;
    this.bgTerrain = bgTerrain;
    this.gridHelper = gridHelper;
    this.light = light;
    this.hemi = hemi;
  }

  getTerrainY() {
    return getTerrainY(
      this.terrain.userData.displacementMap.image
        .getContext("2d")
        .getImageData(
          0,
          0,
          this.terrain.userData.displacementMap.image.width,
          this.terrain.userData.displacementMap.image.height
        ),
      this.terrain.userData.displacementScale,
      this.chk.size[0],
      this.chk.size[1]
    );
  }

  dispose() {
    disposeMeshes(this);
  }
}
