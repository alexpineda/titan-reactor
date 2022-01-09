import { OpenBWWasmAPI } from "src/renderer/openbw";
import { BuildingQueueCountBW, ImagesBW, ResearchBW, SoundsBufferView, SpritesBW, TilesBufferView, UnitsBufferView, UpgradeBW } from ".";
import { ImageStruct, SoundStruct, SpriteStruct } from "../data-transfer";
import { Heaps } from "../openbw-wasm/openbw-reader";
import { UnitStruct } from "../data-transfer";
import { EmbindEntityInterator, EntityIterator } from "./entity-iterator";
import UnitsEmbind from "./units-embind";

// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

  private _sprites : EntityIterator<SpriteStruct>;
  private _images : EntityIterator<ImageStruct>;
  private _units : EntityIterator<UnitStruct>;
  private _sounds : EntityIterator<SoundStruct>;
  private _tiles : TilesBufferView;
  private _buildingQueue : BuildingQueueCountBW;
  private _research : ResearchBW;
  private _upgrades : UpgradeBW;

  constructor(heaps: Heaps) {
     this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, heaps.HEAP8, heaps.HEAPU8);
     this._sounds = new EmbindEntityInterator<SoundStruct>();
     this._units = new EmbindEntityInterator<UnitStruct>();
     this._sprites = new EmbindEntityInterator<SpriteStruct>();

     this._images = new ImagesBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._buildingQueue = new BuildingQueueCountBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._research = new ResearchBW(0, 0, 0, new Int8Array(), new Uint8Array());
     this._upgrades = new UpgradeBW(0, 0, 0, new Int8Array(), new Uint8Array());
  }

  update(openBw: OpenBWWasmAPI) {
    openBw._next_frame();
    const funcs = openBw.get_util_funcs();

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

    if (this.sounds instanceof EmbindEntityInterator && openBw._counts(0, 6)) {
      this.sounds.assign(funcs.get_sounds());
    } else if (this.sounds instanceof SoundsBufferView) {
      this.sounds.ptrIndex = openBw._get_buffer(8);
      this.sounds.itemsCount = openBw._counts(0, 6);
    }
    

    if (this.units instanceof EmbindEntityInterator){
      this.units.assign(funcs.get_units());
    }

    if (this.sprites instanceof EmbindEntityInterator) {
      this.sprites.assign(funcs.get_sprites());
    }
    
  }

  get sprites() {
    return this._sprites;
  }

  get images() {
    return this._images;
  }

  get units(): EntityIterator<UnitStruct> {
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
