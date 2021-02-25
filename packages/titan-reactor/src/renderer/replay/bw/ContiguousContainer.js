export default class ContiguousContainer {
  constructor(buf, count) {
    this.buffer = buf;
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

  static get byteLength() {
    return 0;
  }

  get default() {
    return null;
  }

  get offset() {
    return Math.floor(this._offset / this.constructor.byteLength);
  }

  set offset(value) {
    this._offset = value * this.constructor.byteLength;
  }

  _read8(byteOffset) {
    return this._buf.readInt8(this._offset + byteOffset);
  }

  _readU8(byteOffset) {
    return this._buf.readUInt8(this._offset + byteOffset);
  }

  _read16(byteOffset) {
    return this._buf.readInt16LE(this._offset + byteOffset);
  }

  _readU16(byteOffset) {
    return this._buf.readUInt16LE(this._offset + byteOffset);
  }

  _read32(byteOffset) {
    return this._buf.readInt32LE(this._offset + byteOffset);
  }

  _readU32(byteOffset) {
    return this._buf.readUInt32LE(this._offset + byteOffset);
  }

  _readDouble(byteOffset) {
    return this._buf.readDoubleLE(this._offset + byteOffset);
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
}
