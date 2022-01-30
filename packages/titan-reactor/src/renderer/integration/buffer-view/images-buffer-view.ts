import { OpenBWWasm } from "src/renderer/openbw";
import { ImageStruct } from "../structs";
export class ImageBufferView
  implements ImageStruct {

  _address = 0;
  _bw: OpenBWWasm;
  _debug = 1;

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
    return this._bw.HEAPU32[this._index32 + 2 + this._debug];
  }

  get typeId() {
    const addr = this._bw.HEAPU32[this._index32 + 3 + this._debug];
    return this._bw.HEAP32[addr >> 2];
  }

  get modifier() {
    return this._bw.HEAP32[this._index32 + 4 + this._debug];
  }

  get modifierData1() {
    return this._bw.HEAP32[this._index32 + 5 + this._debug];
  }

  get frameIndex() {
    return this._bw.HEAPU32[this._index32 + 7 + this._debug];
  }

  get frameIndexBase() {
    return this._bw.HEAPU32[this._index32 + 8 + this._debug];
  }

  get frameIndexOffset() {
    return this._bw.HEAPU32[this._index32 + 9 + this._debug];
  }

  get flags() {
    return this._bw.HEAP32[this._index32 + 10 + this._debug];
  }

  get x() {
    return this._bw.HEAP32[this._index32 + 11 + this._debug];
  }

  get y() {
    return this._bw.HEAP32[this._index32 + 12 + this._debug];
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
