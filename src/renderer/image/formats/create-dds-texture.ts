import {
    ClampToEdgeWrapping,
    CompressedTexture,
    LinearFilter,
    sRGBEncoding,
} from "three";

import { DDS } from "./parse-dds";

export const createDDSTexture = ( texDatas: DDS, encoding = sRGBEncoding ) => {
    //ported from https://github.com/mrdoob/three.js/blob/45b0103e4dd9904b341d05ed991113f2f9edcc70/src/loaders/CompressedTextureLoader.js

    const texture = new CompressedTexture(
        texDatas.mipmaps,
        texDatas.width,
        texDatas.height
    );

    if ( texDatas.mipmapCount === 1 ) {
        texture.minFilter = LinearFilter;
    }

    texture.format = texDatas.format;
    texture.needsUpdate = true;

    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapT = ClampToEdgeWrapping;
    texture.wrapS = ClampToEdgeWrapping;
    texture.encoding = encoding;
    texture.flipY = false;
    return texture;
};
export default createDDSTexture;
