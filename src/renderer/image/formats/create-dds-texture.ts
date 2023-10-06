import {
    ClampToEdgeWrapping,
    CompressedPixelFormat,
    CompressedTexture,
    LinearFilter,
    SRGBColorSpace,
} from "three";

import { DDS } from "./parse-dds";

export const createDDSTexture = ( texDatas: DDS, colorSpace = SRGBColorSpace ) => {
    //ported from https://github.com/mrdoob/three.js/blob/45b0103e4dd9904b341d05ed991113f2f9edcc70/src/loaders/CompressedTextureLoader.js

    const texture = new CompressedTexture(
        texDatas.mipmaps,
        texDatas.width,
        texDatas.height,
        texDatas.format as CompressedPixelFormat
    );

    if ( texDatas.mipmapCount === 1 ) {
        texture.minFilter = LinearFilter;
    }

    texture.needsUpdate = true;

    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapT = ClampToEdgeWrapping;
    texture.wrapS = ClampToEdgeWrapping;
    texture.colorSpace = colorSpace;
    texture.flipY = false;
    return texture;
};
export default createDDSTexture;
