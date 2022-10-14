import { Mesh, Object3D, Texture } from "three";
import { ImageDAT, GltfAtlas, AnimFrame } from "common/types";
import loadGlb from "../formats/load-glb";


export const loadGlbAtlas = async (
    glbFileName: string,
    frames: AnimFrame[],
    imageDef: ImageDAT,
    envMap: Texture | null,
): Promise<Partial<GltfAtlas> | null> => {

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
        model.children[0].position.setScalar(0);

        const looseFrames = frames.length % 17;

        const fixedFrames = frames.map((_, i) => {
            if (imageDef.gfxTurns) {
                if (i < frames.length - looseFrames) {
                    return Math.floor(i / 17);
                } else {
                    return Math.floor(i / 17) + (i % 17);
                }
            } else {
                return i;
            }
        });

        return {
            model, mesh, animations, fixedFrames, isGLTF: true
        }
    } catch (e) {
    }

    return null;
}
