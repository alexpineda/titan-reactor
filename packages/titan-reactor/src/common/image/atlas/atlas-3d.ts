import { AnimationClip, CubeTexture, Group } from "three";

import { ImageDATType } from "../../bwdat/core/images-dat";
import loadGlb, { GlbResponse } from "../formats/load-glb";
import AtlasHD from "./atlas-hd";

// Atlas3D will include the HD image assets as well as an optional model property signifying there is a 3d model
export class Atlas3D extends AtlasHD {
  envMap: CubeTexture | null;
  model?: Group;
  animations: AnimationClip[] = [];
  fixedFrames: number[] = [];

  constructor(envMap = null) {
    super();
    this.envMap = envMap;
  }

  override async load({
    glbFileName,
    readAnim,
    readAnimHD2,
    imageDef,
  }: {
    glbFileName?: string;
    readAnim: () => Promise<Buffer>;
    readAnimHD2: () => Promise<Buffer>;
    imageDef: Pick<ImageDATType, "name" | "index" | "gfxTurns">;
  }) {
    await super.load({ readAnim, readAnimHD2, imageDef });

    if (!glbFileName) return this;

    try {
      const { model, animations } = (await loadGlb(
        glbFileName,
        this.envMap,
        imageDef.name
      )) as GlbResponse;
      this.model = model;
      this.animations = animations;

      const looseFrames = this.frames.length % 17;

      this.fixedFrames = this.frames.map((f, i) => {
        if (imageDef.gfxTurns) {
          if (i < this.frames.length - looseFrames) {
            return Math.floor(i / 17);
          } else {
            return Math.floor(i / 17) + (i % 17);
          }
        } else {
          return i;
        }
      });
    } catch (e) {}

    return this;
  }
}
export default Atlas3D;
