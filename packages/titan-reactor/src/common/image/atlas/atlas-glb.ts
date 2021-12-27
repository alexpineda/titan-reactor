import { AnimationClip, CubeTexture, Group } from "three";

import { ImageDAT } from "../../bwdat/core/images-dat";
import loadGlb, { GlbResponse } from "../formats/load-glb";
import Anim from "./atlas-anim";

// Atlas3D will include the HD image assets as well as an optional model property signifying there is a 3d model
export class Glb extends Anim {
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
    imageDef,
  }: {
    glbFileName?: string;
    readAnim: () => Promise<Buffer>;
    imageDef: Pick<ImageDAT, "name" | "index" | "gfxTurns">;
  }) {
    await super.load({ readAnim, imageDef });

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
    } catch (e) {
      console.error(e)
    }

    return this;
  }
}
export default Glb;