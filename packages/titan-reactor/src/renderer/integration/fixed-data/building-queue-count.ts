import ContiguousContainer from "./contiguous-container";
import { BuildingQueueRAW } from "../building-queue-raw";

export const TrainingQueueType = 0;
export const LoadedQueueType = 128;

export const BUILDING_BYTE_LENGTH = 19;

// represents units that are currently building / training
export class BuildingQueueCountBW
  extends ContiguousContainer<BuildingQueueRAW>
  implements BuildingQueueRAW
{
  protected override byteLength = BUILDING_BYTE_LENGTH;

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

  override object() {
    return {
      unitId: this.unitId,
      queueCount: this.queueCount,
      units: this.units,
      queueType: this.queueType,
    };
  }
}
export default BuildingQueueCountBW;
