import { MathUtils, Object3D } from "three";

window.lamda = 0.005;

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

  *refresh(spriteBW, imagesBW, spriteUnit, player, delta) {
    this.renderOrder = spriteBW.order * 10;
    this._imageRenderOrder = this.renderOrder;

    const x = this.pxToGameUnit.x(spriteBW.x);
    let z = this.pxToGameUnit.y(spriteBW.y);
    let y = this.getTerrainY(x, z);

    if (spriteUnit && (spriteUnit.isFlying || spriteUnit.isFlyingBuilding)) {
      //@todo: get max terrain height + 1 for max
      //use a different step rather than 2? based on elevations?

      // undo the y offset for floating building since we manage that ourselves
      // if (spriteUnit.isFlyingBuilding && spriteUnit.isFlying) {
      //   z = z - 42 / 32;
      // }

      const targetY = spriteUnit.isFlying ? Math.min(6, y + 4) : y;
      if (!this.initialized) {
        y = targetY;
      } else {
        y = MathUtils.damp(this.position.y, targetY, window.lamda, delta);
      }
    }
    this.initialized = true;

    this.position.set(x, y, z);
    this.userData.spriteUnit = spriteUnit;
    this.userData.tileX = spriteBW.tileX;
    this.userData.tileY = spriteBW.tileY;
    this.userData.isDoodad = false;

    for (let image of imagesBW.reverse(spriteBW.imageCount)) {
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

      if (image.imageType.iscript === 336 || image.imageType.iscript === 337) {
        this.userData.isDoodad = true;
      }

      if (spriteUnit) {
        //@todo move this to material
        if (!image.isShadow) {
          titanImage.material.opacity = spriteUnit.isCloaked ? 0.5 : 1;
        }

        if (spriteBW.mainImageIndex === image.index) {
          titanImage.setWarpingIn(spriteUnit.warpingIn);
        }
      }

      if (!this.images.has(image.id)) {
        this.images.set(image.id, titanImage);
      }

      yield titanImage;
    }
  }
}
