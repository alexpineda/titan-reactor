import { DefaultLoadingManager, Group } from "three";
import { unitTypeIdByName } from "../../common/bwdat/unitTypes";

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
      case unitTypeIdByName.startLocation:
      case unitTypeIdByName.mineral1:
      case unitTypeIdByName.mineral2:
      case unitTypeIdByName.mineral3:
      case unitTypeIdByName.ragnasaur:
      case unitTypeIdByName.rhynadon:
      case unitTypeIdByName.bengalaas:
      case unitTypeIdByName.scantid:
      case unitTypeIdByName.ursadon:
      case unitTypeIdByName.kakaru:
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
    unit.remove(unit.userData.unitMesh);
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
      unit,
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
