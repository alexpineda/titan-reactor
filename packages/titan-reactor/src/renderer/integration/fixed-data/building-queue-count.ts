import BufferView from "./buffer-view";
import { BuildingQueueStruct } from "../data-transfer/building-queue-struct";

export const TrainingQueueType = 0;
export const LoadedQueueType = 128;

export const BUILDING_BYTE_LENGTH = 19;

// represents units that are currently building / training
export class BuildingQueueCountBW
  extends BufferView<BuildingQueueStruct>
  implements BuildingQueueStruct
{
  get unitId() {
    return this._read(0);
  }

  get queueCount() {
    return this._readU(1) & 0x7f;
  }

  get queueType() {
    return this._readU(1) & 128;
  }

  get units() {
    const units = [];
    for (let i = 0; i < this.queueCount; i++) {
      units.push(this._readU(2 + i * 2));
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
