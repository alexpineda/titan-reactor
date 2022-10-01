import { WrappedQuartileTextures } from "common/types";
import { DataTexture, RGBAFormat, sRGBEncoding, UnsignedByteType } from "three";
import range from "common/utils/range";

/**
 * Split up the SD diffuse map into quartiles
 */
export const createSdQuartiles = (
    mapWidth: number,
    mapHeight: number,
    diffuse: Uint8Array
): WrappedQuartileTextures => {

    const quartileWidth = 16; // in map tiles
    const quartileHeight = 16;
    const quartileWidthPx = quartileWidth * 32;
    const quartileHeightPx = quartileHeight * 32;
    const strideW = mapWidth / quartileWidth;
    const strideH = mapHeight / quartileHeight;

    return {
        waterMaskQuartiles: [],
        mapQuartiles: range(0, strideW).map(qx => range(0, strideH).map(qy => {
            const texture = new Uint8Array(quartileWidthPx * quartileHeightPx * 4);
            for (let y = 0; y < quartileHeightPx; y++) {
                for (let x = 0; x < quartileWidthPx; x++) {
                    const i = (y * quartileWidthPx + x) * 4;
                    const i2 = (y * mapWidth * 32 + x) * 4;
                    const mi = (qy * quartileHeightPx * mapWidth * 32 + qx * quartileWidthPx) * 4;
                    texture[i] = diffuse[i2 + mi];
                    texture[i + 1] = diffuse[i2 + mi + 1];
                    texture[i + 2] = diffuse[i2 + mi + 2];
                    texture[i + 3] = diffuse[i2 + mi + 3];
                }
            }
            const t = new DataTexture(
                texture,
                quartileWidth * 32,
                quartileHeight * 32,
                RGBAFormat,
                UnsignedByteType
            );
            t.flipY = true;
            t.encoding = sRGBEncoding;
            t.needsUpdate = true;
            return t;
        })),
        quartileWidth,
        quartileHeight,
    }
}