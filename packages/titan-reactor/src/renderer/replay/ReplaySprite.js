import { Object3D } from "three";

export default class ReplaySprite extends Object3D {
  constructor(bwDat, pxToGameUnit, getTerrainY, createImage) {
    super();
    this.bwDat = bwDat;
    this.createImage = createImage;
    this._imagesById = {};
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
    this.images = new Map();
  }

  *refresh(sprite, imagesBW, spriteUnit) {
    this.renderOrder = sprite.order * 10;
    this._imageRenderOrder = this.renderOrder;

    const x = this.pxToGameUnit.x(sprite.x);
    const z = this.pxToGameUnit.y(sprite.y);
    let y = this.getTerrainY(x, z);

    if (spriteUnit && spriteUnit.flying) {
      y = 5;
    }
    this.position.set(x, y, z);

    for (let image of imagesBW.reverse(sprite.imageCount)) {
      if (image.hidden) continue;

      const titanImage =
        this.images.get(image.id) || this.createImage(image.id, this);
      if (!titanImage) continue;

      //@todo optimize with redraw flag?
      const x = image.x / 32;
      const y = image.y / 32;

      titanImage.position.set(x, 0, y);
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
