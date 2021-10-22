import {
  Sprite,
  BufferAttribute,
  DynamicDrawUsage,
  SubtractiveBlending,
  Vector3,
} from "three";
import { drawFunctions } from "../bw-types/drawFunctions";
import TeamSpriteMaterial from "./TeamSpriteMaterial";

export const DepthMode = {
  Ordered: 0, // for top down views
  Depth: 1, // for angled views
};

export default class TitanImageHD extends Sprite {
  static useDepth = false;

  constructor(atlas, createIScriptRunner, imageDef, sprite, spriteScale = 128) {
    const { diffuse, teamcolor, grpWidth, grpHeight } = atlas;

    let material;

    material = new TeamSpriteMaterial({
      map: diffuse,
    });
    material.teamMask = teamcolor;
    material.isShadow = imageDef.drawFunction === drawFunctions.rleShadow;

    super(material);

    this.sprite = sprite;
    this._spriteScale = spriteScale;

    this.imageDef = imageDef;
    if (imageDef.drawFunction === drawFunctions.warpFlash2) {
      this.material.warpingIn = 150;
    }

    this.iscript = createIScriptRunner(this, imageDef);
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
      grpWidth / this._spriteScale,
      grpHeight / this._spriteScale,
      1
    );

    this.scale.copy(this._oScale);
    this.material.transparent = true;
    this.material.alphaTest = 0.01;
    this.material.depthTest = TitanImageHD.useDepth;
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

  setScale(v) {
    this.scale.copy(this._oScale).multiply(v);
  }

  get frames() {
    return this.atlas.frames;
  }

  setTeamColor(val) {
    this.material.teamColor = val;
  }

  setWarpingIn(val, len, delta) {
    // this.material.warpingIn = val;
    // this.material.warpingInLen = len;
    // this.material.delta = delta;
  }

  setCloaked(val) {
    this.material.opacity = val ? 0.5 : 1;
  }

  setPositionX(x, scale = this._spriteScale) {
    this.position.x = x / scale;
  }

  setPositionY(y, scale = this._spriteScale) {
    this.position.y = y / scale;
  }

  setPosition(x, y, scale = this._spriteScale) {
    this.setPositionX(x, scale);
    this.setPositionY(y, scale);
  }

  setFrame(frame, flip) {
    if (this._setFrame(this.atlas.frames[frame], flip)) {
      this.uv.needsUpdate = true;
      this.pos.needsUpdate = true;
    }
  }

  intersects(u, v) {
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
  _setFrame(frame, flipFrame) {
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
