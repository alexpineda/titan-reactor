import { Object3D } from "three";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import ImagesBW from "./bw/ImagesBW";

export default class ReplaySprite extends Object3D {
  constructor(bwDat, mapWidth, mapHeight, getTerrainY, createImage) {
    super();
    this.bwDat = bwDat;
    this.createImage = createImage;
    this._imagesById = {};
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.getTerrainY = getTerrainY;

    this._imagesThisFrame = [];
    this._imagesLastFrame = [];
  }

  get images() {
    return Object.values(this._imagesById);
  }

  refresh(spritesBW, imagesBW) {
    const x = spritesBW.x / 32 - this.mapWidth / 2;
    const z = spritesBW.y / 32 - this.mapHeight / 2;
    const y = this.getTerrainY(x, z);

    this.renderOrder = spritesBW.order * 10;
    this._imageRenderOrder = this.renderOrder;

    this.position.set(x, y, z);

    this.images.forEach((image) => this.remove(image));

    for (let imageId of imagesBW.reverse(spritesBW.numImages)) {
      if (this.bwDat.images[imageId].drawFunction === drawFunctions.rleShadow) {
        continue;
      }

      const titanImage =
        this._imagesById[imageId] || this.createImage(imageId, this);

      titanImage.userData.bwIndex = imagesBW.index;

      //@todo optimize with redraw flag?
      const x = imagesBW.x / 32;
      const y = imagesBW.y / 32;

      titanImage.position.set(x, 0, y);
      titanImage.renderOrder = this._imageRenderOrder++;
      titanImage.setFrame(imagesBW.frameIndex, imagesBW.flipped);
      titanImage.visible = !imagesBW.hidden;
      this._imagesById[imageId] = titanImage;
      this.add(titanImage);
    }

    this._imagesLastFrame = { ...this._imagesById };
  }
}
