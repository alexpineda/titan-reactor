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
  }

  get sprites() {
    return Object.values(this._spritesByIndex);
  }

  refresh(spritesBw) {
    this._spritesThisFrame.length = 0;

    this.sprites.forEach(this.removeSprite);

    let order = 0;
    for (let spriteBw of spritesBw) {
      let sprite;
      if (this._spritesByIndex[spriteBw.index]) {
        sprite = this._spritesByIndex[spriteBw.index];
      } else {
        sprite = new ReplaySprite(
          this.bwDat,
          this.mapWidth,
          this.mapHeight,
          this.getTerrainY,
          this.createTitanImage
        );
        this._spritesByIndex[spriteBw.index] = sprite;
      }

      sprite.refresh(spriteBw, order++);
      this.addSprite(sprite);
      this._spritesThisFrame[spriteBw.index] = sprite;
    }

    // this._spritesLastFrame = [...this._spritesThisFrame];

    // for (const sprite of unusedSprites) {
    //   this.removeSprite(sprite);
    // }
  }
}

export default ReplaySprites;
