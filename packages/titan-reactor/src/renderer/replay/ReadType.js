export default class ReadType {
  static get SpriteBWByteLength() {
    return 36;
  }

  static SpriteBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      owner: buf.readInt32LE(8),
      elevation: buf.readInt32LE(12),
      flags: buf.readInt32LE(16),
      x: buf.readInt32LE(20),
      y: buf.readInt32LE(24),
      numImages: buf.readInt32LE(28),
      mainImageIndex: buf.readInt32LE(32),
      images: [],
    };
  }

  static get ImageBWByteLength() {
    return 28;
  }

  static ImageBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      flags: buf.readInt32LE(8),
      modifier: buf.readInt32LE(12),
      frameIndex: buf.readInt32LE(16),
      x: buf.readInt32LE(20),
      y: buf.readInt32LE(24),
    };
  }

  static get UnitBWByteLength() {
    return 48;
  }

  static UnitBW(buf) {
    return {
      index: buf.readUInt32LE(0),
      id: buf.readInt32LE(4),
      owner: buf.readInt32LE(8),
      x: buf.readInt32LE(12),
      y: buf.readInt32LE(16),
      hp: buf.readInt32LE(20),
      energy: buf.readInt32LE(24),
      spriteIndex: buf.readInt32LE(28),
      statusFlags: buf.readInt32LE(32),
      direction: buf.readInt32LE(36),
      angle: buf.readDoubleLE(40),
    };
  }

  static get TileBWByteLength() {
    return 4;
  }

  static TileBW(buf) {
    return {
      visible: buf.readUInt8(0),
      explored: buf.readUInt8(1),
      flags: buf.readUInt16LE(2),
    };
  }
}
