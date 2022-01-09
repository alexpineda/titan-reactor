import { UnitTileScale } from "../../../renderer/core";
import { CompressedTexture, Texture } from "three";

import { ImageDAT } from "../../bwdat/core/images-dat";
import { AnimDds, AnimSprite, GrpFrameType, GRPInterface } from "../../types";
import { parseAnim, createDDSTexture } from "../formats";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
    buf.slice(ddsOffset, ddsOffset + size);

// Load anim files as textures and frames

export default async load = ({
    readAnim,
    imageDef,
    scale
}: {
    readAnim: () => Promise<Buffer>;
    imageDef: ImageDAT;
    scale: Exclude<UnitTileScale, "SD">;
}) => {

    const buf = await readAnim();
    const [sprite] = parseAnim(buf) as AnimSprite[];

    if (!sprite.maps) {
        throw new Error("No sprite maps");
    }

    const ddsBuf = getBufDds(buf, sprite.maps.diffuse);
    const diffuse = await createDDSTexture(ddsBuf);

    let teamcolor;
    if (sprite.maps.teamcolor) {
        const ddsBuf = getBufDds(buf, sprite.maps.teamcolor);
        teamcolor = await createDDSTexture(ddsBuf);
    }

    return new Anim({
        this.frames = sprite.frames;
        this.textureWidth = sprite.maps.diffuse.width;
        this.textureHeight = sprite.maps.diffuse.height;
        this.spriteWidth = sprite.w;
        this.spriteHeight = sprite.h;
        this.unitTileScale = scale;
    })



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
}