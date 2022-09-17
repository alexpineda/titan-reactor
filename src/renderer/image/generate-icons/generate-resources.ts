
import { WebGLRenderer } from "three";
import { renderIconsToDataURI } from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIconsToDataURI(
        renderer,
        56,
        56,
        dds
    );

    const getNext = () => {
        const next = renderIcon.next().value;
        if (!next) {
            throw new Error("No more icons");
        }
        return next;
    }

    return {
        "minerals": getNext(),
        "vespeneZerg": getNext(),
        "vespeneTerran": getNext(),
        "vespeneProtoss": getNext(),
        "zerg": getNext(),
        "terran": getNext(),
        "protoss": getNext(),
        "energy": getNext(),
    };
};