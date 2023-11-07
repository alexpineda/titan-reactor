import { WebGLRenderer } from "three";
import { renderIconsToBlob } from "./render-icons";

export const generateResourceIcons = async (
    renderer: WebGLRenderer,
    dds: Uint8Array[]
) => {
    const renderIcon = renderIconsToBlob( renderer, 56, 56, dds );

    const getNext = async () => {
        const next = await renderIcon.next().value;
        if ( !next ) {
            throw new Error( "No more icons" );
        }
        return next;
    };

    return {
        minerals: await getNext(),
        vespeneZerg: await getNext(),
        vespeneTerran: await getNext(),
        vespeneProtoss: await getNext(),
        zerg: await getNext(),
        terran: await getNext(),
        protoss: await getNext(),
        energy: await getNext(),
    };
};
