import ImagesBW from "./bw/ImagesBW";
import SpritesBW from "./bw/SpritesBW";
import ReplaySprite from "./ReplaySprite";

class ReplaySprites {
  constructor(
    bwDat,
    mapWidth,
    mapHeight,
    getTerrainY,
    createTitanImage,
    addSprite,
    removeSprite
  ) {
    this._spritesByIndex = {};
    this.bwDat = bwDat;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.getTerrainY = getTerrainY;
    this.createTitanImage = createTitanImage;
    this.addSprite = addSprite;
    this.removeSprite = removeSprite;

    this._spritesThisFrame = [];
    this._spritesLastFrame = [];

    this.spritesBW = new SpritesBW();
    this.imagesBW = new ImagesBW();
  }

  get sprites() {
    return Object.values(this._spritesByIndex);
  }

  refresh(frame) {
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
          this.mapWidth,
          this.mapHeight,
          this.getTerrainY,
          this.createTitanImage
        );
        this._spritesByIndex[sprite.index] = replaySprite;
      }

      replaySprite.refresh(sprite, this.imagesBW);
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
