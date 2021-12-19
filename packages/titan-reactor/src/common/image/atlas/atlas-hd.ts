import { CompressedTexture } from "three";

import { ImageDATType } from "../../bwdat/core/images-dat";
import { AnimTextureType, GrpFrameType, GRPInterface } from "../../types";
import { Anim, loadDDS } from "../formats";

export class AtlasHD implements GRPInterface {
  width = 0;
  height = 0;
  grpWidth = 0;
  grpHeight = 0;
  imageIndex = -1;
  frames: GrpFrameType[] = [];
  diffuse?: CompressedTexture;
  teamcolor?: CompressedTexture;

  async load({
    readAnim,
    readAnimHD2,
    imageDef,
  }: {
    readAnim: () => Promise<Buffer>;
    readAnimHD2: () => Promise<Buffer>;
    imageDef: Pick<ImageDATType, "index">;
    glbFileName?: string;
  }) {
    this.imageIndex = imageDef.index;

    // const buf = await readAnim();
    // const anim = Anim(buf);

    const buf2 = await readAnim();
    // const buf2 = await readAnimHD2();
    // const animHD2 = Anim(buf2);
    const anim = Anim(buf2);

    // const getBuf = (map: AnimTextureType) =>
    //   buf.slice(map.ddsOffset, map.ddsOffset + map.size);
    const getBuf2 = (map: AnimTextureType) =>
      buf2.slice(map.ddsOffset, map.ddsOffset + map.size);

    if (anim.sprite.maps?.diffuse) {
      const ddsBuf = getBuf2(anim.sprite.maps.diffuse);
      this.diffuse = await loadDDS(ddsBuf);
    }

    // if (anim.sprite.maps?.diffuse) {
    //   const ddsBuf = getBuf(anim.sprite.maps.diffuse);
    //   this.diffuse = loadDDS(ddsBuf);

    //   if (animHD2.sprite.maps?.diffuse) {
    //     const ddsBuf = getBuf2(animHD2.sprite.maps.diffuse);
    //     this.diffuse.mipmaps.push(loadDDS(ddsBuf).mipmaps[0]);
    //   }
    // } else {
    //   throw new Error("diffuse map required");
    // }

    if (anim.sprite.maps?.teamcolor) {
      const ddsBuf = getBuf2(anim.sprite.maps.teamcolor);
      this.teamcolor = await loadDDS(ddsBuf);
    }
    // if (anim.sprite.maps?.teamcolor) {
    //   const ddsBuf = getBuf(anim.sprite.maps.teamcolor);
    //   this.teamcolor = loadDDS(ddsBuf);

    //   if (animHD2.sprite.maps?.teamcolor) {
    //     const ddsBuf = getBuf2(animHD2.sprite.maps.teamcolor);
    //     this.teamcolor.mipmaps.push(loadDDS(ddsBuf).mipmaps[0]);
    //   }
    // }

    this.frames = anim.sprite.frames;
    this.width = anim.sprite.maps.diffuse.width;
    this.height = anim.sprite.maps.diffuse.height;
    this.grpWidth = anim.sprite.w;
    this.grpHeight = anim.sprite.h;

    // if (anim.sprite.maps.bright) {
    //   const ddsBuf = getBuf(anim.sprite.maps.bright);
    //   this.brightness = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.normal) {
    //   const ddsBuf = getBuf(anim.sprite.maps.normal);
    //   this.normal = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.specular) {
    //   const ddsBuf = getBuf(anim.sprite.maps.specular);
    //   this.specular = this._loadDDS(ddsBuf);
    // }

    // if (anim.sprite.maps.ao_depth) {
    //   const ddsBuf = getBuf(anim.sprite.maps.ao_depth);
    //   this.ao_depth = this._loadDDS(ddsBuf);
    // }
    return this;
  }

  dispose() {
    this.diffuse && this.diffuse.dispose();
    this.teamcolor && this.teamcolor.dispose();
  }
}
export default AtlasHD;
