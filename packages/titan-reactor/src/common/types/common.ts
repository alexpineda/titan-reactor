export type Race = "zerg" | "terran" | "protoss";

export type EmptyFunc = (value: void) => void;
export type ReadFile = (filename: string) => Promise<Buffer>;



export type ChkUnitType = {
  x: number;
  y: number;
  unitId: number;
  player: number;
  resourceAmt: number;
  sprite?: number;
  isDisabled?: boolean;
};

export type ChkSpriteType = {
  x: number;
  y: number;
  spriteId: number;
  isDisabled: boolean;
};

export type ChkType = {
  title: string | "";
  description: string | "";
  tileset: number | 0;
  units: ChkUnitType[];
  sprites: ChkSpriteType[];
  _tiles: Buffer;
  size: [number, number];
};
