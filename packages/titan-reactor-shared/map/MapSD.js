import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  RGBAFormat,
  sRGBEncoding,
  UnsignedByteType,
} from "three";
import { rgbToCanvas } from "../image/canvas";
import GrpSD from "../image/GrpSD";

export default class MapSD {
  static async renderCreepEdgesTexture(creepGrp, palette) {
    const stride = 37;
    const grpSD = new GrpSD();

    await grpSD.load(
      {
        readGrp: () => creepGrp,
        imageDef: {},
        palettes: [palette],
      },
      stride
    );

    //extend the grp by 1 tile for empty tile
    const newWidth = grpSD.width + 32;
    const extendedImage = new Uint8Array(newWidth * grpSD.height * 4);

    for (let i = 0; i < grpSD.width * grpSD.height * 4; i++) {
      // if (i % 3 === 0) {
      //   extendedImage[i] = 0;
      // }
      extendedImage[i + 32 * 4 * Math.ceil((i + 1) / (grpSD.width * 4))] =
        grpSD.texture.image.data[i];
    }

    const texture = new DataTexture(extendedImage, newWidth, grpSD.height);
    texture.flipY = true;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.wrapT = ClampToEdgeWrapping;
    texture.wrapS = ClampToEdgeWrapping;
    texture.encoding = sRGBEncoding;

    return {
      texture,
      width: newWidth,
      height: grpSD.height,
    };
  }

  static renderCreepTexture(
    palette,
    megatiles,
    minitiles,
    tilegroupU16,
    anisotropy
  ) {
    // const size = Math.ceil(Math.sqrt(13));
    const width = 14;
    const height = 1;

    const diffuse = new Uint8Array(width * height * 32 * 32 * 4, 255);
    // draw an extra tile a the beginning, otherwise this offset for creep should be 36(Uint16)
    let tileIndex = 36;

    for (let i = 0; i < 13; i++) {
      const mapX = i + 1;
      const mapY = 0;

      // const mapX = i % width;
      // const mapY = Math.floor(i / height);

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
                mapY * 32 * width * 32 +
                mapX * 32 +
                miniY * 8 * width * 32 +
                miniX * 8 +
                colorY * width * 32 +
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
      width * 32,
      height * 32,
      RGBAFormat,
      UnsignedByteType
    );
    texture.flipY = true;
    texture.encoding = sRGBEncoding;
    texture.anisotropy = anisotropy;
    return { texture, width: width * 32, height: height * 32 };
  }

  static async createMinimap(data, mapWidth, mapHeight) {
    const src = rgbToCanvas(
      {
        data,
        width: mapWidth * 32,
        height: mapHeight * 32,
      },
      "rgba"
    );

    //grab the context from your destination canvas
    const dst = document.createElement("canvas");
    dst.width = mapWidth * 2;
    dst.height = mapHeight * 2;
    const destCtx = dst.getContext("2d");
    destCtx.drawImage(src, 0, 0, dst.width, dst.height);

    const bitmap = await new Promise((res) => {
      createImageBitmap(destCtx.getImageData(0, 0, dst.width, dst.height)).then(
        (ib) => {
          res(ib);
        }
      );
    });

    return bitmap;
  }
}
