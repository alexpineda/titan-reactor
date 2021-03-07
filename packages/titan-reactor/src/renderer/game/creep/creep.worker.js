import {
  dirs,
  creepRandomTileIndices,
  creepEdgeFrameIndex,
} from "./creepShared";

onmessage = function ({ data }) {
  const { buffer, frame, mapWidth, mapHeight } = data;

  const creepData = new Uint8Array(mapWidth * mapHeight);
  const edgesData = new Uint8Array(mapWidth * mapHeight);

  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      const tilePos = y * mapWidth + x;
      if (buffer[tilePos]) {
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

          const offTilePos = offY * mapWidth + offX;

          if (buffer[offTilePos]) {
            creepIndex |= 1 << i;
          } else {
            const creepFrame = creepEdgeFrameIndex[creepIndex];

            if (creepFrame) {
              edgesData[tilePos] = creepFrame;
            }
          }
        }
      }
    }
  }

  postMessage(
    {
      frame,
      creepData,
      edgesData,
    },
    [creepData.buffer, edgesData.buffer]
  );
};
