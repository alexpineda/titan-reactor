import { MathUtils, Object3D } from "three";

window.lamda = 0.01;

export default class Sprite extends Object3D {
  constructor(bwDat, pxToGameUnit, getTerrainY, createImage) {
    super();
    this.bwDat = bwDat;
    this.createImage = createImage;
    this._imagesById = {};
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.images = new Map();
  }

  *refresh(sprite, imagesBW, spriteUnit, player, delta) {
    this.renderOrder = sprite.order * 10;
    this._imageRenderOrder = this.renderOrder;

    const x = this.pxToGameUnit.x(sprite.x);
    const z = this.pxToGameUnit.y(sprite.y);
    let y = this.getTerrainY(x, z);

    if (spriteUnit && (spriteUnit.isFlying || spriteUnit.isFlyingBuilding)) {
      //@todo: get max terrain height + 1 for max
      //use a different step rather than 2? based on elevations?
      if (!this.initialized) {
        y = Math.min(6, y + 2);
      } else {
        y = MathUtils.damp(
          this.position.y,
          Math.min(6, y + 2),
          window.lamda,
          delta
        );
      }
    }
    this.initialized = true;

    this.position.set(x, y, z);

    for (let image of imagesBW.reverse(sprite.imageCount)) {
      if (image.hidden) continue;

      const titanImage =
        this.images.get(image.id) || this.createImage(image.id, this);
      if (!titanImage) continue;

      if (player) {
        titanImage.setTeamColor(player.threeColor);
      }
      //@todo optimize with redraw flag?
      titanImage.position.x = image.x / 32;
      titanImage.position.z = image.y / 32;

      titanImage.renderOrder = this._imageRenderOrder++;
      titanImage.setFrame(image.frameIndex, image.flipped);
      titanImage.visible = !image.hidden;

      if (spriteUnit && !image.isShadow) {
        titanImage.material.opacity = spriteUnit.cloaked ? 0.5 : 1;
      }

      if (!this.images.has(image.id)) {
        this.images.set(image.id, titanImage);
      }

      yield titanImage;
    }
  }
}
