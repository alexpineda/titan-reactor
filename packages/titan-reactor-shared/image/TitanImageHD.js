import {
  Sprite,
  BufferAttribute,
  DynamicDrawUsage,
  MultiplyBlending,
  SubtractiveBlending,
} from "three";
import { drawFunctions } from "titan-reactor-shared/types/drawFunctions";
import TeamSpriteMaterial from "./TeamSpriteMaterial";

export default class TitanImageHD extends Sprite {
  constructor(atlas, createIScriptRunner, imageDef, sprite) {
    if (!atlas) debugger;
    const { diffuse, teamcolor, grpWidth, grpHeight } = atlas;

    let material;

    material = new TeamSpriteMaterial({
      map: diffuse,
    });
    material.teamMask = teamcolor;
    material.isShadow = imageDef.drawFunction === drawFunctions.rleShadow;

    super(material);

    this.sprite = sprite;
    this._spriteScale = 128;

    this.imageDef = imageDef;
    this.iscript = createIScriptRunner(this, imageDef);
    this.geometry = this.geometry.clone();

    const posAttribute = new BufferAttribute(
      new Float32Array([
        -0.5,
        -0.5,
        0,
        0.5,
        -0.5,
        0,
        0.5,
        0.5,
        0,
        -0.5,
        0.5,
        0,
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
    // this.center = new Vector2(0.5, yOff - 0.1);
    this.scale.set(
      grpWidth / this._spriteScale,
      grpHeight / this._spriteScale,
      1
    );
    this.material.transparent = true;
    this.material.depthTest = false;
    if (imageDef.drawFunction === drawFunctions.rleShadow) {
      // this.material.premultipliedAlpha = true;
    }

    this.castShadow = false;

    this.atlas = atlas;

    this.setFrame(0, false);
  }

  get frames() {
    return this.atlas.frames;
  }

  setTeamColor(val) {
    this.material.teamColor = val;
  }

  setWarpingIn(val) {
    this.material.warpingIn = val;
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
    const uv = this.geometry.getAttribute("uv");
    const pos = this.geometry.getAttribute("position");
    this._setFrame(this.atlas.frames[frame], flip, uv, pos);
    uv.needsUpdate = true;
    pos.needsUpdate = true;
  }

  frameFloorOffset(image, frameId) {
    const frame = image.frameGroup[frameId].frame;

    return (image.h - frame.h - frame.y) / this._spriteScale;
  }

  //dds is flipped y so we don't do it in our uvs
  _setFrame(frame, flipFrame, uv, pos) {
    if (frame === undefined) {
      console.error("frame is undefined");
      return;
    }
    if (flipFrame) {
      uv.array[0] = (frame.x + frame.w) / this.atlas.width;
      uv.array[1] = (frame.y + frame.h) / this.atlas.height;
      uv.array[2] = frame.x / this.atlas.width;
      uv.array[3] = (frame.y + frame.h) / this.atlas.height;
      uv.array[4] = frame.x / this.atlas.width;
      uv.array[5] = frame.y / this.atlas.height;
      uv.array[6] = (frame.x + frame.w) / this.atlas.width;
      uv.array[7] = frame.y / this.atlas.height;

      pos.array[0] =
        (this.atlas.grpWidth - (frame.xoff + frame.w)) / this.atlas.grpWidth -
        0.5;
      pos.array[1] = 1 - (frame.yoff + frame.h) / this.atlas.grpHeight - 0.5;
      pos.array[2] = 0;
      pos.array[3] =
        (this.atlas.grpWidth - frame.xoff) / this.atlas.grpWidth - 0.5;
      pos.array[4] = 1 - (frame.yoff + frame.h) / this.atlas.grpHeight - 0.5;
      pos.array[5] = 0;
      pos.array[6] =
        (this.atlas.grpWidth - frame.xoff) / this.atlas.grpWidth - 0.5;
      pos.array[7] = 1 - frame.yoff / this.atlas.grpHeight - 0.5;
      pos.array[8] = 0;
      pos.array[9] =
        (this.atlas.grpWidth - (frame.xoff + frame.w)) / this.atlas.grpWidth -
        0.5;
      pos.array[10] = 1 - frame.yoff / this.atlas.grpHeight - 0.5;
      pos.array[11] = 0;
    } else {
      uv.array[0] = frame.x / this.atlas.width;
      uv.array[1] = (frame.y + frame.h) / this.atlas.height;
      uv.array[2] = (frame.x + frame.w) / this.atlas.width;
      uv.array[3] = (frame.y + frame.h) / this.atlas.height;
      uv.array[4] = (frame.x + frame.w) / this.atlas.width;
      uv.array[5] = frame.y / this.atlas.height;
      uv.array[6] = frame.x / this.atlas.width;
      uv.array[7] = frame.y / this.atlas.height;

      pos.array[0] = frame.xoff / this.atlas.grpWidth - 0.5;
      pos.array[1] = 1 - (frame.yoff + frame.h) / this.atlas.grpHeight - 0.5;
      pos.array[2] = 0;
      pos.array[3] = (frame.xoff + frame.w) / this.atlas.grpWidth - 0.5;
      pos.array[4] = 1 - (frame.yoff + frame.h) / this.atlas.grpHeight - 0.5;
      pos.array[5] = 0;
      pos.array[6] = (frame.xoff + frame.w) / this.atlas.grpWidth - 0.5;
      pos.array[7] = 1 - frame.yoff / this.atlas.grpHeight - 0.5;
      pos.array[8] = 0;
      pos.array[9] = frame.xoff / this.atlas.grpWidth - 0.5;
      pos.array[10] = 1 - frame.yoff / this.atlas.grpHeight - 0.5;
      pos.array[11] = 0;
    }
  }
}
