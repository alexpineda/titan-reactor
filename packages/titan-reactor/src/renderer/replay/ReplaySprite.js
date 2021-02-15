import { Object3D } from "three";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import ImagesBW from "./bw/ImageBW";

export default class ReplaySprite extends Object3D {
  constructor(bwDat, mapWidth, mapHeight, getTerrainY, createImage) {
    super();
    this.bwDat = bwDat;
    this.createImage = createImage;
    this._imagesByIndex = {};
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.getTerrainY = getTerrainY;

    this._imagesThisFrame = [];
    this._imagesLastFrame = [];
  }

  get images() {
    return Object.values(this._imagesByIndex);
  }

  refresh(spriteBw, order) {
    const x = spriteBw.x / 32 - this.mapWidth / 2;
    const z = spriteBw.y / 32 - this.mapHeight / 2;
    const y = this.getTerrainY(x, z);

    this.renderOrder = order * 10;
    this._imageRenderOrder = this.renderOrder;

    this.position.set(x, y, z);

    this.spriteBw = spriteBw;

    this.images.forEach((image) => this.remove(image));

    for (let imageBw of spriteBw.images.reverse()) {
      if (
        this.bwDat.images[imageBw.id].drawFunction === drawFunctions.rleShadow
      ) {
        continue;
      }

      const titanImage =
        this._imagesByIndex[imageBw.id] || this.createImage(imageBw.id, this);

      titanImage.userData.bwIndex = imageBw.index;

      //@todo optimize with redraw flag?
      const x = imageBw.x / 32;
      const y = imageBw.y / 32;

      titanImage.position.set(x, 0, y);
      titanImage.renderOrder = this._imageRenderOrder++;
      titanImage.setFrame(imageBw.frameIndex, ImagesBW.flipped(imageBw));
      this._imagesByIndex[imageBw.id] = titanImage;
      this.add(titanImage);
    }

    this._imagesLastFrame = { ...this._imagesByIndex };
  }
}
