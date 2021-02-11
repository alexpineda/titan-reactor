export default class SpriteBW {
  static get byteLength() {
    return 36;
  }

  constructor(buf) {
    this.index = buf.readInt32LE(0);
    this.id = buf.readInt32LE(4);
    this.owner = buf.readInt32LE(8);
    this.elevation = buf.readInt32LE(12);
    this.flags = buf.readInt32LE(16);
    this.x = buf.readInt32LE(20);
    this.y = buf.readInt32LE(24);
    this.numImages = buf.readInt32LE(28);
    this.mainImageIndex = buf.readInt32LE(32);
    this.images = [];
  }
}
