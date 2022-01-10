import { loadAnimAtlas } from "./load-anim-atlas";
import { GlbAtlas } from "./new-glb";
import { UnitTileScale } from "../../../renderer/core";

import { ImageDAT } from "../../bwdat/core/images-dat";
import loadGlb, { GlbResponse } from "../formats/load-glb";

export const loadGlbAtlas = async ({
    glbFileName,
    readAnim,
    imageDef,
    scale
}: {
    glbFileName: string;
    readAnim: () => Promise<Buffer>;
    imageDef: ImageDAT;
    scale: UnitTileScale
}) => {

    const anim = await loadAnimAtlas({ readAnim, imageDef, scale });

    try {
        const { model, animations } = (await loadGlb(
            glbFileName,
            null,
            imageDef.name
        )) as GlbResponse;

        const looseFrames = anim.frames.length % 17;

        const fixedFrames = anim.frames.map((f, i) => {
            if (imageDef.gfxTurns) {
                if (i < anim.frames.length - looseFrames) {
                    return Math.floor(i / 17);
                } else {
                    return Math.floor(i / 17) + (i % 17);
                }
            } else {
                return i;
            }
        });

        return new GlbAtlas(anim, model, animations, fixedFrames)
    } catch (e) {
    }

    return anim;
}
