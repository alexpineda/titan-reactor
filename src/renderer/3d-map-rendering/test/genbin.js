// import React from "react";
// import { render } from "react-dom";
// import * as THREE from "three";
const { promises } = require("fs");

// import { cv5, vf4, vr4, vx4ex, wpe, mtxm } from "./files";

// const tiles = Buffer.from(mtxm);
// const tilegroup = Buffer.from(cv5);
// const megatiles = Buffer.from(vx4ex);
// const minitiles = Buffer.from(vf4);
// const minitilesFlags = Buffer.from(vr4);
// const palette = Buffer.from(wpe);

const load = async () => {
  const tiles = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/poly.mtxm"
  );

  const tilegroup = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/jungle.cv5"
  );

  const megatiles = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/jungle.vx4ex"
  );

  const minitiles = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/jungle.vr4"
  );

  const minitilesFlags = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/jungle.vf4"
  );

  const palette = await promises.readFile(
    "./src/renderer/3d-map-rendering/test/jungle.wpe"
  );

  const mapWidth = 128;
  const mapHeight = 128;

  const isExtended = true;

  const buf = Buffer.alloc(mapWidth * mapHeight * 8 * 8 * 4);

  for (let mapY = 0; mapY < mapHeight; mapY++) {
    for (let mapX = 0; mapX < mapWidth; mapX++) {
      const mapTile = mapY * mapWidth * 2 + mapX * 2;
      let tileId = 0;
      if (mapTile + 2 > tiles.byteLength) {
        tileId = 0;
      } else {
        tileId = tiles.readUInt16LE(mapTile);
      }

      const tileGroup = tileId >> 4;
      const groupIndex = tileId & 0xf;
      const groupOffset = tileGroup * 0x34 + groupIndex * 2 + 0x14;
      let megatileId = 0;
      if (groupOffset + 2 > tilegroup.byteLength) {
        megatileId = 0;
      } else {
        megatileId = tilegroup.readUInt16LE(groupOffset);
      }

      for (let miniY = 0; miniY < 4; miniY++) {
        for (let miniX = 0; miniX < 4; miniX++) {
          let mini;
          let minitile;
          let flipped;

          if (isExtended) {
            mini = megatiles.readUInt32LE(
              megatileId * 0x40 + (miniY * 4 + miniX) * 4
            );
            minitile = mini & 0xfffffffe;
          } else {
            mini = megatiles.readUInt16LE(
              megatileId * 0x20 + (miniY * 4 + miniX) * 2
            );
            minitile = mini & 0xfffe;
            const mapPos = (mapY * mapWidth + mapX + miniY * 4 + miniX) * 4;
            buf.writeUInt32LE(mini, mapPos);
          }
        }
      }
    }
  }

  promises.writeFile("out.map.bin", buf);
};

load();
//minitile vr4 (pixels), vf4 (metadata), 8x8 = 64 bytes
/*
  if (flipped) {
      color = tileset.minitiles.readUInt8(minitile * 0x20 + colorY * 8 + (7 - colorX))
  } else {
      color = tileset.minitiles.readUInt8(minitile * 0x20 + colorY * 8 + colorX)
  }
*/

//palette wpe
