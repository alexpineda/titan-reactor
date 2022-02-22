import { Texture } from "three";
import { TilesBufferView } from "../buffer-view";

//@ts-ignore
import Worker from "./creep.worker.js";

export default class Creep {
  mapWidth: number;
  mapHeight: number;
  creepValuesTexture: Texture;
  creepEdgesValuesTexture: Texture;
  creepImageData: ImageData;

  private _lastFrame = 0;

  constructor(
    mapWidth: number,
    mapHeight: number,
    creepValuesTexture: Texture,
    creepEdgesValuesTexture: Texture
  ) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.creepValuesTexture = creepValuesTexture;
    this.creepEdgesValuesTexture = creepEdgesValuesTexture;
    this.creepImageData = new ImageData(mapWidth, mapHeight);

    // @ts-ignore
    this.worker = new Worker();
    // @ts-ignore
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

  generate(tiles: TilesBufferView, frame: number) {
    const msg = {
      buffer: tiles.copy(),
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      frame,
    };

    //@ts-ignore
    this.worker.postMessage(msg, [msg.buffer.buffer]);
  }

  dispose() {
    //@ts-ignore
    this.worker.terminate();
  }
}
