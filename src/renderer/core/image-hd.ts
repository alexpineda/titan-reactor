import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InterleavedBufferAttribute,
  Mesh,
  NearestMipMapNearestFilter,
  NormalBlending,
  SubtractiveBlending,
  Vector3,
} from "three";

import { drawFunctions } from "common/enums";
import { AnimFrame, AnimAtlas } from "common/types";
import { ImageBase } from ".";
import { ImageHDMaterial } from "./image-hd-material";
import gameStore from "@stores/game-store";
import { imageIsDoodad } from "@utils/image-utils";
import { ImageHDInstancedMaterial } from "./image-hd-instanced-material";

const white = new Color(0xffffff);
const CLOAK_OPACITY = 0.6;

//dds is flipped y so we don't do it in our uvs
export const calculateFrame = (frame: AnimFrame, flipFrame: boolean, textureWidth: number, textureHeight: number, spriteWidth: number, spriteHeight: number, depthTest: boolean, pos: { setX: (index: number, value: number) => void, setY: (index: number, value: number) => void }, uv: { setXY: (index: number, x: number, y: number) => void }) => {
  const off =
    (frame.yoff + frame.h - spriteHeight / 2) / spriteHeight;
  const yOff = depthTest ? 0.5 - off : 0.5;

  const _leftU = frame.x / textureWidth;
  const _rightU = (frame.x + frame.w) / textureWidth;
  const u0 = flipFrame ? _rightU : _leftU;
  const u1 = flipFrame ? _leftU : _rightU;

  const v1 = frame.y / textureHeight;
  const v0 = (frame.y + frame.h) / textureHeight;

  const py0 = 1 - (frame.yoff + frame.h) / spriteHeight - yOff;
  const py1 = 1 - frame.yoff / spriteHeight - yOff

  if (flipFrame) {
    pos.setX(0, (spriteWidth - (frame.xoff + frame.w)) / spriteWidth -
      0.5);
    pos.setX(1, (spriteWidth - frame.xoff) / spriteWidth - 0.5);
    pos.setX(2, (spriteWidth - frame.xoff) / spriteWidth - 0.5);
    pos.setX(3, (spriteWidth - (frame.xoff + frame.w)) / spriteWidth -
      0.5);
  } else {
    pos.setX(0, frame.xoff / spriteWidth - 0.5);
    pos.setX(1, (frame.xoff + frame.w) / spriteWidth - 0.5);
    pos.setX(2, (frame.xoff + frame.w) / spriteWidth - 0.5);
    pos.setX(3, frame.xoff / spriteWidth - 0.5);
  }

  //0,0 bottom left -> 0,1 bottom right -> 1,1 top right ->0,1 top left
  uv.setXY(0, u0, v0);
  uv.setXY(1, u1, v0);
  uv.setXY(2, u1, v1);
  uv.setXY(3, u0, v1);

  pos.setY(0, py0);
  pos.setY(1, py0);
  pos.setY(2, py1);
  pos.setY(3, py1);
}

export class ImageHD extends Mesh<BufferGeometry, ImageHDMaterial | ImageHDInstancedMaterial> implements ImageBase {
  isImage3d = false;
  isInstanced = false;
  static useDepth = false;

  readonly originalScale = new Vector3();

  #uv: BufferAttribute | InterleavedBufferAttribute;
  #pos: BufferAttribute | InterleavedBufferAttribute;

  #frame = 0;
  #flip = false;

  _zOff: number;

  protected atlas: AnimAtlas;
  protected spriteWidth = 0;
  protected spriteHeight = 0;

  constructor(
    atlas: AnimAtlas,
  ) {

    super();

    this.atlas = atlas;
    this.material = this.createMaterial();
    this.material.transparent = true;
    this.material.depthTest = ImageHD.useDepth;

    this.geometry = new BufferGeometry();
    this.geometry.setIndex([0, 1, 2, 0, 2, 3]);

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

    this.#uv = uvAttribute;
    this.#pos = posAttribute;

    this.matrixAutoUpdate = false;
    this.matrixWorldNeedsUpdate = false;
  }

  protected createMaterial(): ImageHDMaterial | ImageHDInstancedMaterial {
    return new ImageHDMaterial;
  }

  get dat() {
    return gameStore().assets!.bwDat.images[this.atlas.imageIndex];
  }

  updateImageType(atlas: AnimAtlas, force?: boolean) {

    if (this.atlas.imageIndex === atlas.imageIndex && !force) {
      this.material.depthTest = ImageHD.useDepth;
      return;
    }
    this.atlas = atlas;
    this.material.map = atlas.diffuse;
    this.material.teamMask = atlas.teammask;
    this.material.warpInFlashGRP = gameStore().assets?.grps[210];
    this.originalScale.set(
      atlas.spriteWidth / 128,
      atlas.spriteHeight / 128,
      1
    );

    this.material.alphaTest = imageIsDoodad(this.dat) ? 0.01 : 0;
    this.material.depthTest = ImageHD.useDepth;
    this.scale.copy(this.originalScale);

    // spriteWidth is only valid with HD, have to scale to HD2 if applicable
    this.spriteWidth = atlas.spriteWidth * (atlas.unitTileScale / 4);
    this.spriteHeight = atlas.spriteHeight * (atlas.unitTileScale / 4);

    if (this.dat.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    } else {
      this.material.blending = NormalBlending;
    }

    // command center overlay scale up a bit to remove border issues
    if (this.atlas.imageIndex === 276) {
      this.material.map.minFilter = NearestMipMapNearestFilter;
      this.material.map.magFilter = NearestMipMapNearestFilter;
    }

    this.resetParams();
    this.material.needsUpdate = true;

    return this;
  }

  resetParams() {
    this.setModifiers(0, 0, 0);
    this.setFrame(0, false, true);
    this.setTeamColor(white);
  }

  get unitTileScale() {
    return this.atlas.unitTileScale;
  }

  get frames() {
    return this.atlas.frames;
  }

  setTeamColor(val: Color | undefined) {
    this.material.teamColor = val ?? white;
  }

  setModifiers(modifier: number, modifierData1: number, modifierData2: number) {
    this.material.modifier = modifier;
    this.material.modifierData1 = modifierData1;
    this.material.modifierData2 = modifierData2;
    this.setOpacityFromModifiers(modifier, modifierData1);
  }

  setOpacityFromModifiers(modifier: number, modifierData1: number) {
    // 3 & 6 === cloak
    // 2 and 5 === activate cloak
    // 4 and 7 === deactivate cloak
    // modifierData1 = 0->8 for cloak progress
    if (modifier === 2 || modifier === 5 || modifier === 4 || modifier === 7) {
      this.setOpacity(CLOAK_OPACITY + (modifierData1 / 8) * (1 - CLOAK_OPACITY));
    } else if (modifier === 3 || modifier === 6) {
      this.setOpacity(CLOAK_OPACITY);
    } else {
      this.setOpacity(1);
    }
  }

  setOpacity(val: number) {
    this.material.opacity = val;
  }

  get frame() {
    return this.#frame;
  }

  set frame(val: number) {
    this.#frame = val;
  }

  get flip() {
    return this.#flip;
  }

  set flip(val: boolean) {
    this.#flip = val;
  }

  setFrame(frame: number, flip: boolean, force = false) {
    if (frame === this.frame && flip === this.flip && force === false) {
      return;
    }
    if (this.atlas.frames[frame] === undefined) {
      return;
    }

    calculateFrame(this.atlas.frames[frame], flip, this.atlas.textureWidth, this.atlas.textureHeight, this.spriteWidth, this.spriteHeight, this.material.depthTest, this.#pos, this.#uv);

    this.frame = frame;
    this.flip = flip;
    this.#uv.needsUpdate = true;
    this.#pos.needsUpdate = true;
  }

  updateMatrixPosition(parentPosition: Vector3) {
    this.matrix.compose(this.position.add(parentPosition), this.quaternion, this.scale);
    this.matrixWorld.copy(this.matrix);
    this.matrixWorldNeedsUpdate = false;
  }

  override updateMatrix(): void {

  }

  override updateMatrixWorld(): void {

  }
}