import { DefaultLoadingManager } from "three";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { DebugLog } from "utils/DebugLog";

export class ImageSD {
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
    this.logger = new DebugLog("image-sd");

    if (!this.loadSprite.loaded) {
      throw new Error("sprites must be preloaded");
    }
  }

  useUnitPalette(unitType) {
    switch (unitType) {
      case unitTypes.startLocation:
      case unitTypes.mineral1:
      case unitTypes.mineral2:
      case unitTypes.mineral3:
      case unitTypes.ragnasaur:
      case unitTypes.rhynadon:
      case unitTypes.bengalaas:
      case unitTypes.scantid:
      case unitTypes.ursadon:
      case unitTypes.kakaru:
        return false;
      default:
        return true;
    }
  }

  _load(image) {
    return this.loadSprite.getMesh(image);
  }

  instance(runner, parent, image) {
    const mesh = this._load(image);
    mesh.position.x = runner.state.offset.x;
    mesh.position.y = runner.state.offset.y;
    parent.add(mesh);

    return {
      add: (child, p = mesh) => p.add(child),
      assign: (obj) => this.logger.assign(obj),
      update: () => {
        this.update(mesh, runner);
      },
      remove: () => parent.remove(mesh),
    };
  }

  update(mesh, runner) {
    if (runner.frameHasChanged()) {
      this.logger.log(
        `frame i${runner.image.index} f${runner.state.frame} V${runner.state.flipFrame}`
      );

      this.loadSprite.setFrame(
        mesh,
        runner.image.index,
        runner.state.frame,
        runner.state.flipFrame
      );
    }
  }
}
