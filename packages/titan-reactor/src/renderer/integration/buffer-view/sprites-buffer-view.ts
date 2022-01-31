import { OpenBWWasm } from "src/renderer/openbw";
import { SpriteStruct } from "../structs";

/**
 * Maps to openbw sprite_t starting from index address
 */
export class SpritesBufferView
  implements SpriteStruct {

  _address = 0;
  _bw: OpenBWWasm;

  get(address: number) {
    this._address = address;
    return this;
  }

  constructor(bw: OpenBWWasm) {
    this._bw = bw;
  }

  private get _index32() {
    return (this._address >> 2) + 2; //skip link base
  }

  get index() {
    return this._bw.HEAPU32[this._index32];
  }

  get typeId() {
    const addr = this._bw.HEAPU32[this._index32 + 1];
    return this._bw.HEAP32[addr >> 2];
  }

  get owner() {
    return this._bw.HEAP32[this._index32 + 2];
  }

  get elevation() {
    return this._bw.HEAP32[this._index32 + 5];
  }

  get flags() {
    return this._bw.HEAP32[this._index32 + 6];
  }

  get x() {
    return this._bw.HEAP32[this._index32 + 10];
  }

  get y() {
    return this._bw.HEAP32[this._index32 + 11];
  }

  get mainImageIndex() {
    const addr = this._bw.HEAPU32[this._index32 + 12];
    return this._bw.HEAPU32[(addr >> 2) + 2];
  }

  get lastImage() {
    return this._bw.HEAPU32[this._index32 + 13];
  }

  get firstImage() {
    return this._bw.HEAPU32[this._index32 + 14];
  }

  get endImageIterate() {
    return (this._index32 + 13) << 2;
  }

}
export default SpritesBufferView;
