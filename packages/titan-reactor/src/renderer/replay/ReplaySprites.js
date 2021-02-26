import ImagesBW from "./bw/ImagesBW";
import SpritesBW from "./bw/SpritesBW";
import ReplaySprite from "./ReplaySprite";

class ReplaySprites {
  constructor(bwDat, pxToGameUnit, getTerrainY, createTitanImage, playersById) {
    this._spritesByIndex = {};
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.createTitanImage = createTitanImage;
    this.playersById = playersById;

    this.spritesBW = new SpritesBW(bwDat);
    this.imagesBW = new ImagesBW(bwDat);
  }

  *refresh(frame, unitsBySpriteId, sprites, images, { viewBW }) {
    this.spritesBW.buffer = frame.sprites;
    this.spritesBW.count = frame.spriteCount;

    this.imagesBW.buffer = frame.images;

    for (let sprite of this.spritesBW.items()) {
      if (
        sprite.x < viewBW.left ||
        sprite.y < viewBW.top ||
        sprite.x > viewBW.right ||
        sprite.y > viewBW.bottom
      ) {
        continue;
      }

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
        this.playersById[sprite.owner]
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
