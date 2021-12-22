import "three/examples/jsm/utils/SkeletonUtils";

import THREE, { AnimationAction, AnimationMixer, Color, Object3D } from "three";

import { IScriptRunner } from "../../common/iscript";
import Atlas3D from "../../common/image/atlas/atlas-3d";
import { ImageInstance, ImageDAT, createIScriptRunner } from "../../common/types";
import { Sprite } from ".";

export class TitanImage3D extends Object3D implements ImageInstance {
  atlas: Atlas3D;
  model: Object3D;
  sprite: Sprite;
  imageDef: ImageDAT;
  iscript: IScriptRunner;
  mixer?: AnimationMixer;

  private times = new Float32Array();
  private action?: AnimationAction;
  _spriteScale: number;
  _zOff: number;

  constructor(
    atlas: Atlas3D,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDAT,
    sprite: Sprite
  ) {
    super();
    this.atlas = atlas;
    // @ts-ignore
    this.model = THREE.SkeletonUtils.clone(atlas.model);
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
    this.iscript = createIScriptRunner(this, imageDef);

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
export default TitanImage3D;
