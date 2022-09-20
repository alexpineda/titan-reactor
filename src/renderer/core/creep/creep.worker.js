import {
  dirs,
  creepRandomTileIndices,
  creepEdgeFrameIndex,
} from "./creepShared";

// creep calculations ported from openbw

onmessage = function ({ data }) {
  const { buffer, frame, mapWidth, mapHeight } = data;

  const creepBuffer = new Uint16Array(buffer.buffer);
  // for shaders
  const creepData = new Uint8Array(mapWidth * mapHeight);
  const edgesData = new Uint8Array(mapWidth * mapHeight);

  // for canvas minimap
  const imageData = new ImageData(mapWidth, mapHeight);

  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      const tilePos = y * mapWidth + x;
      const bufPos = tilePos * 2 + 1;
      if (creepBuffer[bufPos] & 0x40) {
        creepData[tilePos] = creepRandomTileIndices[tilePos] + 1;
      } else {
        let creepIndex = 0;

        for (let i = 0; i < 9; i++) {
          const offX = dirs[i].x + x;
          const offY = dirs[i].y + y;

          if (offX >= mapWidth) continue;
          if (offY >= mapHeight) continue;
          if (offX < 0) continue;
          if (offY < 0) continue;

          const offBufTilePos = (offY * mapWidth + offX ) *2 +1;

          if (creepBuffer[offBufTilePos] & 0x40) {
            creepIndex |= 1 << i;
          } else {
            const creepFrame = creepEdgeFrameIndex[creepIndex];

            if (creepFrame) {
              edgesData[tilePos] = creepFrame;
            }
          }
        }
      }

      const pos = tilePos * 4;
      if (creepData[tilePos]) {
        imageData.data[pos] = 82;
        imageData.data[pos + 1] = 60;
        imageData.data[pos + 2] = 65;
        imageData.data[pos + 3] = 200;
      } else {
        imageData.data[pos + 3] = 0;
      }
    }
  }

  postMessage(
    {
      frame,
      creepData,
      edgesData,
      imageData,
    },
    [creepData.buffer, edgesData.buffer, imageData.data.buffer]
  );
};
