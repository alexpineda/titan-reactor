import { AnimDds, Atlas, GrpSprite, UnitTileScale } from "common/types";
import { ImageDAT } from "common/bwdat/images-dat";

import { parseAnim, createDDSTexture } from "../formats";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
    buf.slice(ddsOffset, ddsOffset + size);


export const loadAnimAtlas = async (
    loadAnimBuffer: () => Promise<Buffer>,
    imageDef: ImageDAT,
    scale: Exclude<UnitTileScale, "SD">,
    grp: GrpSprite
): Promise<Atlas> => {

    const buf = await loadAnimBuffer();
    const [sprite] = parseAnim(buf);

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

    const teammask = await optionalLoad(sprite.maps.teamcolor);

    // FIXME: handle SD properly
    const uvScale = UnitTileScale.HD / scale;


    // const brightness = await optionalLoad(sprite.maps.bright);
    // const normal = await optionalLoad(sprite.maps.normal);
    // const specular = await optionalLoad(sprite.maps.specular);
    // const aoDepth = await optionalLoad(sprite.maps.ao_depth);
    // const emissive = await optionalLoad(sprite.maps.emissive);

    //FIXME: diffuse is used twice
    return {
        type: "anim",
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
        teammask
    };

}