import { strict as assert } from "assert";
import { OpenBWAPI } from "common/types";
import { TilesBufferView } from ".";

// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  prevFrame = -1;
  needsUpdate = false;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

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

    // for (let i = 0; i < 8; ++i) {
    //     console.log("minerals", this._bw._counts(i, 8));
    //     console.log("gas", this._bw._counts(i, 9));
    //     console.log("workers", this._bw._counts(i, 12));
    //     console.log("army", this._bw._counts(i, 13));
    // }

    this.tiles.ptrIndex = this._bw.call!.getTilesPtr!();
    this.tiles.itemsCount = this._bw.call!.getTilesSize!();

  }

  get tiles() {
    return this._tiles;
  }

}
export default FrameBW;
