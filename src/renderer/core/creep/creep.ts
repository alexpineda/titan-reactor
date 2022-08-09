import { Texture } from "three";
import { TilesBufferView } from "@buffer-view";

//@ts-ignore
import Worker from "./creep.worker.js";

export class Creep {
  mapWidth: number;
  mapHeight: number;
  creepValuesTexture: Texture;
  creepEdgesValuesTexture: Texture;
  minimapImageData: ImageData;
  worker: Worker;

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
    this.minimapImageData = new ImageData(mapWidth, mapHeight);

    this.worker = new Worker();
    this.worker.onmessage = ({ data }: { data: any }) => {
      const { creepData, edgesData, imageData, frame } = data;
      if (frame < this._lastFrame) return;
      this._lastFrame = frame;

      this.creepValuesTexture.image.data = creepData;
      this.creepEdgesValuesTexture.image.data = edgesData;

      //for minimap
      this.minimapImageData = imageData;
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

    this.worker.postMessage(msg, [msg.buffer.buffer]);
  }

  dispose() {
    this.worker.terminate();
  }
}