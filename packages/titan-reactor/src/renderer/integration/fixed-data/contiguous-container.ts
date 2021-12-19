import { BwDAT } from "../../../common/bwdat/core/bw-dat";

/**
 An abstract class.
 A fixed block of binary data that represents some game state (eg units, sprites, etc)
*/
export class ContiguousContainer {
  count: number;
  protected _offset: number;
  protected _buf?: Buffer;
  bwDat?: BwDAT;
  protected byteLength = 0;

  constructor(count = 0) {
    this.count = count;
    this._offset = 0;
  }

  get buffer() {
    return this._buf;
  }

  set buffer(val) {
    this._buf = val;
    this._offset = 0;
  }

  get offset() {
    return Math.floor(this._offset / this.byteLength);
  }

  set offset(value) {
    this._offset = value * this.byteLength;
  }

  protected object() {
    return {};
  }

  _read8(byteOffset: number) {
    return (this._buf as Buffer).readInt8(this._offset + byteOffset);
  }

  _readU8(byteOffset: number) {
    return (this._buf as Buffer).readUInt8(this._offset + byteOffset);
  }

  _read16(byteOffset: number) {
    return (this._buf as Buffer).readInt16LE(this._offset + byteOffset);
  }

  _readU16(byteOffset: number) {
    return (this._buf as Buffer).readUInt16LE(this._offset + byteOffset);
  }

  _read32(byteOffset: number) {
    return (this._buf as Buffer).readInt32LE(this._offset + byteOffset);
  }

  _readU32(byteOffset: number) {
    return (this._buf as Buffer).readUInt32LE(this._offset + byteOffset);
  }

  _readDouble(byteOffset: number) {
    return (this._buf as Buffer).readDoubleLE(this._offset + byteOffset);
  }

  *items(count = this.count) {
    for (let i = 0; i < count; i++) {
      yield this;
      this.offset++;
    }
  }

  *reverse(count = this.count) {
    this.offset = this.offset + count;
    for (let i = 0; i < count; i++) {
      this.offset--;
      yield this;
    }
    this.offset += count;
  }

  instances(count = this.count) {
    if (!this.object) {
      throw new Error("requires object() method");
    }
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(this.object());
      this.offset++;
    }
    return arr;
  }
}
export default ContiguousContainer;
