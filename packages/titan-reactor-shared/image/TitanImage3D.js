import { Object3D, AnimationMixer } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

export const createTitanImage3D = (
  bwDat,
  atlases,
  createIScriptRunner,
  onError = () => {}
) => {
  return (image, sprite) => {
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

export default class TitanImage3D extends Object3D {
  constructor(atlas, createIScriptRunner, imageDef, sprite) {
    super();
    this.atlas = atlas;
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

    if (this.model && this.animations.length) {
      this.times = this.animations[0].tracks[0].times;
      this.mixer = new AnimationMixer(this);
      this.action = this.mixer.clipAction(this.animations[0]);
      this.action.play();
    }

    this.sprite = sprite;
    this._spriteScale = 128;
    this.imageDef = imageDef;
    this.iscript = createIScriptRunner(this, imageDef);

    this.setFrame(0, false);
  }

  setTeamColor(val) {}
  setWarping(val) {}

  get frames() {
    return this.atlas.frames;
  }

  get animations() {
    return this.atlas.animations;
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
