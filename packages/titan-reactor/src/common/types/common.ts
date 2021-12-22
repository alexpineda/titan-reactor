export type Race = "zerg" | "terran" | "protoss";

export type EmptyFunc = (value: void) => void;
export type ReadFile = (filename: string) => Promise<Buffer>;

export type Settings = {
  version: number;
  renderMode: number;
  alwaysHideReplayControls: boolean;
  language: string;
  starcraftPath: string;
  mapsPath: string;
  replaysPath: string;
  tempPath: string;
  communityModelsPath: string;
  observerLink: string;
  musicVolume: number;
  musicAllTypes: boolean;
  soundVolume: number;
  antialias: boolean;
  anisotropy: number;
  pixelRatio: number;
  gamma: number;
  keyPanSpeed: number;
  twitch: string;
  fullscreen: boolean;
  enablePlayerScores: boolean;
  esportsHud: boolean;
  embedProduction: boolean;
  cameraShake: number;
  useCustomColors: boolean;
  randomizeColorOrder: boolean;
  classicClock: boolean;
  playerColors: string[];
  hudFontSize: "xs" | "sm" | "md" | "lg" | "xl";
  minimapRatio: number;
  replayAndUnitDetailSize: string;
  fpsLimit: number;
  autoToggleProductionView: boolean;
  showDisabledDoodads: boolean;
  showCritters: boolean;
  mouseRotateSpeed: number;
  mouseDollySpeed: number;
  mapBackgroundColor: string;
};

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
