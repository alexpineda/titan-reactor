import { WrappedTexture } from "../../../types";
import { DataTexture, RGBAFormat, sRGBEncoding, UnsignedByteType } from "three";
import { PX_PER_TILE_SD } from "./common";

const width = 13;
const height = 1;

// draw 13 creep tiles left to right
export const grpToCreepTexture = (
  palette: Uint8Array,
  megatiles: Uint32Array,
  minitiles: Uint8Array,
  tilegroupU16: Uint16Array,
): WrappedTexture => {


  const diffuse = new Uint8Array(
    width * height * PX_PER_TILE_SD * PX_PER_TILE_SD * 4);
  diffuse.fill(255);
  // draw an extra tile a the beginning, otherwise this offset for creep should be 36(Uint16)
  let tileIndex = 37;

  for (let i = 0; i < 13; i++) {
    const mapX = i;
    const mapY = 0;

    for (let miniY = 0; miniY < 4; miniY++) {
      for (let miniX = 0; miniX < 4; miniX++) {
        const mini =
          megatiles[tilegroupU16[tileIndex] * 16 + (miniY * 4 + miniX)];
        const minitile = mini & 0xfffffffe;
        const flipped = mini & 1;

        for (let colorY = 0; colorY < 8; colorY++) {
          for (let colorX = 0; colorX < 8; colorX++) {
            let color = 0;
            if (flipped) {
              color = minitiles[minitile * 0x20 + colorY * 8 + (7 - colorX)];
            } else {
              color = minitiles[minitile * 0x20 + colorY * 8 + colorX];
            }

            const r = palette[color * 4];
            const g = palette[color * 4 + 1];
            const b = palette[color * 4 + 2];

            const pixelPos =
              mapY * PX_PER_TILE_SD * width * PX_PER_TILE_SD +
              mapX * PX_PER_TILE_SD +
              miniY * 8 * width * PX_PER_TILE_SD +
              miniX * 8 +
              colorY * width * PX_PER_TILE_SD +
              colorX;

            diffuse[pixelPos * 4] = r;
            diffuse[pixelPos * 4 + 1] = g;
            diffuse[pixelPos * 4 + 2] = b;
            diffuse[pixelPos * 4 + 3] = 255;
          }
        }
      }
    }
    tileIndex++;
  }

  const texture = new DataTexture(
    diffuse,
    width * PX_PER_TILE_SD,
    height * PX_PER_TILE_SD,
    RGBAFormat,
    UnsignedByteType
  );
  texture.flipY = true;
  texture.encoding = sRGBEncoding;
  texture.needsUpdate = true;
  return { texture, width: width * PX_PER_TILE_SD, height: height * PX_PER_TILE_SD };
};
