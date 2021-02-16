import ContiguousContainer from "./ContiguousContainer";

export default class SoundsBW extends ContiguousContainer {
  static get byteLength() {
    return 16;
  }

  constructor(mapWidth, mapHeight, getTerrainY) {
    super();
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.getTerrainY = getTerrainY;
  }

  get id() {
    return this._read32(0);
  }

  get x() {
    return this._read32(4) / 32 - this.mapWidth / 2;
  }

  get y() {
    return this.getTerrainY(this.x, this.z);
  }

  get z() {
    return this._read32(8) / 32 - this.mapHeight / 2;
  }

  get unitIndex() {
    const val = this._read32(12);
    return val === -1 ? null : val;
  }

  nearest(x, y) {
    const prevOffset = this.offset;

    let sounds = [];
    for (let i = 0; i < this.count; i++) {
      sounds.push({ id: this.id, x: this.x, z: this.z, y: this.z });
      this.offset++;
    }

    sounds.sort((a, b) => {
      const aX = Math.abs(x - a.x);
      const bX = Math.abs(x - b.x);
      const aY = Math.abs(y - a.y);
      const bY = Math.abs(y - b.y);

      if (aX < bX && aY < bY) {
        return -1;
      }

      if (aX > bX && aY > bY) {
        return 1;
      }
      return 0;
    });
    this.offset = prevOffset;
    return sounds;
  }
}
