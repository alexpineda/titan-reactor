import React, { useCallback, useState } from "react";
import { FileDropZone } from "../FileDropZone";

//vx4 - minitile pointers 4x4, bit 0 = flippped, 7 high bits pointer
export function readTiles(data, isExtended) {
  const bytes = isExtended ? new Uint16Array(data) : new Uint32Array(data);

  let tileCount = bytes.byteLength / (isExtended ? 64 : 32);

  const resX = 1024; //Math.floor(window.document.body.clientWidth / 32) * 32;
  const resY = 1024; //Math.floor((tileCount * 32) / resX) * 32;

  return {
    bytes,
    tileCount,
    isExtended,
    resX,
    resY,
  };
}

export function MegatilesViewer({ minitiles }) {
  const [tileData, setTileData] = useState(null);

  const onFileDropped = (data, file) => {
    const ext = file.name.split(".").pop();
    if (ext !== "vx4" && ext !== "vx4ex") {
      return console.error("invalid file type expected vx4 or vx4ex", file);
    }
    const isExtended = ext === "vx4ex";

    setTileData(readTiles(data, isExtended));
  };

  const canvasRef = useCallback(
    (canvas) => {
      if (!tileData) return;

      const { bytes, tileCount, isExtended, resX, resY } = tileData;

      console.log("mega:start", bytes.byteLength);

      const ctx = canvas.getContext("2d");
      canvas.setAttribute("width", `${resX}px`);
      canvas.setAttribute("height", `${resY}px`);

      const imagedata = ctx.createImageData(resX, resY);
      const minitilesCanvas = document.getElementById("minitiles");

      for (let j = 0; j < bytes.byteLength; j++) {
        const mini = bytes[j];
        const flipped = mini & 1;
        const minitile = isExtended ? mini & 0xfffffffe : mini & 0xfffe;

        ctx.drawImage(minitilesCanvas, mini * 8, mini * 8, 8, 8, j * 8, j * 8);

        //get tile pos from minitile canvas, draw on megatile spot, inverse width if flipped
      }

      /*
        0x20 = 32
        const mini = tileset.megatiles.readUInt16LE(mega * 0x20 + (miniY * 4 + miniX) * 2)
        const flipped = mini & 1
        const minitile = mini & 0xfffe

        let color = 0
        if (flipped) {
            color = tileset.minitiles.readUInt8(minitile * 0x20 + colorY * 8 + (7 - colorX))
        } else {
            color = tileset.minitiles.readUInt8(minitile * 0x20 + colorY * 8 + colorX)
        }
    */

      ctx.putImageData(imagedata, 0, 0);
    },
    [tileData]
  );

  return (
    <FileDropZone onFileDropped={onFileDropped}>
      {minitiles && <canvas ref={canvasRef} id="megatiles"></canvas>}
      <p>Drop VX4 file here</p>
    </FileDropZone>
  );
}
