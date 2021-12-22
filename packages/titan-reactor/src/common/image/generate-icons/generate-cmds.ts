
import { WebGLRenderer } from "three";
import renderIcons from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIcons(
        renderer, 64, 64, dds, 0, "#ff0000"
    );

    const icons = [];
    for (const icon of renderIcon) {
        icons.push(icon);
    }

    return icons;
};

