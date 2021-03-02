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
    const z = this.pxToGameUnit.y(spriteBW.y);
    let y = this.getTerrainY(x, z);

    if (spriteUnit && (spriteUnit.isFlying || spriteUnit.isFlyingBuilding)) {
      //@todo: get max terrain height + 1 for max
      //use a different step rather than 2? based on elevations?
      if (!this.initialized) {
        y = Math.min(6, y + 3);
      } else {
        y = MathUtils.damp(
          this.position.y,
          Math.min(6, y + 3),
          window.lamda,
          delta
        );
      }
    }
    this.initialized = true;

    this.position.set(x, y, z);
    this.userData.spriteUnit = spriteUnit;
    this.userData.tileX = Math.floor(spriteBW.x / 32);
    this.userData.tileY = Math.floor(spriteBW.y / 32);
    this.userData.clickable = false;
    this.userData.isDoodad = false;
    if (spriteUnit) {
      spriteUnit.clickable = false;
    }

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

      if (image.index === spriteBW.mainImageIndex) {
        this.userData.clickable = image.imageType.clickable;
      }

      if (image.imageType.iscript === 336 || image.imageType.iscript === 337) {
        this.userData.isDoodad = true;
      }

      if (spriteUnit) {
        //@todo move this to material
        if (!image.isShadow) {
          titanImage.material.opacity = spriteUnit.cloaked ? 0.5 : 1;
        }

        if (spriteBW.mainImageIndex === image.index) {
          titanImage.setWarpingIn(spriteUnit.warpingIn);
        }

        spriteUnit.clickable = this.userData.clickable;
      }

      if (!this.images.has(image.id)) {
        this.images.set(image.id, titanImage);
      }

      yield titanImage;
    }
  }
}
