import "three/examples/jsm/utils/SkeletonUtils";

import { AnimationAction, AnimationMixer, Color, Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

import { GlbAtlas } from "../../common/image/atlas/glb-atlas";
import type { ImageDAT } from "../../common/types";
import type { Image } from ".";
import Sprite from "./sprite";

/**
 * An image instance that may include a 3d model
 */
export class Image3D extends Object3D implements Image {
  atlas: GlbAtlas;
  model: Object3D;
  dat: ImageDAT;
  mixer?: AnimationMixer;

  private times = new Float32Array();
  private action?: AnimationAction;

  _zOff: number;

  // unused, only for 2d
  offsetX = 0;
  // unused, only for 2d
  offsetY = 0;

  constructor(
    atlas: GlbAtlas,
    imageDef: ImageDAT,
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

    this.dat = imageDef;

    this._zOff = 0;

    this.setFrame(0);
  }
  sprite?: Sprite | undefined;

  get unitTileScale() {
    return this.atlas.unitTileScale;
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

  setFrame(frame: number) {
    if (!this.mixer) return;
    const effectiveFrame = this.atlas.fixedFrames[frame];
    this.mixer.setTime(this.times[effectiveFrame]);

    if (this.dat.index === 239) {
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
