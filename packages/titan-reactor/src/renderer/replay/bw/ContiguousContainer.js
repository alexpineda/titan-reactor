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

  get object() {
    return {};
  }

  get offset() {
    return Math.floor(this._offset / this.constructor.byteLength);
  }

  set offset(value) {
    this._offset = value * this.constructor.byteLength;
  }

  _read32(offset) {
    return this._buf.readInt32LE(this._offset + offset);
  }

  _readU32(offset) {
    return this._buf.readUInt32LE(this._offset + offset);
  }

  *items(count = this.count) {
    for (let i = 0; i < count; i++) {
      yield this.default;
      this.offset++;
    }
  }

  *reverse(count = this.count) {
    this.offset = this.offset + count;
    for (let i = 0; i < count; i++) {
      this.offset--;
      yield this.default;
    }
    this.offset += count;
  }
}
