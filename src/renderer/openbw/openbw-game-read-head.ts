import { OpenBWAPI } from "common/types";
import { TilesBufferView } from "../buffer-view";

export class OpenBWGameReadHead {
  frame = 0;
  prevFrame = -1;
  needsUpdate = false;

  private _tiles: TilesBufferView;
  private _bw: OpenBWAPI;

  constructor(bw: OpenBWAPI) {
    this._bw = bw;
    this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, bw.wasm!.HEAPU8);
  }

  loadReplay(buffer: Buffer) {
    this._bw.call!.loadReplay!(buffer);
  }

  update() {

    this.frame = this._bw.call!.nextFrame!();
    this.needsUpdate = this.frame !== this.prevFrame;
    if (this.needsUpdate === false) {
      return null;
    }
    this.prevFrame = this.frame;

    this.tiles.ptrIndex = this._bw.call!.getTilesPtr!();
    this.tiles.itemsCount = this._bw.call!.getTilesSize!();

    return this;

  }

  get tiles() {
    return this._tiles;
  }

}
export default OpenBWGameReadHead;
