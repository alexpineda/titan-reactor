
import { WebGLRenderer } from "three";
import { renderIconsToDataURI } from "./render-icons";

export default (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIconsToDataURI(
        renderer, 64, 64, dds, 0, "#ff0000"
    );

    const icons = [];
    for (const icon of renderIcon) {
        icons.push(icon);
    }

    return icons;
};

