
import { WebGLRenderer } from "three";
import { renderIconsToBlob } from "./render-icons";

export const generateRaceIcons = async (renderer: WebGLRenderer, dds: Uint8Array[]) => {
    const renderIcon = renderIconsToBlob(
        renderer,
        null,
        null,
        dds.filter((_, i) => i > 2 && i < 6),
        0.4,
    );

    const getNext = async () => {
        const next = (await renderIcon.next()).value;
        if (!next) {
            throw new Error("No more icons");
        }
        return next;
    }

    return {
        "zerg": await getNext(),
        "terran": await getNext(),
        "protoss": await getNext(),
    };
};