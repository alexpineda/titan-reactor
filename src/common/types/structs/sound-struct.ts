export interface SoundStruct {
  typeId: number;
  unitTypeId: number | null;
  x: number;
  y: number;

  volume?: number;
  pan?: number;
}
