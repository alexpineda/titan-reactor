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

    this._spritesThisFrame = [];
    this._spritesLastFrame = [];

    this.spritesBW = new SpritesBW(bwDat);
    this.imagesBW = new ImagesBW(bwDat);
  }

  get sprites() {
    return Object.values(this._spritesByIndex);
  }

  refresh(frame, spriteUnits) {
    this._spritesThisFrame.length = 0;

    this.sprites.forEach(this.removeSprite);

    this.spritesBW.buffer = frame.sprites;
    this.spritesBW.count = frame.spriteCount;

    this.imagesBW.buffer = frame.images;

    for (let sprite of this.spritesBW.items()) {
      let replaySprite;
      if (this._spritesByIndex[sprite.index]) {
        replaySprite = this._spritesByIndex[sprite.index];
      } else {
        replaySprite = new ReplaySprite(
          this.bwDat,
          this.pxToGameUnit,
          this.getTerrainY,
          this.createTitanImage
        );
        this._spritesByIndex[sprite.index] = replaySprite;
      }

      replaySprite.refresh(sprite, this.imagesBW, spriteUnits[sprite.index]);
      this.addSprite(replaySprite);
      this._spritesThisFrame[sprite.index] = replaySprite;
    }

    // this._spritesLastFrame = [...this._spritesThisFrame];

    // for (const sprite of unusedSprites) {
    //   this.removeSprite(sprite);
    // }
  }
}

export default ReplaySprites;
