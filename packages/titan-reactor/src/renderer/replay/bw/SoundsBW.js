import ContiguousContainer from "./ContiguousContainer";

export default class SoundsBW extends ContiguousContainer {
  static get byteLength() {
    return 16;
  }

  static get minPlayVolume() {
    return 10;
  }

  constructor(bwDat, pxToGameUnit, getTerrainY) {
    super();
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
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
    return this.pxToGameUnit.x(this.x);
  }

  get mapY() {
    return this.getTerrainY(this.mapX, this.mapZ);
  }

  get mapZ() {
    return this.pxToGameUnit.y(this.y);
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

  bwVolume(left, top, right, bottom) {
    let volume = this.minVolume;

    if (this.x !== 0 && this.y !== 0) {
      let distance = 0;
      if (this.mapX < left) distance += left - this.mapX;
      else if (this.mapX > right) distance += this.mapX - right;
      if (this.mapY < top) distance += top - this.mapY;
      else if (this.mapY > bottom) distance += this.mapY - bottom;

      let distance_volume = 99 - (99 * distance) / 512;

      if (distance_volume > volume) volume = distance_volume;
    }
    return volume;
  }

  get muted() {
    return this.flags & 0x20;
  }
}
