import { Grp } from "bw-chk-modified/grp";
import { CompressedTexture, DataTexture, LuminanceFormat, UnsignedByteType } from "three";

import { AnimTextureType, GrpFrameType, GRPInterface } from "../types";
import { loadDDS } from "./formats";

/**
 * SD via Anim
 */
export class GrpSD implements GRPInterface {
  width = 0;
  height = 0;
  grpWidth? = 0;
  grpHeight? = 0;
  imageIndex = -1;
  frames?: GrpFrameType[] = [];
  diffuse?: CompressedTexture;
  teamcolor?: DataTexture;

  async load({
    readGrp,
    sdAnim: sprite,
  }: {
    readGrp: () => Promise<Buffer>;
    sdAnim: {
      buf: Buffer;
      maps: Record<string, AnimTextureType>;
      frames: GrpFrameType[];
    };
  }) {
    const grp = new Grp(await readGrp(), Buffer);
    const { w, h } = grp.maxDimensions();

    const getBuf = (map: AnimTextureType, offset = 0) =>
      sprite.buf.slice(map.ddsOffset + offset, map.ddsOffset + map.size);

    if (sprite.maps.diffuse) {
      const ddsBuf = getBuf(sprite.maps.diffuse);
      this.diffuse = loadDDS(ddsBuf);
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
    }

    this.frames = sprite.frames;
    this.width = sprite.maps.diffuse.width;
    this.height = sprite.maps.diffuse.height;
    this.grpWidth = w;
    this.grpHeight = h;
    return this;
  }
}
export default GrpSD;