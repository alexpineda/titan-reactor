
import { WebGLRenderer } from "three";
import { renderIconsToDataURI } from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIconsToDataURI(
        renderer,
        null,
        null,
        dds.filter((_, i) => i > 2 && i < 6),
        0.4
    );

    const getNext = () => {
        const next = renderIcon.next().value;
        if (!next) {
            throw new Error("No more icons");
        }
        return next;
    }

    return {
        "zerg": getNext(),
        "terran": getNext(),
        "protoss": getNext(),
    };
};