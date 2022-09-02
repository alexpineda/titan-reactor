import {
    DataTexture,
    LuminanceFormat,
    UnsignedByteType,
} from "three";

import { AnimDds, AnimFrame, ImageDAT, UnitTileScale } from "common/types";
import { createDDSTexture, Grp } from "../formats";

export const loadAnimSdAtlas = async ({
    readGrp,
    sdAnim: sprite,
    imageDef
}: {
    readGrp: () => Promise<Buffer>;
    sdAnim: {
        buf: Buffer;
        maps: Record<string, AnimDds>;
        frames: AnimFrame[];
    };
    imageDef: ImageDAT;
}) => {
    const grp = new Grp(await readGrp());
    const { w, h } = grp.maxDimensions();

    const getBuf = (map: AnimDds, offset = 0) =>
        sprite.buf.slice(map.ddsOffset + offset, map.ddsOffset + map.size);

    const ddsBuf = getBuf(sprite.maps.diffuse);
    const diffuse = await createDDSTexture(ddsBuf);

    let teammask;
    if (sprite.maps.teamcolor) {
        const ddsBuf = getBuf(sprite.maps.teamcolor, 4);

        teammask = new DataTexture(
            new Uint8Array(ddsBuf),
            sprite.maps.teamcolor.width,
            sprite.maps.teamcolor.height,
            LuminanceFormat,
            UnsignedByteType
        );
        teammask.needsUpdate = true;
    }

    return {
        diffuse,
        grp,
        imageIndex: imageDef.index,
        frames: sprite.frames,
        textureWidth: sprite.maps.diffuse.width,
        textureHeight: sprite.maps.diffuse.height,
        spriteWidth: w,
        spriteHeight: h,
        unitTileScale: UnitTileScale.SD,
        teammask
    };
}
