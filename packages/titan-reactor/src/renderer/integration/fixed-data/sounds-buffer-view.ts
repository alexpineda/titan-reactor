import { SoundDAT,MapCoords } from "../../../common/types";
import { SoundStruct } from "../data-transfer";
import BufferView from "./buffer-view";


export class SoundsBufferView
  extends BufferView<SoundStruct>
implements SoundStruct
{
  static STRUCT_SIZE = 16;

  static get minPlayVolume() {
    return 10;
  }

  static getBwVolume({dat, mapCoords}: { dat: SoundDAT, mapCoords: MapCoords}, sound: SoundStruct, left: number, top: number, right: number, bottom: number) {
  let volume = dat.minVolume || 0;

  if (sound.x !== 0 && sound.y !== 0) {
    let distance = 0;
    if (mapCoords.x < left) distance += left - mapCoords.x;
    else if (mapCoords.x > right) distance += mapCoords.x - right;
    if (mapCoords.z < top) distance += top - mapCoords.z;
    else if (mapCoords.z > bottom) distance += mapCoords.z - bottom;

    const distance_volume = 99 - (99 * distance) / 16;

    if (distance_volume > volume) volume = distance_volume;
  }

  return volume;
  }

  get id() {
    return this._read(0);
  }

  get x() {
    return this._read(1);
  }

  get y() {
    return this._read(2);
  }

  get unitTypeId() {
    const val = this._read(3);
    return val === -1 ? null : val;
  }


  get tileX() {
    return Math.floor(this.x / 32);
  }

  get tileY() {
    return Math.floor(this.y / 32);
  }

  override object(): SoundStruct {
    return {
      id: this.id,
      unitTypeId: this.unitTypeId as number,
      x: this.x,
      y: this.y,
    };
  }

}
export default SoundsBufferView;
