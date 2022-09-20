import { AnimDds, AnimAtlas, UnitTileScale } from "common/types";

import { parseAnim, createDDSTexture } from "../formats";
import { LinearEncoding, TextureEncoding } from "three";
import { Janitor } from "@utils/janitor";

const getBufDds = (buf: Buffer, { ddsOffset, size }: AnimDds) =>
    buf.slice(ddsOffset, ddsOffset + size);


export const loadAnimAtlas = async (
    buf: Buffer,
    imageIndex: number,
    scale: Exclude<UnitTileScale, "SD">,
): Promise<AnimAtlas> => {
    const janitor = new Janitor("loadAnimAtlas");

    const [sprite] = parseAnim(buf);

    if (!sprite.maps) {
        throw new Error("No sprite maps");
    }

    const ddsBuf = getBufDds(buf, sprite.maps.diffuse);
    const diffuse = janitor.mop(await createDDSTexture(ddsBuf), "diffuse");

    const optionalLoad = async (layer: AnimDds, encoding?: TextureEncoding) => {
        if (layer === undefined) {
            return undefined;
        }
        const ddsBuf = getBufDds(buf, layer);
        return janitor.mop(await createDDSTexture(ddsBuf, encoding), "layer");
    }

    const teammask = await optionalLoad(sprite.maps.teamcolor);

    // FIXME: handle SD properly
    const uvScale = UnitTileScale.HD / scale;


    // const brightness = await optionalLoad(sprite.maps.bright);
    // const normal = await optionalLoad(sprite.maps.normal);
    // const specular = await optionalLoad(sprite.maps.specular);
    // const aoDepth = await optionalLoad(sprite.maps.ao_depth);
    const emissive = scale === UnitTileScale.HD ? await optionalLoad(sprite.maps.emissive, LinearEncoding) : undefined;

    return {
        isHD: scale === UnitTileScale.HD,
        isHD2: scale === UnitTileScale.HD2,
        diffuse,
        imageIndex,
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
        teammask,
        hdLayers: {
            emissive
        },
        dispose() {
            janitor.dispose();
        }
    };

}