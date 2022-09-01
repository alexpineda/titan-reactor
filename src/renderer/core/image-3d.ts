import "three/examples/jsm/utils/SkeletonUtils";

import { AnimationAction, AnimationMixer, Color, Mesh, Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

import type { GltfAtlas } from "common/types";
import type { ImageBase } from ".";
import { standardMaterialToImage3DMaterial } from "@utils/material-utils";
import { Image3DMaterial } from "./image-3d-material";
import gameStore from "@stores/game-store";

/**
 * An image instance that may include a 3d model
 */
export class Image3D extends Object3D implements ImageBase {
  isImage3d = true;
  isInstanced = false;

  atlas: GltfAtlas;
  mixer?: AnimationMixer;
  model: GltfAtlas["model"];

  #frame = 0;
  #times = new Float32Array();
  #action?: AnimationAction;
  //@ts-ignore
  #material: Image3DMaterial;
  _zOff: number;

  constructor(
    atlas: GltfAtlas,
  ) {
    super();
    this.atlas = atlas;

    // @ts-ignore
    this.model = SkeletonUtils.clone(atlas.model);
    this.#material = standardMaterialToImage3DMaterial(atlas.mesh.material);
    this.model.traverse((o: Object3D) => {
      if (o instanceof Mesh) {
        o.material = this.#material;
      }
    });

    this.add(this.model);

    if (this.model && this.atlas.animations.length) {
      this.#times = this.atlas.animations[0].tracks[0].times;
      this.mixer = new AnimationMixer(this);
      this.#action = this.mixer.clipAction(this.atlas.animations[0]);
      this.#action.play();
    }

    this._zOff = 0;
    this.setFrame(0);

    this.matrixAutoUpdate = false;
  }

  get dat() {
    return gameStore().assets!.bwDat.images[this.atlas.imageIndex];
  }

  updateImageType(): void {
    throw new Error("Method not implemented.");
  }

  get unitTileScale() {
    return this.atlas.unitTileScale;
  }

  setTeamColor(val: Color) {
    this.#material.teamColor = val;
  }

  setModifiers() {
  }
  resetModifiers() { }

  get frames() {
    return this.atlas.frames;
  }

  setFrame(frame: number) {
    if (!this.mixer) return;
    this.#frame = frame;
    this.mixer.setTime(this.#times[this.frame]);
  }

  setEmissive(val: number) {
    this.#material.emissiveIntensity = val;
  }

  get frame() {
    return this.atlas.fixedFrames[this.#frame];
  }

}
