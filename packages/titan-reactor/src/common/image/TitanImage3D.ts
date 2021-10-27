import "three/examples/jsm/utils/SkeletonUtils";

import THREE, { AnimationAction, AnimationMixer, Object3D } from "three";

import SpriteInstance from "../../renderer/game/SpriteInstance";
import { IScriptRunner } from "../iscript";
import { BwDATType, ImageDATType } from "../types/bwdat";
import { createIScriptRunner } from "../types/iscript";
import Grp3D from "./Grp3D";
import { ImageInstance } from "./ImageInstance";

export const createTitanImage3D = (
  bwDat: BwDATType,
  atlases: Grp3D[],
  createIScriptRunner: createIScriptRunner,
  onError: (msg: string) => void = () => {}
) => {
  return (image: number, sprite: SpriteInstance) => {
    if (!atlases[image]) {
      onError(`sd ${image} has no atlas, did you forget to load one?`);
      return null;
    }
    return new TitanImage3D(
      atlases[image],
      createIScriptRunner,
      bwDat.images[image],
      sprite
    );
  };
};

export class TitanImage3D extends Object3D implements ImageInstance {
  atlas: Grp3D;
  model: Object3D;
  sprite: SpriteInstance;
  imageDef: ImageDATType;
  iscript: IScriptRunner;
  mixer?: AnimationMixer;

  private times = new Float32Array();
  private action?: AnimationAction;
  _spriteScale: number;
  _zOff: number;

  constructor(
    atlas: Grp3D,
    createIScriptRunner: createIScriptRunner,
    imageDef: ImageDATType,
    sprite: SpriteInstance
  ) {
    super();
    this.atlas = atlas;
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

  setTeamColor(val: Color) {}
  setWarping(val: number) {}
  setCloaked(val: boolean) {}

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
