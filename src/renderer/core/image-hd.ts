import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InterleavedBufferAttribute,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  SubtractiveBlending,
  Vector3,
} from "three";

import { drawFunctions } from "../../common/enums";
import { ImageDAT, AnimFrame, Atlas } from "../../common/types";
import { Image } from ".";
import TeamSpriteMaterial from "./team-sprite-material";
import gameStore from "@stores/game-store";
import { Unit } from "./unit";

export const DepthMode = {
  Ordered: 0, // for top down views
  Depth: 1, // for angled views
};

const white = new Color(0xffffff);
const CLOAK_OPACITY = 0.6;

/**
 * An image instance that uses HD assets
 */
export class ImageHD extends Mesh<BufferGeometry, MeshBasicMaterial> implements Image {
  static useDepth = false;
  static useScale = 1;

  readonly originalScale = new Vector3();

  private atlas: Atlas;
  private uv: BufferAttribute | InterleavedBufferAttribute;
  private pos: BufferAttribute | InterleavedBufferAttribute;
  private lastSetFrame?: AnimFrame;
  private lastFlipFrame?: boolean;

  frame = 0;
  flip = false;

  dat: ImageDAT;
  _zOff: number;

  offsetX = 0;
  offsetY = 0;

  #spriteWidth = 0;
  #spriteHeight = 0;

  override userData: {
    typeId: number;
    unit?: Unit;
  } = {
      typeId: -1,
      unit: undefined
    }

  changeImage(atlas: Atlas, imageDef: ImageDAT, force?: boolean) {

    if (this.dat.index === imageDef.index && !force) {
      this.material.depthTest = ImageHD.useDepth;
      this.scale.copy(this.originalScale).multiplyScalar(ImageHD.useScale);
      return;
    }
    this.atlas = atlas;
    this.dat = imageDef;
    this.material.map = atlas.diffuse;
    (this.material as TeamSpriteMaterial).teamMask = atlas.teammask;
    (this.material as TeamSpriteMaterial).warpInFlashGRP = gameStore().assets?.grps[210];
    this.originalScale.set(
      atlas.spriteWidth / 128,
      atlas.spriteHeight / 128,
      1
    );

    // command center overlay scale up a bit to remove border issues
    if (imageDef.index === 276) {
      this.originalScale.multiply(new Vector3(1.01, 1.01, 1));
    }

    this.material.depthTest = ImageHD.useDepth;
    this.scale.copy(this.originalScale).multiplyScalar(ImageHD.useScale);

    // spriteWidth is only valid with HD, have to scale to HD2 if applicable
    this.#spriteWidth = atlas.spriteWidth * (atlas.unitTileScale / 4);
    this.#spriteHeight = atlas.spriteHeight * (atlas.unitTileScale / 4);

    if (imageDef.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    } else {
      this.material.blending = NormalBlending;
    }
    this.resetParams();

    this.material.needsUpdate = true;

  }

  constructor(
    atlas: Atlas,
    imageDef: ImageDAT,
  ) {
    const _geometry = new BufferGeometry();

    _geometry.setIndex([0, 1, 2, 0, 2, 3]);

    super(_geometry, new TeamSpriteMaterial);

    this.atlas = atlas;
    this.dat = imageDef;
    this.material.transparent = true;
    this.material.depthTest = ImageHD.useDepth;
    this.material.alphaTest = 0.01;

    const posAttribute = new BufferAttribute(
      new Float32Array([
        -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
      ]),
      3,
      false
    );
    posAttribute.usage = DynamicDrawUsage;
    this.geometry.setAttribute("position", posAttribute);

    const uvAttribute = new BufferAttribute(
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      2,
      false
    );
    uvAttribute.usage = DynamicDrawUsage;
    this.geometry.setAttribute("uv", uvAttribute);

    this._zOff = 0;

    this.uv = this.geometry.getAttribute("uv");
    this.pos = this.geometry.getAttribute("position");

    this.matrixAutoUpdate = false;
    this.changeImage(atlas, imageDef, true);
  }


  resetParams() {
    this.resetModifiers();
    this.setFrame(0, false, true);
    this.setTeamColor(white);
  }

  get unitTileScale() {
    return this.atlas.unitTileScale;
  }

  get frames() {
    return this.atlas.frames;
  }

  setTeamColor(val: Color) {
    (this.material as TeamSpriteMaterial).teamColor = val;
  }

  setModifiers(modifier: number, modifierData1: number, modifierData2: number) {
    (this.material as TeamSpriteMaterial).modifier = modifier;
    (this.material as TeamSpriteMaterial).modifierData1 = modifierData1;
    (this.material as TeamSpriteMaterial).modifierData2 = modifierData2;

    // 3 & 6 === cloak
    // 2 and 5 === activate cloak
    // 4 and 7 === deactivate cloak
    // modifierData1 = 0->8 for cloak progress
    if (modifier === 2 || modifier === 5 || modifier === 4 || modifier === 7) {
      this.material.opacity = CLOAK_OPACITY + (modifierData1 / 8) * (1 - CLOAK_OPACITY);
    } else if (modifier === 3 || modifier === 6) {
      this.material.opacity = CLOAK_OPACITY;
    } else {
      this.material.opacity = 1;
    }
  }

  resetModifiers() {
    (this.material as TeamSpriteMaterial).modifier = 0;
    (this.material as TeamSpriteMaterial).modifierData1 = 0;
    (this.material as TeamSpriteMaterial).modifierData2 = 0;
    this.material.opacity = 1;
  }

  setFrame(frame: number, flip: boolean, force = false) {
    if (this._setFrame(this.atlas.frames[frame], flip, force)) {
      this.frame = frame;
      this.flip = flip;
      this.uv.needsUpdate = true;
      this.pos.needsUpdate = true;
    }
  }

  intersects(u: number, v: number) {
    const x = u - 0.5;
    const y = v - 0.5;

    return (
      x > this.pos.array[0] &&
      x < this.pos.array[3] &&
      y > this.pos.array[1] &&
      y < this.pos.array[7]
    );
  }

  //dds is flipped y so we don't do it in our uvs
  _setFrame(frame: AnimFrame, flipFrame?: boolean, force?: boolean) {
    if (frame === undefined) {
      return false;
    }
    if (frame === this.lastSetFrame && flipFrame === this.lastFlipFrame && !force) {
      return false;
    }

    this.lastSetFrame = frame;
    this.lastFlipFrame = flipFrame;

    const off =
      (frame.yoff + frame.h - this.#spriteHeight / 2) / this.#spriteHeight;
    const yOff = this.material.depthTest ? 0.5 - off : 0.5;

    // const zOff = this.material.depthTest ? off : 0;
    // this._zOff = zOff;

    // this.position.z = this.yoff + this.atlas.grpHeight / 2 / this._spriteScale;

    // this.position.z = this.offsetY + this.atlas.grpHeight / this._spriteScale;
    //vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
    // this._offsetY = this.material.depthTest
    // ? frame.h / 2 / this.atlas.grpHeight
    // : 0.5;

    const _leftU = frame.x / this.atlas.textureWidth;
    const _rightU = (frame.x + frame.w) / this.atlas.textureWidth;
    const u0 = flipFrame ? _rightU : _leftU;
    const u1 = flipFrame ? _leftU : _rightU;

    const v1 = frame.y / this.atlas.textureHeight;
    const v0 = (frame.y + frame.h) / this.atlas.textureHeight;

    // const _leftX = frame.xoff / this._normalizedSpriteWidth - 0.5;
    // const _rightX = (frame.xoff + frame.w) / this._normalizedSpriteWidth - 0.5;

    // const px0 = flipFrame ? _rightX : _leftX;
    // const px1 = flipFrame ? _leftX : _rightX;

    const py0 = 1 - (frame.yoff + frame.h) / this.#spriteHeight - yOff;
    const py1 = 1 - frame.yoff / this.#spriteHeight - yOff

    if (flipFrame) {
      this.pos.setX(0, (this.#spriteWidth - (frame.xoff + frame.w)) / this.#spriteWidth -
        0.5);
      this.pos.setX(1, (this.#spriteWidth - frame.xoff) / this.#spriteWidth - 0.5);
      this.pos.setX(2, (this.#spriteWidth - frame.xoff) / this.#spriteWidth - 0.5);
      this.pos.setX(3, (this.#spriteWidth - (frame.xoff + frame.w)) / this.#spriteWidth -
        0.5);
    } else {
      this.pos.setX(0, frame.xoff / this.#spriteWidth - 0.5);
      this.pos.setX(1, (frame.xoff + frame.w) / this.#spriteWidth - 0.5);
      this.pos.setX(2, (frame.xoff + frame.w) / this.#spriteWidth - 0.5);
      this.pos.setX(3, frame.xoff / this.#spriteWidth - 0.5);
    }

    //0,0 bottom left -> 0,1 bottom right -> 1,1 top right ->0,1 top left
    this.uv.setXY(0, u0, v0);
    this.uv.setXY(1, u1, v0);
    this.uv.setXY(2, u1, v1);
    this.uv.setXY(3, u0, v1);

    this.pos.setY(0, py0);
    this.pos.setY(1, py0);
    this.pos.setY(2, py1);
    this.pos.setY(3, py1);

    return true;
  }
}
export default ImageHD;
