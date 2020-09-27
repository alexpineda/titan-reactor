import { DefaultLoadingManager, Group, SpriteMaterial, Vector3 } from "three";
import { units } from "../../common/bwdat/units";

export class RenderUnit2D {
  constructor(
    bwDat,
    bwDataPath,
    loadSprite,
    loadingManager = DefaultLoadingManager
  ) {
    this.bwDat = bwDat;
    this.bwDataPath = bwDataPath;
    this.loadingManager = loadingManager;
    this.loadSprite = loadSprite;

    this.prefabs = {
      999: () => this.loadSprite.loadSync(`_alex/marine.bmp`),
    };
  }

  _unitPath(file) {
    return `${this.bwDataPath}/unit/${file}`;
  }

  useUnitPalette(unitType) {
    switch (unitType) {
      case units.startLocation:
      case units.mineral1:
      case units.mineral2:
      case units.mineral3:
      case units.ragnasaur:
      case units.rhynadon:
      case units.bengalaas:
      case units.scantid:
      case units.ursadon:
      case units.kakaru:
        return false;
      default:
        return true;
    }
  }

  load(typeId, unit = new Group()) {
    const prefab = this.prefabs[typeId] || this.prefabs[999];
    const mesh = prefab();
    mesh.material.transparent = this.bwDat.units[typeId].cloakable();
    unit.userData.unitMesh = mesh;
    unit.add(mesh);
    return unit;
  }

  replace(unit, typeId) {
    unit.children.remove(unit.userData.unitMesh);
    return this.load(typeId, unit);
  }

  async update(unit) {
    const { userData } = unit;
    if (userData.runner.state.frame === userData.runner.state.prevFrame) {
      return;
    }

    if (window.dbg && window.dbg.repId === userData.repId) {
      console.log("grp", userData.runner.state.image.grpFile);
    }

    const { map, w, h } = await this.loadSprite.getFrame(
      this._unitPath(userData.runner.state.image.grpFile),
      userData.runner.state.frame,
      userData.runner.state.flipFrame,
      userData.runner.state.image.remapping
    );

    // @todo render children

    const mesh = unit.userData.unitMesh;

    mesh.material.dispose();
    //todo refactor, should be in LoadSprites
    mesh.material = new SpriteMaterial({ map });
    mesh.material.transparent = true;
    mesh.material.opacity = this.bwDat.units[userData.typeId].permanentCloak()
      ? 0.6
      : 1;
    const scale = new Vector3(w / 32, h / 32, 1);
    mesh.scale.copy(scale);
    // unit.material.needsUpdate = true;
  }

  loadAssets() {}
}
