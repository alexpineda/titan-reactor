import {
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  InterleavedBufferAttribute,
  Sprite as ThreeSprite,
  SubtractiveBlending,
  Vector3,
} from "three";

import { drawFunctions } from "../../common/bwdat/enums/draw-functions";
import { ImageDAT } from "../../common/types/bwdat";
import { GrpFrameType, GRPInterface } from "../../common/types/grp";
import { Image, Sprite } from ".";
import TeamSpriteMaterial from "./team-sprite-material";

export const DepthMode = {
  Ordered: 0, // for top down views
  Depth: 1, // for angled views
};

/**
 * An image instance that uses HD assets
 */
export class ImageHD extends ThreeSprite implements Image {
  static useDepth = false;
  private _oScale: Vector3;
  override material: TeamSpriteMaterial;

  private atlas: GRPInterface;
  private uv: BufferAttribute | InterleavedBufferAttribute;
  private pos: BufferAttribute | InterleavedBufferAttribute;
  private lastSetFrame?: GrpFrameType;
  private lastFlipFrame?: boolean;

  frame = 0;
  flip = false;

  dat: ImageDAT;
  _zOff: number;

  sprite?: Sprite;
  offsetX = 0;
  offsetY = 0;

  private _normalizedSpriteWidth = 0;
  private _normalizedSpriteHeight = 0;

  constructor(
    atlas: GRPInterface,
    imageDef: ImageDAT,
  ) {
    super();
    this.atlas = atlas;

    const material = new TeamSpriteMaterial({
      map: atlas.diffuse,
    });
    material.teamMask = atlas.teamcolor;
    material.isShadow = imageDef.drawFunction === drawFunctions.rleShadow;
    this.material = material;

    this.dat = imageDef;
    //@todo what does warp flash 2 mean? do we want to use warpFlash as well?
    // if (imageDef.drawFunction === drawFunctions.warpFlash2) {
    //   this.material.warpingIn = 150;
    // }

    this.geometry = this.geometry.clone();

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

    // spriteWidth is the same for HD and HD2
    this._oScale = new Vector3(
      atlas.spriteWidth / 128,
      atlas.spriteHeight / 128,
      1
    );

    this.scale.copy(this._oScale);

    // spriteWidth is only valid with HD, have to scale to HD2 if applicable
    this._normalizedSpriteWidth = atlas.spriteWidth * (atlas.unitTileScale / 4);
    this._normalizedSpriteHeight = atlas.spriteHeight * (atlas.unitTileScale / 4);

    this.material.transparent = true;
    this.material.alphaTest = 0.01;
    this.material.depthTest = ImageHD.useDepth;
    if (imageDef.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    }

    this.castShadow = false;

    this._zOff = 0;

    this.uv = this.geometry.getAttribute("uv");
    this.pos = this.geometry.getAttribute("position");

    this.setFrame(0, false);
  }


  get unitTileScale() {
    return this.atlas.unitTileScale;
  }

  get frames() {
    return this.atlas.frames;
  }

  setTeamColor(val: Color) {
    this.material.teamColor = val;
  }

  //@todo move calculation to here via modifierData1
  setWarpingIn(val: number) {
    this.material.warpingIn = val;
  }

  //@todo move calculation to here via modifierData1
  setCloaked(val: boolean) {
    this.material.opacity = val ? 0.5 : 1;
  }

  setFrame(frame: number, flip?: boolean) {
    if (this._setFrame(this.atlas.frames[frame], flip)) {
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
  _setFrame(frame: GrpFrameType, flipFrame?: boolean, force?: boolean) {
    if (frame === undefined) {
      return false;
    }
    if (frame === this.lastSetFrame && flipFrame === this.lastFlipFrame && !force) {
      return false;
    }

    this.lastSetFrame = frame;
    this.lastFlipFrame = flipFrame;



    const off =
      (frame.yoff + frame.h - this._normalizedSpriteHeight / 2) / this._normalizedSpriteHeight;
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

    const _leftX = frame.xoff / this._normalizedSpriteWidth - 0.5;
    const _rightX = (frame.xoff + frame.w) / this._normalizedSpriteWidth - 0.5;

    const px0 = flipFrame ? _rightX : _leftX;
    const px1 = flipFrame ? _leftX : _rightX;

    const py0 = 1 - (frame.yoff + frame.h) / this._normalizedSpriteHeight - yOff;
    const py1 = 1 - frame.yoff / this._normalizedSpriteHeight - yOff

    if (flipFrame) {
      this.pos.setX(0, (this._normalizedSpriteWidth - (frame.xoff + frame.w)) / this._normalizedSpriteWidth -
        0.5);
      this.pos.setX(1, (this._normalizedSpriteWidth - frame.xoff) / this._normalizedSpriteWidth - 0.5);
      this.pos.setX(2, (this._normalizedSpriteWidth - frame.xoff) / this._normalizedSpriteWidth - 0.5);
      this.pos.setX(3, (this._normalizedSpriteWidth - (frame.xoff + frame.w)) / this._normalizedSpriteWidth -
        0.5);
    } else {
      this.pos.setX(0, frame.xoff / this._normalizedSpriteWidth - 0.5);
      this.pos.setX(1, (frame.xoff + frame.w) / this._normalizedSpriteWidth - 0.5);
      this.pos.setX(2, (frame.xoff + frame.w) / this._normalizedSpriteWidth - 0.5);
      this.pos.setX(3, frame.xoff / this._normalizedSpriteWidth - 0.5);
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
