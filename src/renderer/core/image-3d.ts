import "three/examples/jsm/utils/SkeletonUtils";

import { AnimationAction, AnimationMixer, Color, Mesh, MeshStandardMaterial, Object3D } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

import type { GltfAtlas, ImageDAT } from "common/types";
import type { Image, Unit } from ".";
import { standardMaterialToImage3DMaterial } from "@utils/material-utils";
import { Image3DMaterial } from "./image-3d-material";

/**
 * An image instance that may include a 3d model
 */
export class Image3D extends Object3D implements Image {
  atlas: GltfAtlas;
  model: Object3D;
  dat: ImageDAT;
  mixer?: AnimationMixer;

  #times = new Float32Array();
  #action?: AnimationAction;
  //@ts-ignore
  #material: Image3DMaterial;

  _zOff: number;

  // unused, only for 2d
  offsetX = 0;
  // unused, only for 2d
  offsetY = 0;

  override userData: {
    typeId: number;
    unit?: Unit;
  } = {
      typeId: -1,
      unit: undefined
    }

  constructor(
    atlas: GltfAtlas,
    imageDef: ImageDAT,
  ) {
    super();
    this.atlas = atlas;

    //TODO change this to use mesh as default, and use model.parent to access group
    // can only be done once we longer use SkeletonUtils.clone

    // @ts-ignore
    this.model = SkeletonUtils.clone(atlas.model);
    this.model.traverse((o) => {
      if (o instanceof Mesh) {
        this.model.userData.mesh = o;
        o.material = standardMaterialToImage3DMaterial(o.material);
        this.#material = o.material;
      }
    });

    this.add(this.model);

    if (this.model && this.atlas.animations.length) {
      this.#times = this.atlas.animations[0].tracks[0].times;
      this.mixer = new AnimationMixer(this);
      this.#action = this.mixer.clipAction(this.atlas.animations[0]);
      this.#action.play();
    }

    this.dat = imageDef;

    this._zOff = 0;

    this.setFrame(0);
  }

  changeImageType(): void {
    throw new Error("Method not implemented.");
  }

  get unitTileScale() {
    return this.atlas.unitTileScale;
  }

  setTeamColor(val: Color) {
    this.#material.teamColor = val;
  }

  setModifiers() { }
  resetModifiers() { }

  get frames() {
    return this.atlas.frames;
  }

  setFrame(frame: number) {
    if (!this.mixer) return;
    const effectiveFrame = this.atlas.fixedFrames[frame];
    this.mixer.setTime(this.#times[effectiveFrame]);

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
