import React, { useCallback, useState } from "react";
import { FileDropZone } from "../FileDropZone";

//vr4 - 64 bytes per tile
export function readTiles(data) {
  const bytes = new Uint8Array(data);
  let tileCount = bytes.byteLength / 64;

  const resX = Math.floor(window.document.body.clientWidth / 8) * 8;
  const resY = Math.floor((tileCount * 8) / resX) * 8;

  return {
    bytes,
    resX,
    resY,
    tileCount,
  };
}

//read at tile * 64 for 64 bytes, populate with palette color
export function readMiniTile(tile, buffer, palette) {
  const minitile = [];
  for (let j = 0; j < 64; j++) {
    const i = j + tile * 64;
    const paletteIndex = buffer[i];
    minitile.push(palette[paletteIndex]);
  }
  return minitile;
}

export function MinitilesViewer({ palette = [], setMinitiles }) {
  const [tileData, setTileData] = useState(null);

  const onFileDropped = (data, file) => {
    const ext = file.name.split(".").pop();
    if (ext !== "vr4") {
      return console.error("invalid file type expected vr4", file);
    }
    setTileData(readTiles(data));
  };

  const canvasRef = useCallback(
    (canvas) => {
      if (!tileData || palette.length === 0) return;
      const { resX, resY, bytes, tileCount } = tileData;

      const ctx = canvas.getContext("2d");
      canvas.setAttribute("width", `${resX}px`);
      canvas.setAttribute("height", `${resY}px`);

      const imagedata = ctx.createImageData(resX, resY);

      console.log("start", tileData);

      // 1 byte per pallette index, 64 bytes per tile
      const tilePerRow = resX / 8;

      for (let j = 0; j < bytes.byteLength; j++) {
        //every tile row, increment by image res, loop by tile res, add y res

        const i =
          ((j % 8) + //pixel x
          (Math.floor(j / 8) % 8) * resX + //pixel y
          (Math.floor(j / 64) % tilePerRow) * 8 + //row x
            Math.floor(j / (resX * 8)) * 8 * resX) * //row y
          4;

        const paletteIndex = bytes[j];
        const [r, g, b] = palette[paletteIndex];

        imagedata.data[i] = r;
        imagedata.data[i + 1] = g;
        imagedata.data[i + 2] = b;
        imagedata.data[i + 3] = 255;
        // if (j > 7) break;
      }

      // for (let x = 0; x < resX; x += 8) {
      //   for (let y = 0; y < resY; y += 8) {
      //     const i = (x + y * resX) * 4;
      //     imagedata.data[i] = 255;
      //     imagedata.data[i + 1] = 0;
      //     imagedata.data[i + 2] = 0;
      //     imagedata.data[i + 3] = 255;
      //   }
      // }

      ctx.putImageData(imagedata, 0, 0);
      setMinitiles({ ...tileData, ctx, canvas });
    },
    [tileData, palette.length]
  );

  return (
    <FileDropZone onFileDropped={onFileDropped}>
      {palette.length && <canvas ref={canvasRef} id="minitiles"></canvas>}
      <p>Drop VR4 file here</p>
    </FileDropZone>
  );
}
