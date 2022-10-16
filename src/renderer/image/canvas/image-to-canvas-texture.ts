import { CanvasTexture, sRGBEncoding } from "three";

import { rgbToCanvas } from ".";

export const imageToCanvasTexture = (
    data: Uint8Array,
    width: number,
    height: number,
    format = "rgb"
) => {
    const canvas = rgbToCanvas( { data, width, height }, format );
    const texture = new CanvasTexture( canvas );
    texture.encoding = sRGBEncoding;
    return texture;
};
