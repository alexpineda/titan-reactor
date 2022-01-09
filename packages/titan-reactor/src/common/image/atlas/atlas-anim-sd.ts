import { UnitTileScale } from "../../../renderer/core";
import {
  CompressedTexture,
  DataTexture,
  LuminanceFormat,
  UnsignedByteType,
} from "three";

import { AnimDds, GrpFrameType, GRPInterface } from "../../types";
import { createDDSTexture, Grp } from "../formats";

// Load anim files from the SD folder, with the difference being anim format and in team color bitmap encoding
export class AnimSD implements GRPInterface {
  unitTileScale = UnitTileScale.SD;
  textureWidth = 0;
  textureHeight = 0;
  spriteWidth = 0;
  spriteHeight = 0;
  imageIndex = -1;
  frames: GrpFrameType[] = [];
  diffuse?: CompressedTexture;
  teamcolor?: DataTexture;

  async load({
    readGrp,
    sdAnim: sprite,
  }: {
    readGrp: () => Promise<Buffer>;
    sdAnim: {
      buf: Buffer;
      maps: Record<string, AnimDds>;
      frames: GrpFrameType[];
    };
  }) {
    const grp = new Grp(await readGrp());
    const { w, h } = grp.maxDimensions();

    const getBuf = (map: AnimDds, offset = 0) =>
      sprite.buf.slice(map.ddsOffset + offset, map.ddsOffset + map.size);

    if (sprite.maps.diffuse) {
      const ddsBuf = getBuf(sprite.maps.diffuse);
      this.diffuse = await createDDSTexture(ddsBuf);
    } else {
      throw new Error("diffuse map required");
    }

    if (sprite.maps.teamcolor) {
      const ddsBuf = getBuf(sprite.maps.teamcolor, 4);

      this.teamcolor = new DataTexture(
        new Uint8Array(ddsBuf),
        sprite.maps.teamcolor.width,
        sprite.maps.teamcolor.height,
        LuminanceFormat,
        UnsignedByteType
      );
      this.teamcolor.needsUpdate = true;
    }

    this.frames = sprite.frames;
    this.textureWidth = sprite.maps.diffuse.width;
    this.textureHeight = sprite.maps.diffuse.height;
    this.spriteWidth = w;
    this.spriteHeight = h;
    return this;
  }

  dispose() {
    this.diffuse && this.diffuse.dispose();
    this.teamcolor && this.teamcolor.dispose();
  }
}
export default AnimSD;
