import {
  Sprite,
  SpriteMaterial,
  BufferAttribute,
  DynamicDrawUsage,
  SubtractiveBlending,
} from "three";
import { drawFunctions } from "../types/drawFunctions";

export default class TitanImageSD extends Sprite {
  constructor(atlas, createIScriptRunner, imageDef, sprite) {
    const { texture, grpWidth, grpHeight, frames } = atlas;

    const maxFrameBottom = frames.reduce((max, { h, y }) => {
      if (grpHeight - h - y > max) {
        max = grpHeight - h - y;
      }
      return max;
    }, 0);

    const yOff = maxFrameBottom / grpHeight;

    // const sprite = new SDSprite(new MeshStandardMaterial({ map }));
    // sprite.customDepthMaterial = new MeshDepthMaterial({
    //   depthPacking: RGBADepthPacking,
    //   map: this.masks[bucketId],
    //   alphaTest: 0.5,
    // });

    super(new SpriteMaterial({ map: texture }));

    this.sprite = sprite;
    this._spriteScale = 32;
    this.imageDef = imageDef;
    this.iscript = createIScriptRunner(this, imageDef);
    this.geometry = this.geometry.clone();

    const ba = new BufferAttribute(
      new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      2,
      false
    );
    ba.usage = DynamicDrawUsage;
    this.geometry.setAttribute("uv", ba);
    // this.center = new Vector2(0.5, yOff - 0.1);
    this.scale.set(
      grpWidth / this._spriteScale,
      grpHeight / this._spriteScale,
      1
    );
    this.material.transparent = true;
    this.material.alphaTest = 0.01;
    this.material.depthTest = false;
    if (imageDef.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    }

    this.castShadow = false;

    this.atlas = atlas;

    this.setFrame(0, false);
  }

  setTeamColor(val) {
    this.material.teamColor = val;
  }

  setWarpingIn(val, len, delta) {
    this.material.warpingIn = val;
    this.material.warpingInLen = len;
    this.material.delta = delta;
  }

  setCloaked(val) {
    this.material.opacity = val ? 0.5 : 1;
  }

  get frames() {
    return this.atlas.frames;
  }

  setFrame(frame, flip) {
    const uv = this.geometry.getAttribute("uv");
    this._setFrame(this.atlas.frames[frame], flip, uv);
    uv.needsUpdate = true;
  }

  frameFloorOffset(image, frameId) {
    const frame = image.frameGroup[frameId].frame;

    return (image.h - frame.h - frame.y) / this._spriteScale;
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

  _setFrame(frame, flipFrame, uv) {
    if (frame === undefined) debugger;

    if (flipFrame) {
      uv.array[0] = (frame.grpX + this.atlas.grpWidth) / this.atlas.width;
      uv.array[1] = 1 - (frame.grpY + this.atlas.grpHeight) / this.atlas.height;
      uv.array[2] = frame.grpX / this.atlas.width;
      uv.array[3] = 1 - (frame.grpY + this.atlas.grpHeight) / this.atlas.height;
      uv.array[4] = frame.grpX / this.atlas.width;
      uv.array[5] = 1 - frame.grpY / this.atlas.height;
      uv.array[6] = (frame.grpX + this.atlas.grpWidth) / this.atlas.width;
      uv.array[7] = 1 - frame.grpY / this.atlas.height;
    } else {
      uv.array[0] = frame.grpX / this.atlas.width;
      uv.array[1] = 1 - (frame.grpY + this.atlas.grpHeight) / this.atlas.height;
      uv.array[2] = (frame.grpX + this.atlas.grpWidth) / this.atlas.width;
      uv.array[3] = 1 - (frame.grpY + this.atlas.grpHeight) / this.atlas.height;
      uv.array[4] = (frame.grpX + this.atlas.grpWidth) / this.atlas.width;
      uv.array[5] = 1 - frame.grpY / this.atlas.height;
      uv.array[6] = frame.grpX / this.atlas.width;
      uv.array[7] = 1 - frame.grpY / this.atlas.height;
    }
  }
}
