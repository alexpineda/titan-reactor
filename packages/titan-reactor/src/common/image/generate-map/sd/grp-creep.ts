import { DataTexture, RGBAFormat, sRGBEncoding, UnsignedByteType } from "three";
import { PX_PER_TILE } from "./common";

// draw 13 creep tiles left to right
export const grpToCreepTexture = (
  palette: Uint8Array,
  megatiles: Uint32Array,
  minitiles: Uint8Array,
  tilegroupU16: Uint16Array,
  anisotropy: number
) => {
  const width = 13;
  const height = 1;

  const diffuse = new Uint8Array(
    width * height * PX_PER_TILE * PX_PER_TILE * 4  );
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
              mapY * PX_PER_TILE * width * PX_PER_TILE +
              mapX * PX_PER_TILE +
              miniY * 8 * width * PX_PER_TILE +
              miniX * 8 +
              colorY * width * PX_PER_TILE +
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
    width * PX_PER_TILE,
    height * PX_PER_TILE,
    RGBAFormat,
    UnsignedByteType
  );
  texture.flipY = true;
  texture.encoding = sRGBEncoding;
  texture.anisotropy = anisotropy;
  return { texture, width: width * PX_PER_TILE, height: height * PX_PER_TILE };
};
