import { Mesh, Object3D, Texture } from "three";
import { ImageDAT, GltfAtlas, AnimAtlas } from "common/types";
import loadGlb from "../formats/load-glb";

export const loadGlbAtlas = async (
    glbFileName: string,
    anim: AnimAtlas,
    imageDef: ImageDAT,
    envMap: Texture,
): Promise<GltfAtlas | AnimAtlas> => {

    try {
        const { model, animations } = (await loadGlb(
            glbFileName,
            envMap,
            imageDef.name
        ));

        let mesh: GltfAtlas["mesh"] | undefined;
        model.traverse((o: Object3D) => {
            if (o instanceof Mesh) {
                if (mesh) {
                    throw new Error("Multiple meshes found in glb");
                }
                mesh = o;
            }
        });
        if (mesh === undefined) {
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
            ...anim, model, mesh, animations, fixedFrames, isGLTF: true
        }
    } catch (e) {
    }

    return anim;
}
