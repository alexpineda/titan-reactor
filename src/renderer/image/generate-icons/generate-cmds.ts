
import { WebGLRenderer } from "three";
import { renderIconsToBlobOffscreen } from "./render-icons-offscreen";

export const generateCommandIcons = async (renderer: WebGLRenderer, dds: Uint8Array[]) => {
    const renderIcon = renderIconsToBlobOffscreen(
        renderer, 64, 64, dds, "#ff0000"
    );

    const icons = [];
    for await (const icon of renderIcon) {
        icons.push(icon);
    }

    return icons;
};

