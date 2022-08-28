import { Mesh, Object3D, Texture } from "three";
import { UnitTileScale, GrpSprite, ImageDAT, GltfAtlas, Atlas } from "common/types";
import { loadAnimAtlas } from "./load-anim-atlas";
import loadGlb from "../formats/load-glb";

export const loadGlbAtlas = async (glbFileName: string,
    loadAnimBuffer: () => Promise<Buffer>,
    imageDef: ImageDAT,
    scale: UnitTileScale,
    grp: GrpSprite,
    envMap: Texture
): Promise<GltfAtlas | Atlas> => {

    const anim = await loadAnimAtlas(loadAnimBuffer, imageDef, scale, grp);

    try {
        const { model, animations } = (await loadGlb(
            glbFileName,
            envMap,
            imageDef.name
        ));

        let _mesh: GltfAtlas["model"] | undefined;
        model.traverse((o: Object3D) => {
            if (o instanceof Mesh) {
                if (_mesh) {
                    throw new Error("Multiple meshes found in glb");
                }
                _mesh = o;
            }
        });
        if (_mesh === undefined) {
            throw new Error("No meshes found in glb");
        }

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
