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
import { GrpFrameType } from "../../common/types/grp";
import Anim from "../../common/image/atlas/atlas-anim";
import { Image } from ".";
import TeamSpriteMaterial from "./team-sprite-material";

export const DepthMode = {
  Ordered: 0, // for top down views
  Depth: 1, // for angled views
};

export class ImageHD extends ThreeSprite implements Image {
  static useDepth = false;
  readonly imageScale: number;
  private _oScale: Vector3;
  imageDef: ImageDAT;
  override material: TeamSpriteMaterial;
  _zOff: number;

  private atlas: Anim;
  private uv: BufferAttribute | InterleavedBufferAttribute;
  private pos: BufferAttribute | InterleavedBufferAttribute;
  private lastSetFrame?: GrpFrameType;
  private lastFlipFrame?: boolean;

  constructor(
    atlas: Anim,
    imageDef: ImageDAT,
    spriteScale = 128
  ) {
    super();
    const { diffuse, teamcolor, grpWidth, grpHeight } = atlas;

    const material = new TeamSpriteMaterial({
      map: diffuse,
    });
    material.teamMask = teamcolor;
    material.isShadow = imageDef.drawFunction === drawFunctions.rleShadow;
    this.material = material;

    this.imageScale = spriteScale;

    this.imageDef = imageDef;
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
    this._oScale = new Vector3(
      (grpWidth as number) / this.imageScale,
      (grpHeight as number) / this.imageScale,
      1
    );

    this.scale.copy(this._oScale);
    this.material.transparent = true;
    this.material.alphaTest = 0.01;
    this.material.depthTest = ImageHD.useDepth;
    if (imageDef.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    }

    this.castShadow = false;

    this.atlas = atlas;
    this._zOff = 0;

    this.uv = this.geometry.getAttribute("uv");
    this.pos = this.geometry.getAttribute("position");

    this.setFrame(0, false);
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

  setPositionX(x: number, scale = this.imageScale) {
    this.position.x = x / scale;
  }

  setPositionY(y: number, scale = this.imageScale) {
    this.position.y = y / scale;
  }

  setPosition(x: number, y: number, scale = this.imageScale) {
    this.setPositionX(x, scale);
    this.setPositionY(y, scale);
  }

  setFrame(frame: number, flip?: boolean) {
    if (this._setFrame(this.atlas.frames[frame], flip)) {
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
  _setFrame(frame: GrpFrameType, flipFrame?: boolean) {
    if (frame === undefined) {
      console.error("frame is undefined");
      return false;
    }
    if (frame === this.lastSetFrame && flipFrame === this.lastFlipFrame) {
      return false;
    }

    this.lastSetFrame = frame;
    this.lastFlipFrame = flipFrame;

    // this.position.z = this.yoff + this.atlas.grpHeight / 2 / this._spriteScale;

    // this.position.z = this.offsetY + this.atlas.grpHeight / this._spriteScale;
    //vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
    // this._offsetY = this.material.depthTest
    // ? frame.h / 2 / this.atlas.grpHeight
    // : 0.5;

    //@todo migrate to use set
    if (flipFrame) {
      this.uv.array[0] = (frame.x + frame.w) / this.atlas.width;
      this.uv.array[2] = frame.x / this.atlas.width;
      this.uv.array[4] = frame.x / this.atlas.width;
      this.uv.array[6] = (frame.x + frame.w) / this.atlas.width;

      this.pos.array[0] =
        (this.atlas.grpWidth - (frame.xoff + frame.w)) / this.atlas.grpWidth -
        0.5;
      this.pos.array[3] =
        (this.atlas.grpWidth - frame.xoff) / this.atlas.grpWidth - 0.5;
      this.pos.array[6] =
        (this.atlas.grpWidth - frame.xoff) / this.atlas.grpWidth - 0.5;
      this.pos.array[9] =
        (this.atlas.grpWidth - (frame.xoff + frame.w)) / this.atlas.grpWidth -
        0.5;
    } else {
      this.uv.array[0] = frame.x / this.atlas.width;
      this.uv.array[2] = (frame.x + frame.w) / this.atlas.width;
      this.uv.array[4] = (frame.x + frame.w) / this.atlas.width;
      this.uv.array[6] = frame.x / this.atlas.width;

      this.pos.array[0] = frame.xoff / this.atlas.grpWidth - 0.5;
      this.pos.array[3] = (frame.xoff + frame.w) / this.atlas.grpWidth - 0.5;
      this.pos.array[6] = (frame.xoff + frame.w) / this.atlas.grpWidth - 0.5;
      this.pos.array[9] = frame.xoff / this.atlas.grpWidth - 0.5;
    }

    this.uv.array[1] = (frame.y + frame.h) / this.atlas.height;
    this.uv.array[3] = (frame.y + frame.h) / this.atlas.height;
    this.uv.array[5] = frame.y / this.atlas.height;
    this.uv.array[7] = frame.y / this.atlas.height;

    const off =
      (frame.yoff + frame.h - this.atlas.grpHeight / 2) / this.atlas.grpHeight;
    const yOff = this.material.depthTest ? 0.5 - off : 0.5;

    const zOff = this.material.depthTest ? off : 0;

    this.pos.array[1] =
      1 - (frame.yoff + frame.h) / this.atlas.grpHeight - yOff;
    this.pos.array[4] =
      1 - (frame.yoff + frame.h) / this.atlas.grpHeight - yOff;
    this.pos.array[7] = 1 - frame.yoff / this.atlas.grpHeight - yOff;
    this.pos.array[10] = 1 - frame.yoff / this.atlas.grpHeight - yOff;

    this._zOff = zOff;
    return true;
  }
}
export default ImageHD;