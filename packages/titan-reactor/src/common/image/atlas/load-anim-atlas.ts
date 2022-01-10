import { UnitTileScale } from "../../../renderer/core";

import { AnimAtlas } from "./anim-atlas"
import { ImageDAT } from "../../bwdat/core/images-dat";
import { AnimDds, AnimSprite, GrpType } from "../../types";
import { parseAnim, createDDSTexture } from "../formats";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
    buf.slice(ddsOffset, ddsOffset + size);

export const loadAnimAtlas = async (
    loadAnimBuffer: () => Promise<Buffer>,
    imageDef: ImageDAT,
    scale: Exclude<UnitTileScale, "SD">,
    grp: GrpType
) => {

    const buf = await loadAnimBuffer();
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

    // only HD is accurate in terms of frame and spriteWidth data
    // @todo handle SD properly
    const uvScale = UnitTileScale.HD / scale;

    return new AnimAtlas(
        diffuse,
        {
            grp,
            imageIndex: imageDef.index,
            frames: sprite.frames.map(frame => ({
                x: frame.x / uvScale,
                y: frame.y / uvScale,
                w: frame.w / uvScale,
                h: frame.h / uvScale,
                xoff: frame.xoff / uvScale,
                yoff: frame.yoff / uvScale,
            })),
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