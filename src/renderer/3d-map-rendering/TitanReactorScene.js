import { GridHelper, HemisphereLight, Scene } from "three";
import { getTerrainY } from "./displacementGeometry";
import { fog, sunlight } from "./lights";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { Terrain } from "./Terrain";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";

export class TitanReactorScene {
  constructor(chk, textureCache) {
    this.chk = chk;
    this.textureCache = textureCache;
  }

  async init(scene) {
    const [w, h] = this.chk.size;

    const gridHelper = new GridHelper(128, 128, 0xff0000, 0x009900);
    gridHelper.position.set(0, 6, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    gridHelper.visible = false;
    scene.add(gridHelper);

    const light = sunlight(w, h);
    scene.add(light);

    const hemi = new HemisphereLight(0xffffff, 0xffffff, 5);
    scene.add(hemi);

    const terrainMesh = new Terrain(this.chk, this.textureCache);
    const terrain = await terrainMesh.generate();
    const bg = await bgMapCanvasTexture(this.chk);
    const bgTerrain = backgroundTerrainMesh(w, h, bg);

    scene.add(terrain);
    // @todo fix sprite black box issue
    scene.add(bgTerrain);

    scene.fog = fog(w, h);
    scene.background = scene.fog.color;
    this.terrain = terrain;
    this.gridHelper = gridHelper;
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
}
