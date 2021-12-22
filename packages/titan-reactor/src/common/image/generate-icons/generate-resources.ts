
import { WebGLRenderer } from "three";
import renderIcons from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIcons(
        renderer,
        56,
        56,
        dds
    );

    return {
        "minerals": renderIcon.next().value,
        "vespeneZerg": renderIcon.next().value,
        "vespeneTerran": renderIcon.next().value,
        "vespeneProtoss": renderIcon.next().value,
        "zerg": renderIcon.next().value,
        "terran": renderIcon.next().value,
        "protoss": renderIcon.next().value,
        "energy": renderIcon.next().value,
    };
};