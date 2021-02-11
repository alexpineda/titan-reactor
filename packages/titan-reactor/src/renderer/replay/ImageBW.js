export default class ImageBW {
  static get byteLength() {
    return 28;
  }

  constructor(buf) {
    this.index = buf.readInt32LE(0);
    this.id = buf.readInt32LE(4);
    this.flags = buf.readInt32LE(8);
    this.modifier = buf.readInt32LE(12);
    this.frameIndex = buf.readUInt32LE(16);
    this.x = buf.readInt32LE(20);
    this.y = buf.readInt32LE(24);
  }
}
