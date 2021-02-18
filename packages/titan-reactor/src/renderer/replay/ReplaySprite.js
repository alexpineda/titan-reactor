import { Object3D } from "three";

export default class ReplaySprite extends Object3D {
  constructor(bwDat, pxToGameUnit, getTerrainY, createImage) {
    super();
    this.bwDat = bwDat;
    this.createImage = createImage;
    this._imagesById = {};
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;

    this._imagesThisFrame = [];
    this._imagesLastFrame = [];
  }

  get images() {
    return Object.values(this._imagesById);
  }

  refresh(sprite, imagesBW, spriteUnit) {
    this.renderOrder = sprite.order * 10;
    this._imageRenderOrder = this.renderOrder;

    const x = this.pxToGameUnit.x(sprite.x);
    const z = this.pxToGameUnit.y(sprite.y);
    let y = this.getTerrainY(x, z);

    if (spriteUnit && spriteUnit.flying) {
      y = 5;
    }
    this.position.set(x, y, z);

    this.images.forEach((image) => this.remove(image));

    for (let image of imagesBW.reverse(sprite.imageCount)) {
      const titanImage =
        this._imagesById[image.id] || this.createImage(image.id, this);
      if (!titanImage) continue;

      titanImage.userData.bwIndex = image.index;

      //@todo optimize with redraw flag?
      const x = image.x / 32;
      const y = image.y / 32;

      titanImage.position.set(x, 0, y);
      titanImage.renderOrder = this._imageRenderOrder++;
      titanImage.setFrame(image.frameIndex, image.flipped);
      titanImage.visible = !image.hidden;
      this._imagesById[image.id] = titanImage;
      this.add(titanImage);
    }

    this._imagesLastFrame = { ...this._imagesById };
  }
}
