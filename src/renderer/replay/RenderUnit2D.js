import { DefaultLoadingManager, Group } from "three";
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
    if (!this.loadSprite.loaded) {
      throw new Error("sprites must be preloaded");
    }
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
    const mesh = this.loadSprite.getMesh(
      this.bwDat.units[typeId].flingy.sprite.image.index
    );
    unit.userData.unitMesh = mesh;
    unit.add(mesh);
    return unit;
  }

  replace(unit, typeId) {
    unit.children.remove(unit.userData.unitMesh);
    return this.load(typeId, unit);
  }

  update(unit) {
    const { userData } = unit;
    if (
      userData.runner.state.frame &&
      userData.runner.state.frame === userData.runner.state.prevFrame
    ) {
      return;
    }

    this.loadSprite.setFrame(
      unit.userData.unitMesh,
      userData.runner.state.image.index,
      userData.runner.state.frame,
      userData.runner.state.flipFrame
    );

    //temp
    // userData.runner.state.prevFrame = userData.runner.state.frame;

    // @todo render children

    const mesh = unit.userData.unitMesh;
    mesh.material.opacity = this.bwDat.units[userData.typeId].permanentCloak()
      ? 0.6
      : 1;
  }
}
