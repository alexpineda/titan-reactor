import SoundsBW from "./bw/SoundsBW";
import TilesBW from "./bw/TilesBW";
import UnitsBW from "./bw/UnitsBW";
import BWFrameScene from "./BWFrameScene";

export default class BWFrameSceneBuilder {
  constructor(scene, minimapScene, bwDat, pxToGameUnit, getTerrainY) {
    this.bwScene = new BWFrameScene(scene, 1);
    this.minimapBwScene = new BWFrameScene(minimapScene, 1);
    this.unitsBW = new UnitsBW(bwDat);
    this.tilesBW = new TilesBW();
    this.soundsBW = new SoundsBW(bwDat, pxToGameUnit, getTerrainY);
  }

  buildStart(nextFrame, updateMinimap) {
    this.nextFrame = nextFrame;
    this.updateMinimap = updateMinimap;
    this.bwScene.swap();
    if (updateMinimap) {
      this.minimapBwScene.swap();
    }
  }

  /**
   *
   * @param {ProjectedCameraView} view
   * @param {AudioMaster} audioMaster
   * @param {Number} elapsed
   */
  buildSounds(view, audioMaster, elapsed) {
    this.soundsBW.buffer = this.nextFrame.sounds;
    this.soundsBW.count = this.nextFrame.soundCount;

    for (let sound of this.soundsBW.items()) {
      const volume = sound.bwVolume(
        view.left,
        view.top,
        view.right,
        view.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        audioMaster.channels.queue(
          {
            ...sound.object(),
            volume,
            pan: sound.bwPan(view.left, view.width),
          },
          elapsed
        );
      }
    }
  }

  /**
   * @param {Units} units
   */
  buildUnitsAndMinimap(units) {
    this.unitsBW.buffer = this.nextFrame.units;
    this.unitsBW.count = this.nextFrame.unitCount;
    for (const minimapUnit of units.refresh(
      this.unitsBW,
      this.bwScene.units,
      this.bwScene.unitsBySpriteId
    )) {
      if (this.updateMinimap && minimapUnit) {
        this.minimapBwScene.add(minimapUnit);
      }
    }
  }

  /**
   * Prerequisite: buildUnitsAndMinimap() to populate unitsBySpriteId
   * @param {ReplaySprites} sprites
   * @param {ProjectedCameraView} view
   */
  buildSprites(sprites, view, delta) {
    for (const sprite of sprites.refresh(
      this.nextFrame,
      this.bwScene.unitsBySpriteId,
      this.bwScene.sprites,
      view.viewBW,
      delta
    )) {
      this.bwScene.add(sprite);
    }
  }

  buildFog(fogOfWar, playerVisionIds) {
    this.tilesBW.buffer = this.nextFrame.tiles;
    this.tilesBW.count = this.nextFrame.tilesCount;

    fogOfWar.generate(this.tilesBW, playerVisionIds);
  }
}
