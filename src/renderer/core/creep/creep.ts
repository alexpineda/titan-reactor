import { Texture } from "three";
import { TilesBufferView } from "@buffer-view";

//@ts-ignore
import Worker from "./creep.worker.js";
import { Janitor } from "@utils/janitor";

export class Creep {
  mapWidth: number;
  mapHeight: number;
  creepValuesTexture: Texture;
  creepEdgesValuesTexture: Texture;
  minimapImageData: ImageData;
  worker: Worker;
  #janitor = new Janitor("Creep");

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
      this.creepValuesTexture.needsUpdate = true;
      this.creepEdgesValuesTexture.needsUpdate = true;

      //for minimap
      this.minimapImageData = imageData;
    };
    this._lastFrame = 0;
    this.#janitor.mop(() => this.worker.terminate(), "worker");
    this.#janitor.mop(this.creepEdgesValuesTexture, "creepEdgesValuesTexture");
    this.#janitor.mop(this.creepValuesTexture, "creepValuesTexture");
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
    this.#janitor.dispose();
  }
}
