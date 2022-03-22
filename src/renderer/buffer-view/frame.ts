import { strict as assert } from "assert";
import { OpenBWAPI } from "common/types";
import { TilesBufferView } from ".";

//FIXME: deprecate this class
export class FrameBW {
  frame = 0;
  prevFrame = -1;
  needsUpdate = false;

  private _tiles: TilesBufferView;
  private _bw: OpenBWAPI;

  constructor(bw: OpenBWAPI) {
    assert(bw.wasm);
    this._bw = bw;
    this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, bw.wasm.HEAPU8);
  }

  update() {

    this.frame = this._bw.call!.nextFrame!();
    this.needsUpdate = this.frame !== this.prevFrame;
    if (this.needsUpdate === false) {
      return;
    }
    this.prevFrame = this.frame;

    this.tiles.ptrIndex = this._bw.call!.getTilesPtr!();
    this.tiles.itemsCount = this._bw.call!.getTilesSize!();

  }

  get tiles() {
    return this._tiles;
  }

}
export default FrameBW;
