
import { WebGLRenderer } from "three";
import { strict as assert } from "assert";
import renderIcons from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIcons(
        renderer,
        56,
        56,
        dds
    );

    const getNext = () => {
        const next = renderIcon.next().value;
        assert(next)
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