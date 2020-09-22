import {
  DefaultLoadingManager,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  SpriteMaterial,
  Vector3,
} from "three";
import { LoadSprite } from "../utils/meshes/LoadSprites";

export class RenderUnit2D {
  constructor(
    bwDat,
    bwDataPath,
    tileset,
    fileAccess,
    loadingManager = DefaultLoadingManager
  ) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.loadingManager = loadingManager;
    //@todo refactor this, move one level up
    this.loadSprite = new LoadSprite(tileset, fileAccess, loadingManager);
    this.tileset = tileset;

    this.prefabs = {
      999: () => this.loadSprite.loadSync(`_alex/marine.bmp`),
    };
  }

  _unitPath(file) {
    return `${this.bwDataPath}/unit/${file}`;
  }

  load(typeId) {
    const prefab = this.prefabs[typeId] || this.prefabs[999];
    const mesh = prefab();
    mesh.material.transparent = this.bwDat.units[typeId].cloakable();
    return mesh;
  }

  //@todo just push in userData
  async update(unit) {
    const { userData } = unit;
    if (userData.runner.state.frame === userData.runner.state.prevFrame) {
      return;
    }
    console.log("grp", userData.runner.state.image.grpFile);
    const { map, w, h } = await this.loadSprite.getFrame(
      this._unitPath(userData.runner.state.image.grpFile),
      userData.runner.state.frame,
      userData.runner.state.image.remapping
    );

    //@todo remove once implemented in runner
    userData.runner.state.prevFrame = userData.runner.state.frame;

    unit.material.dispose();
    //todo refactor, should be in LoadSprites
    unit.material = new SpriteMaterial({ map });
    unit.material.transparent = true;
    unit.material.opacity = this.bwDat.units[userData.typeId].permanentCloak()
      ? 0.6
      : 1;
    const scale = new Vector3(w / 32, h / 32, 1);
    unit.scale.copy(scale);
    // unit.material.needsUpdate = true;
  }

  loadAssets() {}
}
