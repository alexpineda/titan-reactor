import ContiguousContainer from "./ContiguousContainer";

export const TrainingQueueType = 0;
export const LoadedQueueType = 128;

// represents units that are currently building / training
export default class BuildingQueueCountBW extends ContiguousContainer {
  static get byteLength() {
    return 19;
  }

  get unitId() {
    return this._read16(0);
  }

  get queueCount() {
    return this._readU8(2) & 0x7f;
  }

  get queueType() {
    return this._readU8(2) & 128;
  }

  get units() {
    const units = [];
    for (let i = 0; i < this.queueCount; i++) {
      units.push(this._readU16(3 + i * 2));
    }
    return units;
  }

  object() {
    return {
      unitId: this.unitId,
      queueCount: this.queueCount,
      units: this.units,
      queueType: this.queueType,
    };
  }
}
