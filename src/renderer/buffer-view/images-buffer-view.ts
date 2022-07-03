import { OpenBWWasm, ImageStruct } from "common/types";
export class ImageBufferView
  implements ImageStruct {

  _address = 0;
  _bw: OpenBWWasm;
  _debug = 0;

  get(address: number) {
    this._address = address;
    return this;
  }

  constructor(bw: OpenBWWasm) {
    this._bw = bw;
  }

  private get _index32() {
    return (this._address >> 2);
  }

  get index() {
    return this._bw.HEAPU32[this._index32 + 2];
  }

  get typeId() {
    const addr = this._bw.HEAPU32[this._index32 + 3];
    return this._bw.HEAP32[addr >> 2];
  }

  get modifier() {
    return this._bw.HEAP32[this._index32 + 4];
  }

  get modifierData1() {
    return this._bw.HEAP32[this._index32 + 5];
  }

  get modifierData2() {
    return this._bw.HEAP32[this._index32 + 6];
  }

  get frameIndex() {
    return this._bw.HEAPU32[this._index32 + 7];
  }

  get frameIndexBase() {
    return this._bw.HEAPU32[this._index32 + 8];
  }

  get frameIndexOffset() {
    return this._bw.HEAPU32[this._index32 + 9];
  }

  get flags() {
    return this._bw.HEAP32[this._index32 + 10];
  }

  get x() {
    return this._bw.HEAP32[this._index32 + 11];
  }

  get y() {
    return this._bw.HEAP32[this._index32 + 12];
  }

  get iscriptProgramCounter() {
    return this._bw.HEAPU32[this._index32 + 13];
  }

  get iscriptAnimation() {
    return this._bw.HEAP32[this._index32 + 16];
  }

  get nextNode() {
    return this._bw.HEAPU32[this._index32];
  }

  *[Symbol.iterator]() {
    const header = this._address;
    do {
      yield this;
      this._address = this.nextNode;
    } while (header !== this._address); // intrusive list
  }
}
export default ImageBufferView;
