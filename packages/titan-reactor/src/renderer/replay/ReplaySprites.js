import ImagesBW from "./bw/ImagesBW";
import SpritesBW from "./bw/SpritesBW";
import ReplaySprite from "./ReplaySprite";

class ReplaySprites {
  constructor(
    bwDat,
    pxToGameUnit,
    getTerrainY,
    createTitanImage,
    addSprite,
    removeSprite
  ) {
    this._spritesByIndex = {};
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.createTitanImage = createTitanImage;
    this.addSprite = addSprite;
    this.removeSprite = removeSprite;

    this.spritesBW = new SpritesBW(bwDat);
    this.imagesBW = new ImagesBW(bwDat);
  }

  *refresh(frame, unitsBySpriteId, sprites, images) {
    this.spritesBW.buffer = frame.sprites;
    this.spritesBW.count = frame.spriteCount;

    this.imagesBW.buffer = frame.images;

    for (let sprite of this.spritesBW.items()) {
      let replaySprite;

      replaySprite =
        sprites.get(sprite.index) ||
        new ReplaySprite(
          this.bwDat,
          this.pxToGameUnit,
          this.getTerrainY,
          this.createTitanImage
        );

      replaySprite.clear();

      for (const image of replaySprite.refresh(
        sprite,
        this.imagesBW,
        unitsBySpriteId.get(sprite.index),
        images
      )) {
        replaySprite.add(image);
      }

      if (!sprites.has(sprite.index)) {
        sprites.set(sprite.index, replaySprite);
      }
      yield replaySprite;
    }
  }
}

export default ReplaySprites;
