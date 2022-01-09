import { OpenBWWasmAPI } from "src/renderer/openbw";
import { BuildingQueueCountBW, ImagesBW, ResearchBW, SoundsBufferView, SpritesBW, TilesBufferView, UnitsBW, UpgradeBW } from ".";
import { Heaps } from "../openbw-wasm/openbw-reader";

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
  private _tiles : TilesBufferView;
  private _sounds : SoundsBufferView;
  private _buildingQueue : BuildingQueueCountBW;
  private _research : ResearchBW;
  private _upgrades : UpgradeBW;
  private readonly _heaps : Heaps;

  constructor(heaps: Heaps) {
     this._heaps = heaps;

     this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, heaps.HEAP8, heaps.HEAPU8);
     this._sounds = new SoundsBufferView(SoundsBufferView.STRUCT_SIZE, 0, 0, heaps.HEAP32, heaps.HEAPU32);

     this._sprites = new SpritesBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._images = new ImagesBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._units = new UnitsBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._buildingQueue = new BuildingQueueCountBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._research = new ResearchBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._upgrades = new UpgradeBW(0, 0, 0, new Int8Array(), new Uint8Array());
  }

  update(openBw: OpenBWWasmAPI) {
    openBw._next_frame();

    //@todo change one new build is avail
    // this.frame = openBw._next_frame();
    this.frame = openBw._replay_get_value(2);
    // for (let i = 0; i < 8; ++i) {
    //     console.log("minerals", openBw._counts(i, 8));
    //     console.log("gas", openBw._counts(i, 9));
    //     console.log("workers", openBw._counts(i, 12));
    //     console.log("army", openBw._counts(i, 13));
    // }

    this.tiles.ptrIndex = openBw._get_buffer(0);
    this.tiles.itemsCount = openBw._counts(0, 0);

    this.sounds.ptrIndex = openBw._get_buffer(8);
    this.sounds.itemsCount = openBw._counts(0, 6);

  }

  get sprites() {
    return this._sprites;
  }

  get images() {
    return this._images;
  }

  get units() {
    return this._units;
  }

  get tiles() {
    return this._tiles;
  }

  get sounds() {
    return this._sounds;
  }

  get buildingQueue() {
    return this._buildingQueue;
  }

  get research() {
    return this._research;
  }

  get upgrades() {
    return this._upgrades;
  }
}
export default FrameBW;
