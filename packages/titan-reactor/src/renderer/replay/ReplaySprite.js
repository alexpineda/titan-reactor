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

  refresh(sprite, imagesBW) {
    const x = sprite.x / 32 - this.mapWidth / 2;
    const z = sprite.y / 32 - this.mapHeight / 2;
    const y = this.getTerrainY(x, z);

    this.renderOrder = sprite.order * 10;
    this._imageRenderOrder = this.renderOrder;

    this.position.set(x, y, z);

    this.images.forEach((image) => this.remove(image));

    for (let image of imagesBW.reverse(sprite.imageCount)) {
      // if (
      //   this.bwDat.images[image.id].drawFunction === drawFunctions.rleShadow
      // ) {
      //   continue;
      // }

      const titanImage =
        this._imagesById[image.id] || this.createImage(image.id, this);

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
