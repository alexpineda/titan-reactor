import SoundsBW from "./bw/SoundsBW";
import BWFrameScene from "./BWFrameScene";

export default class BWFrameBuilder {
  constructor(scene, minimapScene) {
    this.bwScene = new BWFrameScene(scene, 1);
    this.minimapBwScene = new BWFrameScene(minimapScene, 1);
  }

  buildStart(nextFrame, updateMinimap) {
    this.nextFrame = nextFrame;
    this.updateMinimap = updateMinimap;
    this.bwScene.swap();
    if (updateMinimap) {
      this.minimapBwScene.swap();
    }
  }

  buildSounds(soundsBW, view, audio) {
    for (let sound of soundsBW.items()) {
      const volume = sound.bwVolume(
        view.left,
        view.top,
        view.right,
        view.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        const channel = audio.get(
          sound.object,
          volume,
          sound.bwPanX(view.left, view.width),
          sound.mapY,
          sound.bwPanY(view.top, view.height)
          // 100,
          // sound.mapX,
          // sound.mapY,
          // sound.mapZ
        );
        if (channel) {
          this.bwScene.add(channel);
        }
      }
    }
  }

  buildUnitsAndMinimap(unitsBW, units) {
    unitsBW.buffer = this.nextFrame.units;
    unitsBW.count = this.nextFrame.unitCount;
    for (const minimapUnit of units.refresh(
      unitsBW,
      this.bwScene.units,
      this.bwScene.unitsBySpriteId
    )) {
      if (this.updateMinimap && minimapUnit) {
        this.minimapBwScene.add(minimapUnit);
      }
    }
  }

  buildSprites(sprites, view) {
    for (const sprite of sprites.refresh(
      this.nextFrame,
      this.bwScene.unitsBySpriteId,
      this.bwScene.sprites,
      this.bwScene.images,
      view
    )) {
      this.bwScene.add(sprite);
    }
  }

  buildFog(tilesBW, fogOfWar, playerVisionIds) {
    tilesBW.buffer = this.nextFrame.tiles;
    tilesBW.count = this.nextFrame.tilesCount;

    fogOfWar.generate(
      this.nextFrame.frame,
      tilesBW,
      players.filter((p) => p.vision).map(({ id }) => id)
    );
  }
}
