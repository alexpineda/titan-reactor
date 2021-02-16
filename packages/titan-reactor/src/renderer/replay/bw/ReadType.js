export default class ReadType {
  static get UnitBWByteLength() {
    return 48;
  }

  static UnitBW(buf, offset = 0) {
    return {
      index: buf.readUInt32LE(offset + 0),
      id: buf.readInt32LE(offset + 4),
      owner: buf.readInt32LE(offset + 8),
      x: buf.readInt32LE(offset + 12),
      y: buf.readInt32LE(offset + 16),
      hp: buf.readInt32LE(offset + 20),
      energy: buf.readInt32LE(offset + 24),
      spriteIndex: buf.readInt32LE(offset + 28),
      statusFlags: buf.readInt32LE(offset + 32),
      direction: buf.readInt32LE(offset + 36),
      angle: buf.readDoubleLE(offset + 40),
    };
  }

  static get TileBWByteLength() {
    return 4;
  }

  static TileBW(buf, offset = 0) {
    return {
      visible: buf.readUInt8(offset + 0),
      explored: buf.readUInt8(offset + 1),
      flags: buf.readUInt16LE(offset + 2),
    };
  }
}
