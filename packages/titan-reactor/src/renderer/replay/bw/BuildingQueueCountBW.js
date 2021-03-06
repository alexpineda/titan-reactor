import ContiguousContainer from "./ContiguousContainer";

export default class BuildingQueueCountBW extends ContiguousContainer {
  static get byteLength() {
    return 8;
  }

  get unitId() {
    return this._read16(0);
  }

  get queueCount() {
    return this._read8(2);
  }

  get units() {
    const units = [];
    for (let i = 0; i < this.queueCount; i++) {
      units.push(this._readU8(3 + i));
    }
    return units;
  }
}
