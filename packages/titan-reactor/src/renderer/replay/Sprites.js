import ImagesBW from "./bw/ImagesBW";
import SpritesBW from "./bw/SpritesBW";
import Sprite from "./Sprite";

class Sprites {
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

  *refresh(frame, unitsBySpriteId, sprites, viewBW, delta) {
    this.spritesBW.buffer = frame.sprites;
    this.spritesBW.count = frame.spriteCount;

    //leave the full count since we're iterating through all sprite images
    this.imagesBW.buffer = frame.images;

    for (let spriteBW of this.spritesBW.items()) {
      if (
        spriteBW.x < viewBW.left ||
        spriteBW.y < viewBW.top ||
        spriteBW.x > viewBW.right ||
        spriteBW.y > viewBW.bottom
      ) {
        continue;
      }

      const sprite =
        sprites.get(spriteBW.index) ||
        new Sprite(
          this.bwDat,
          this.pxToGameUnit,
          this.getTerrainY,
          this.createTitanImage
        );

      sprite.clear();

      for (const image of sprite.refresh(
        spriteBW,
        this.imagesBW,
        unitsBySpriteId.get(spriteBW.index),
        this.playersById[spriteBW.owner],
        delta
      )) {
        sprite.add(image);
      }

      if (!sprites.has(spriteBW.index)) {
        sprites.set(spriteBW.index, sprite);
      }
      yield sprite;
    }
  }
}

export default Sprites;
