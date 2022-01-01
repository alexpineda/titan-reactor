
import { strict as assert } from "assert";
import { WebGLRenderer } from "three";
import renderIcons from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIcons(
        renderer,
        null,
        null,
        dds.filter((_, i) => i > 2 && i < 6),
        0.4
    );

    const getNext = () => {
        const next = renderIcon.next().value;
        assert(next)
        return next;
    }

    return {
        "zerg": getNext(),
        "terran": getNext(),
        "protoss": getNext(),
    };
};