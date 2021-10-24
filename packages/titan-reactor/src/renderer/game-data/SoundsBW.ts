import ContiguousContainer from "./ContiguousContainer";
import { PxToGameUnit, GetTerrainY } from "../../common/types/util";

export const SOUND_BYTE_LENGTH = 16;
/**
 * Sounds in a bw frame.
 * Also contains volume and panning calculations ported from openbw.
 */
export type SoundBWInstance = {
  id: number;
  unitTypeId: number;
  priority: number;
  minVolume: number;
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  mapZ: number;
  flags: number;
};

export default class SoundsBW extends ContiguousContainer {
  protected override byteLength = SOUND_BYTE_LENGTH;

  private pxToGameUnit: PxToGameUnit;
  private getTerrainY: GetTerrainY;

  constructor(pxToGameUnit: PxToGameUnit, getTerrainY: GetTerrainY) {
    super();
    this.pxToGameUnit = pxToGameUnit;
    this.getTerrainY = getTerrainY;
  }

  static get minPlayVolume() {
    return 10;
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
    return this.bwDat?.sounds[this.id].flags;
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
    return this.bwDat?.sounds[this.id].minVolume;
  }

  get priority() {
    return this.bwDat?.sounds[this.id].priority;
  }

  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

  override object(): SoundBWInstance {
    return {
      id: this.id,
      unitTypeId: this.unitTypeId as number,
      priority: this.priority as number,
      minVolume: this.minVolume as number,
      x: this.x,
      y: this.y,
      mapX: this.mapX,
      mapY: this.mapY,
      mapZ: this.mapZ,
      flags: this.flags as number,
    };
  }

  bwVolume(left: number, top: number, right: number, bottom: number) {
    let volume = this.minVolume || 0;

    if (this.x !== 0 && this.y !== 0) {
      let distance = 0;
      if (this.mapX < left) distance += left - this.mapX;
      else if (this.mapX > right) distance += this.mapX - right;
      if (this.mapZ < top) distance += top - this.mapZ;
      else if (this.mapZ > bottom) distance += this.mapZ - bottom;

      const distance_volume = 99 - (99 * distance) / 16;

      if (distance_volume > volume) volume = distance_volume;
    }

    return volume;
  }

  bwPan(left: number, width: number) {
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
}
