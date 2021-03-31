export default class ContiguousContainer {
  constructor(count = 0) {
    this._onBuffer = () => {};
    this.count = count;
    this._offset = 0;
  }

  get buffer() {
    return this._buf;
  }

  set buffer(val) {
    this._buf = val;
    this._offset = 0;
    this._onBuffer(val);
  }

  static get byteLength() {
    return 0;
  }

  static getSize(count) {
    return count * this.constructor.byteLength;
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

  instancesByOwner(count = this.count) {
    return this.instances(count).reduce((owners, item) => {
      if (owners[item.owner]) {
        owners[item.owner].push(item);
      } else {
        owners[item.owner] = [item];
      }
      return owners;
    }, []);
  }
}
