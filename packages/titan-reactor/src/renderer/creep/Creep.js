import Worker from "./creep.worker.js";

// calculate creep tiles using webworkers
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
    this.creepImageData = new ImageData(mapWidth, mapHeight);

    this.worker = new Worker();
    this.worker.onmessage = ({ data }) => {
      const { creepData, edgesData, imageData, frame } = data;
      if (frame < this._lastFrame) return;
      this._lastFrame = frame;

      this.creepValuesTexture.image.data = creepData;
      this.creepEdgesValuesTexture.image.data = edgesData;

      //for minimap
      this.creepImageData = imageData;
    };
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
  }

  dispose() {
    this.worker.terminate();
  }
}
