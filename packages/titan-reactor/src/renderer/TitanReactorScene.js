import { GridHelper, HemisphereLight, Scene } from "three";
import { disposeMeshes } from "./utils/dispose";
import { getTerrainY } from "../common/map/displacementGeometry";
import { fog, sunlight } from "./scene/lights";
import BackgroundTerrain from "./scene/BackgroundTerrain";
import generateTerrain from "./scene/generateTerrain";
import generateIcons from "./scene/generateIcons";
import readCascFile from "../common/utils/casclib";
import MouseCursor from "./scene/MouseCursor";

const displacementScale = 4;

export class TitanReactorScene extends Scene {
  constructor(chk) {
    super();
    this.chk = chk;
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

    const [
      terrain,
      terrainHD,
      displaceCanvas,
      creepUniform,
      creepEdgesUniform,
      minimapBitmap,
    ] = await generateTerrain(readCascFile, this.chk, {
      displacementScale,
    });

    const [
      gameIcons,
      cmdIcons,
      raceInsetIcons,
      workerIcons,
      arrowIcons,
      hoverIcons,
      dragIcons,
      wireframeIcons,
    ] = await generateIcons(readCascFile);

    this.gameIcons = gameIcons;
    this.cmdIcons = cmdIcons;
    this.raceInsetIcons = raceInsetIcons;
    this.workerIcons = workerIcons;
    this.creepUniform = creepUniform;
    this.creepEdgesUniform = creepEdgesUniform;
    this.minimapBitmap = minimapBitmap;
    this.cursor = new MouseCursor(
      arrowIcons.icons,
      hoverIcons.icons,
      dragIcons.icons
    );
    this.wireframeIcons = wireframeIcons;

    const bgTerrain = BackgroundTerrain(w, h, terrain.material.map);

    terrain.visible = false;
    this.add(terrain);
    this.add(terrainHD);
    this.terrain = terrainHD;

    // this.add(bgTerrain);
    this.terrainSD = terrain;
    this.terrainHD = terrainHD;

    this.fog = fog(w, h);
    this.background = this.fog.color;
    this.bgTerrain = bgTerrain;
    this.gridHelper = gridHelper;
    this.light = light;
    this.hemi = hemi;
    this.displaceImageData = displaceCanvas
      .getContext("2d")
      .getImageData(0, 0, displaceCanvas.width, displaceCanvas.height);
  }

  toggleElevation() {
    this.terrainSD.visible = !this.terrainSD.visible;
    this.terrainHD.visible = !this.terrainHD.visible;
  }

  getTerrainY() {
    return getTerrainY(
      this.displaceImageData,
      displacementScale,
      this.chk.size[0],
      this.chk.size[1]
    );
  }

  dispose() {
    disposeMeshes(this);
  }
}
