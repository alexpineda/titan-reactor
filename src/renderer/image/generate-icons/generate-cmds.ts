
import { WebGLRenderer } from "three";
import { renderIconsToBlob } from "./render-icons";

export const generateCommandIcons = async (renderer: WebGLRenderer, dds: Buffer[]) => {
    const renderIcon = renderIconsToBlob(
        renderer, 64, 64, dds, 0, "#ff0000"
    );

    const icons = [];
    for await (const icon of renderIcon) {
        icons.push(icon);
    }

    return icons;
};

