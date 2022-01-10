import { UnitTileScale } from "../../../renderer/core";

import { NewAnimAtlas } from "./new-anim"
import { ImageDAT } from "../../bwdat/core/images-dat";
import { AnimDds, AnimSprite } from "../../types";
import { parseAnim, createDDSTexture } from "../formats";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
    buf.slice(ddsOffset, ddsOffset + size);

export const loadAnimAtlas = async ({
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

    return new NewAnimAtlas(
        diffuse,
        {
            imageIndex: imageDef.index,
            frames: sprite.frames,
            textureWidth: sprite.maps.diffuse.width,
            textureHeight: sprite.maps.diffuse.height,
            spriteWidth: sprite.w,
            spriteHeight: sprite.h,
            unitTileScale: scale,
        }, teamcolor);



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