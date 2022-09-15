import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InterleavedBufferAttribute,
  Intersection,
  Matrix4,
  Mesh,
  NearestMipMapNearestFilter,
  NormalBlending,
  Raycaster,
  SubtractiveBlending,
  Triangle,
  Vector2,
  Vector3,
} from "three";

import { drawFunctions } from "common/enums";
import { AnimFrame, AnimAtlas } from "common/types";
import { ImageBase } from ".";
import { ImageHDMaterial } from "./image-hd-material";
import gameStore from "@stores/game-store";
import { ImageHDInstancedMaterial } from "./image-hd-instanced-material";
import { disposeMesh } from "@utils/dispose";

const white = new Color(0xffffff);
const CLOAK_OPACITY = 0.6;

//dds is flipped y so we don't do it in our uvs
export const calculateFrame = (frame: AnimFrame, flipFrame: boolean, textureWidth: number, textureHeight: number, spriteWidth: number, spriteHeight: number, pos: { setX: (index: number, value: number) => void, setY: (index: number, value: number) => void }, uv: { setXY: (index: number, x: number, y: number) => void }) => {

  const yOff = 0.5;

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

const _worldScale = new Vector3;
const _mvPosition = new Vector3;
const _intersectPoint = new Vector3;
const _alignedPosition = new Vector3;
const _vA = new Vector3;
const _vB = new Vector3;
const _vC = new Vector3;
const _uvA = new Vector2;
const _uvB = new Vector2;
const _uvC = new Vector2;
const _viewWorldMatrix = new Matrix4;


function transformVertex(vertexPosition: Vector3, mvPosition: Vector3, scale: Vector3) {

  // compute position in camera space
  _alignedPosition.copy(vertexPosition).multiply(scale);

  vertexPosition.copy(mvPosition);
  vertexPosition.x += _alignedPosition.x;
  vertexPosition.y += _alignedPosition.y;

  // transform to world space
  vertexPosition.applyMatrix4(_viewWorldMatrix);

}
export class ImageHD extends Mesh<BufferGeometry, ImageHDMaterial | ImageHDInstancedMaterial> implements ImageBase {
  isImage3d = false;
  isInstanced = false;
  //@ts-ignore
  atlas: AnimAtlas;

  #uv: BufferAttribute | InterleavedBufferAttribute;
  #pos: BufferAttribute | InterleavedBufferAttribute;

  #frame = 0;
  #flip = false;

  _zOff: number;

  protected spriteWidth = 0;
  protected spriteHeight = 0;

  constructor(
  ) {

    super();

    this.material = this.createMaterial();
    this.material.transparent = true;

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

  updateImageType(atlas: AnimAtlas) {
    if (this.atlas && this.atlas.imageIndex !== atlas.imageIndex) {
      console.warn("changing image type");
    }
    if (this.atlas?.imageIndex === atlas.imageIndex && this.atlas?.unitTileScale === atlas.unitTileScale) {
      return this;
    }

    this.atlas = atlas;
    this.material.map = atlas.diffuse;
    this.material.teamMask = atlas.teammask;
    this.material.warpInFlashGRP = gameStore().assets?.atlases[210];

    this.material.alphaTest = 0.01;
    this.scale.set(
      atlas.spriteWidth / 128,
      atlas.spriteHeight / 128,
      1
    );

    // spriteWidth is only valid with HD, have to scale to HD2 if applicable
    this.spriteWidth = atlas.spriteWidth * (atlas.unitTileScale / 4);
    this.spriteHeight = atlas.spriteHeight * (atlas.unitTileScale / 4);

    if (this.dat.drawFunction === drawFunctions.rleShadow) {
      this.material.blending = SubtractiveBlending;
    } else {
      this.material.blending = NormalBlending;
    }

    // command center / armory overlay scale up a bit to remove border issues
    if (atlas.imageIndex === 276 || atlas.imageIndex === 269) {
      this.material.map.minFilter = NearestMipMapNearestFilter;
      this.material.map.magFilter = NearestMipMapNearestFilter;
    }

    this.material.needsUpdate = true;

    return this;
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

  setFrame(frame: number, flip: boolean) {
    if (this.atlas.frames[frame] === undefined) {
      console.warn("invalid frame", frame, this.atlas.imageIndex);
      return;
    }

    calculateFrame(this.atlas.frames[frame], flip, this.atlas.textureWidth, this.atlas.textureHeight, this.spriteWidth, this.spriteHeight, this.#pos, this.#uv);

    this.frame = frame;
    this.flip = flip;
    this.#uv.needsUpdate = true;
    this.#pos.needsUpdate = true;

  }

  //TODO: only do compose once then only adjust position
  updateMatrixPosition(parentPosition: Vector3) {
    this.matrix.compose(this.position.add(parentPosition), this.quaternion, this.scale);
    this.matrixWorld.copy(this.matrix);
    this.matrixWorldNeedsUpdate = false;

  }

  override updateMatrix(): void {

  }

  override updateMatrixWorld(): void {

  }

  //TODO confine to frame offsets
  override raycast(raycaster: Raycaster, intersects: Intersection[]) {

    if (raycaster.camera === null) {

      console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.');

    }

    _worldScale.setFromMatrixScale(this.matrixWorld);

    _viewWorldMatrix.copy(raycaster.camera.matrixWorld);
    this.modelViewMatrix.multiplyMatrices(raycaster.camera.matrixWorldInverse, this.matrixWorld);

    _mvPosition.setFromMatrixPosition(this.modelViewMatrix);

    transformVertex(_vA.set(- 0.5, - 0.5, 0), _mvPosition, _worldScale);
    transformVertex(_vB.set(0.5, - 0.5, 0), _mvPosition, _worldScale);
    transformVertex(_vC.set(0.5, 0.5, 0), _mvPosition, _worldScale);

    _uvA.set(0, 0);
    _uvB.set(1, 0);
    _uvC.set(1, 1);

    // check first triangle
    let intersect = raycaster.ray.intersectTriangle(_vA, _vB, _vC, false, _intersectPoint);

    if (intersect === null) {

      // check second triangle
      transformVertex(_vB.set(- 0.5, 0.5, 0), _mvPosition, _worldScale);
      _uvB.set(0, 1);

      intersect = raycaster.ray.intersectTriangle(_vA, _vC, _vB, false, _intersectPoint);
      if (intersect === null) {

        return;

      }

    }

    const distance = raycaster.ray.origin.distanceTo(_intersectPoint);

    if (distance < raycaster.near || distance > raycaster.far) return;

    intersects.push({

      distance: distance,
      point: _intersectPoint.clone(),
      uv: Triangle.getUV(_intersectPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2()),
      face: null,
      object: this

    });

  }

  dispose() {

    disposeMesh(this);

  }
}