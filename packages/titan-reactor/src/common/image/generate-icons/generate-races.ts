
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

    return {
        "zerg": renderIcon.next().value,
        "terran": renderIcon.next().value,
        "protoss": renderIcon.next().value,
    };
};