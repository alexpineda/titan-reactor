import ContiguousContainer from "./ContiguousContainer";

export default class SoundsBW extends ContiguousContainer {
  static get byteLength() {
    return 16;
  }

  static get minPlayVolume() {
    return 10;
  }

  constructor(bwDat, mapWidth, mapHeight, getTerrainY) {
    super();
    this.bwDat = bwDat;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.getTerrainY = getTerrainY;
  }

  get id() {
    return this._read32(0);
  }

  get x() {
    return this._read32(4);
  }

  get y() {
    return this._read32(8);
  }

  get mapX() {
    return this.x / 32 - this.mapWidth / 2;
  }

  get mapY() {
    return this.getTerrainY(this.mapX, this.mapZ);
  }

  get mapZ() {
    return this.y / 32 - this.mapHeight / 2;
  }

  get unitIndex() {
    const val = this._read32(12);
    return val === -1 ? null : val;
  }

  get minVolume() {
    return this.bwDat.sounds[this.id].minVolume;
  }

  get priority() {
    return this.bwDat.sounds[this.id].priority;
  }

  bwVolume(screenX, screenY, screenWidth, screenHeight) {
    let volume = this.minVolume;

    let distance = 0;
    if (this.x < screenX) distance += screenX - this.x;
    else if (this.x > screenX + screenWidth)
      distance += this.x - (screenX + screenWidth);
    if (this.y < screenY) distance += screenY - this.y;
    else if (this.y > screenY + screenHeight)
      distance += this.y - (screenY + screenHeight);

    let distance_volume = 99 - (99 * distance) / 512;

    if (distance_volume > volume) volume = distance_volume;

    return volume;
  }

  get muted() {
    return this.flags & 0x20;
  }

  nearest(x, y) {
    const prevOffset = this.offset;

    let sounds = [];
    for (let i = 0; i < this.count; i++) {
      sounds.push({ id: this.id, x: this.mapX, z: this.mapZ, y: this.mapZ });
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
