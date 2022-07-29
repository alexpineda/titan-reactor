import { Texture } from "three";
import { UnitTileScale, GrpSprite, ImageDAT, GlbAtlas, Atlas } from "common/types";
import { loadAnimAtlas } from "./load-anim-atlas";
import loadGlb from "../formats/load-glb";

export const loadGlbAtlas = async (glbFileName: string,
    loadAnimBuffer: () => Promise<Buffer>,
    imageDef: ImageDAT,
    scale: UnitTileScale,
    grp: GrpSprite,
    envMap: Texture
): Promise<GlbAtlas | Atlas> => {

    const anim = await loadAnimAtlas(loadAnimBuffer, imageDef, scale, grp);

    try {
        const { model, animations } = (await loadGlb(
            glbFileName,
            envMap,
            imageDef.name
        ));

        const looseFrames = anim.frames.length % 17;

        const fixedFrames = anim.frames.map((_, i) => {
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

        return {
            ...anim, model, animations, fixedFrames
        }
    } catch (e) {
    }

    return anim;
}
