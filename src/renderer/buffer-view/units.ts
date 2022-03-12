// @ts-nocheck
import BufferView from "./buffer-view";
import { UnitStruct } from "../unit-struct";

export const UNIT_BYTE_LENGTH = 30;
// all units in a bw frame
export class UnitsBufferView extends BufferView<UnitStruct> implements UnitStruct {
  resourceAmount: number;

  get id() {
    return this._readU(0);
  }

  get typeId() {
    return this._read(2);
  }

  get owner() {
    return this._read(4);
  }

  get x() {
    return this._read(6);
  }

  get y() {
    return this._read(8);
  }

  get hp() {
    return this._read(10);
  }

  get energy() {
    return this._read(12);
  }

  get spriteIndex() {
    return this._read(14);
  }

  get statusFlags() {
    return this._read(16);
  }

  get direction() {
    return this._read(20);
  }

  get remainingBuildTime() {
    return this._read(22);
  }

  get shields() {
    return this._read(24);
  }

  get order() {
    return this._readU(26);
  }

  get remainingTrainTime() {
    return this._readU(27);
  }

  get kills() {
    return this._read(28);
  }

  get angle() {
    let d = this.direction;
    d -= 64;
    if (d < 0) {
      d += 256;
    }
    return -((d * Math.PI) / 128) + Math.PI / 2;
  }

  override object() {
    return {
      id: this.id,
      typeId: this.typeId,
      owner: this.owner,
      x: this.x,
      y: this.y,
      hp: this.hp,
      energy: this.energy,
      shields: this.shields,
      spriteIndex: this.spriteIndex,
      statusFlags: this.statusFlags,
      direction: this.direction,
      remainingBuildTime: this.remainingBuildTime,
      remainingTrainTime: this.remainingTrainTime,
      angle: this.angle,
      order: this.order,
      kills: this.kills,
    };
  }
}
export default UnitsBufferView;
