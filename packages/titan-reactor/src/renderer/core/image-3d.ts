import "three/examples/jsm/utils/SkeletonUtils";

import { AnimationAction, AnimationMixer, Color, Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

import Glb from "../../common/image/atlas/atlas-glb";
import { ImageDAT } from "../../common/types";
import { Sprite, Image } from ".";

export class Image3D extends Object3D implements Image {
  atlas: Glb;
  model: Object3D;
  sprite: Sprite;
  imageDef: ImageDAT;
  mixer?: AnimationMixer;

  private times = new Float32Array();
  private action?: AnimationAction;
  _spriteScale: number;
  _zOff: number;

  constructor(
    atlas: Glb,
    imageDef: ImageDAT,
    sprite: Sprite
  ) {
    super();
    this.atlas = atlas;
    // @ts-ignore
    this.model = SkeletonUtils.clone(atlas.model);
    this.model.traverse((o) => {
      if (o.type == "Mesh" || o.type == "SkinnedMesh") {
        o.castShadow = true;
        o.receiveShadow = true;
        // o.material.encoding = sRGBEncoding;
        this.model.userData.mesh = o;
      }
    });

    this.add(this.model);

    if (this.model && this.atlas.animations.length) {
      this.times = this.atlas.animations[0].tracks[0].times;
      this.mixer = new AnimationMixer(this);
      this.action = this.mixer.clipAction(this.atlas.animations[0]);
      this.action.play();
    }

    this.sprite = sprite;
    this._spriteScale = 128;
    this.imageDef = imageDef;

    this._zOff = 0;

    this.setFrame(0);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTeamColor(val: Color) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setWarpingIn(val: number) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setCloaked(val: boolean) { }

  get frames() {
    return this.atlas.frames;
  }

  setPositionX(x: number, scale = this._spriteScale) {
    this.position.x = x / scale;
  }

  setPositionY(y: number, scale = this._spriteScale) {
    this.position.y = y / scale;
  }

  setPosition(x: number, y: number, scale = this._spriteScale) {
    this.setPositionX(x, scale);
    this.setPositionY(y, scale);
  }

  setFrame(frame: number) {
    if (!this.mixer) return;
    const effectiveFrame = this.atlas.fixedFrames[frame];
    this.mixer.setTime(this.times[effectiveFrame]);

    if (this.imageDef.index === 239) {
      //marine
      if (effectiveFrame === 3) {
        //fire
        this.model.userData.mesh.material.emissiveIntensity = 1;
      } else {
        this.model.userData.mesh.material.emissiveIntensity = 0;
      }
    }
  }
}
export default Image3D;
