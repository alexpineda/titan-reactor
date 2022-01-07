import { BwDAT } from "../../../common/types";
import { BuildingQueueCountBW, ImagesBW, ResearchBW, SoundsBW, SpritesBW, TilesBW, UnitsBW, UpgradeBW } from ".";

// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

  private _sprites: SpritesBW;
  private _images : ImagesBW;
  private _units : UnitsBW;
  private _tiles : TilesBW;
  private _sounds : SoundsBW;
  private _creep : Uint8Array;
  private _buildingQueue : BuildingQueueCountBW;
  private _research : ResearchBW;
  private _upgrades : UpgradeBW;

  constructor() {
     this._sprites = new SpritesBW(0, 0, new Int8Array(), new Uint8Array());
     this._images = new ImagesBW(0, 0, new Int8Array(), new Uint8Array());
     this._units = new UnitsBW(0, 0, new Int8Array(), new Uint8Array());
     this._tiles = new TilesBW(0, 0, new Int8Array(), new Uint8Array());
     this._sounds = new SoundsBW(0, 0, new Int8Array(), new Uint8Array());
     this._creep = new Uint8Array();
     this._buildingQueue = new BuildingQueueCountBW(0, 0, new Int8Array(), new Uint8Array());
     this._research = new ResearchBW(0, 0, new Int8Array(), new Uint8Array());
     this._upgrades = new UpgradeBW(0, 0, new Int8Array(), new Uint8Array());
  }

  set sprites(sprites: SpritesBW) {
    this._sprites = sprites;
  }
  get sprites() {
    return this._sprites;
  }

  set images(images: ImagesBW) {
    this._images = images;
  }

  get images() {
    return this._images;
  }

  set units(units: UnitsBW) {
    this._units = units;
  }

  get units() {
    return this._units;
  }

  set tiles(tiles: TilesBW) {
    this._tiles = tiles;
  }

  get tiles() {
    return this._tiles;
  }

  set sounds(sounds: SoundsBW) {
    this._sounds = sounds;
  }

  get sounds() {
    return this._sounds;
  }

  set creep(creep: Uint8Array) {
    this._creep = creep;
  }
  
  get creep() {
    return this._creep;
  }

  set buildingQueue(buildingQueue: BuildingQueueCountBW) {
    this._buildingQueue = buildingQueue;
  }

  get buildingQueue() {
    return this._buildingQueue;
  }

  set research(research: ResearchBW) {
    this._research = research;
  }

  get research() {
    return this._research;
  }

  set upgrades(upgrades: UpgradeBW) {
    this._upgrades = upgrades;
  }
  get upgrades() {
    return this._upgrades;
  }
}
export default FrameBW;
