import { UnitTileScale } from "../../../renderer/core";

import { AnimAtlas } from "./anim-atlas"
import { ImageDAT } from "../../bwdat/images-dat";
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

    const optionalLoad = async (layer: any) => {
        if (layer === undefined) {
            return undefined;
        }
        const ddsBuf = getBufDds(buf, sprite.maps.teamcolor);
        return await createDDSTexture(ddsBuf);
    }

    const teamcolor = await optionalLoad(sprite.maps.teamcolor);

    // @todo handle SD properly
    const uvScale = UnitTileScale.HD / scale;


    // const brightness = await optionalLoad(sprite.maps.bright);
    // const normal = await optionalLoad(sprite.maps.normal);
    // const specular = await optionalLoad(sprite.maps.specular);
    // const aoDepth = await optionalLoad(sprite.maps.ao_depth);
    // const emissive = await optionalLoad(sprite.maps.emissive);

    //FIXME: diffuse is used twice
    return new AnimAtlas(
        diffuse,
        {
            diffuse,
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

}