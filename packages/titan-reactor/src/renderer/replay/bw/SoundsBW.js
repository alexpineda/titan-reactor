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

  get unitTypeId() {
    const val = this._read32(12);
    return val === -1 ? null : val;
  }

  get flags() {
    return this.bwDat.sounds[this.id].flags;
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
      if (this.mapZ < top) distance += top - this.mapZ;
      else if (this.mapZ > bottom) distance += this.mapZ - bottom;

      let distance_volume = 99 - (99 * distance) / 16;

      if (distance_volume > volume) volume = distance_volume;
    }
    if (volume > 100) {
      console.warn("volume over 100");
    }
    return volume;
  }

  bwPanX(left, width) {
    let pan = 0;

    if (this.x !== 0 && this.y !== 0) {
      let pan_x = this.mapX - (left + width / 2);
      const isLeft = pan_x < 0;
      if (isLeft) pan_x = -pan_x;
      if (pan_x <= 2) pan = 0;
      else if (pan_x <= 5) pan = 52;
      else if (pan_x <= 10) pan = 127;
      else if (pan_x <= 20) pan = 191;
      else if (pan_x <= 40) pan = 230;
      else pan = 255;
      if (isLeft) pan = -pan;
    }

    return pan / 255;
  }

  bwPanY(top, height) {
    let pan = 0;

    if (this.x !== 0 && this.y !== 0) {
      let pan_y = this.mapZ - (top + height / 2);
      const isTop = pan_y < 0;
      if (isTop) pan_y = -pan_y;
      if (pan_y <= 2) pan = 0;
      else if (pan_y <= 5) pan = 52;
      else if (pan_y <= 10) pan = 127;
      else if (pan_y <= 20) pan = 191;
      else if (pan_y <= 40) pan = 230;
      else pan = 255;
      if (isTop) pan = -pan;
    }

    return pan / 255;
  }
}
