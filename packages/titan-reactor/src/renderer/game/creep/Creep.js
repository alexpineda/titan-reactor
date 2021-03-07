import Worker from "./creep.worker.js";

export default class Creep {
  constructor(
    mapWidth,
    mapHeight,
    creepValuesTexture,
    creepEdgesValuesTexture
  ) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.creepValuesTexture = creepValuesTexture;
    this.creepEdgesValuesTexture = creepEdgesValuesTexture;

    this.worker = new Worker();
    this._lastFrame = 0;
  }

  /**
   *
   * @param {CreepBW} creepBW
   */
  generate(creepBW, frame) {
    const msg = {
      buffer: new Uint8Array(creepBW.buffer),
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      frame,
    };

    this.worker.postMessage(msg, [msg.buffer.buffer]);

    this.worker.onmessage = ({ data }) => {
      const { creepData, edgesData, frame } = data;
      if (frame < this._lastFrame) return;
      this._lastFrame = frame;

      this.creepValuesTexture.image.data = creepData;
      this.creepValuesTexture.needsUpdate = true;

      this.creepEdgesValuesTexture.image.data = edgesData;
      this.creepEdgesValuesTexture.needsUpdate = true;
    };
    // for (let x = 0; x < this.mapWidth; x++) {
    //   for (let y = 0; y < this.mapHeight; y++) {
    //     const tilePos = y * this.mapWidth + x;
    //     if (creepBW.hasCreepAt(tilePos)) {
    //       this.creep[tilePos] = creepRandomTileIndices[tilePos] + 1;
    //     } else {
    //       let creepIndex = 0;

    //       for (let i = 0; i < 9; i++) {
    //         const offX = dirs[i].x + x;
    //         const offY = dirs[i].y + y;

    //         if (offX >= this.mapWidth) continue;
    //         if (offY >= this.mapHeight) continue;
    //         if (offX < 0) continue;
    //         if (offY < 0) continue;

    //         const offTilePos = offY * this.mapWidth + offX;

    //         if (creepBW.hasCreepAt(offTilePos)) {
    //           creepIndex |= 1 << i;
    //         } else {
    //           const creepFrame = creepEdgeFrameIndex[creepIndex];

    //           if (creepFrame) {
    //             this.edges[tilePos] = creepFrame;
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
  }

  dispose() {
    this.worker.terminate();
  }
}
