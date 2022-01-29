import { OpenBWWasm } from "src/renderer/openbw";
import { SpritesBufferView, TilesBufferView } from ".";
import { SoundStruct, SpriteStruct } from "../structs";
import { Heaps } from "../../openbw/openbw-reader";
import { UnitStruct } from "../structs";
import { EmbindEntityInterator, EntityIterator } from "./entity-iterator";

interface SpriteDump {
  spriteAddr: number;
  imageCount: number;
  imageAddr: number;
}


// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

  private _units: EntityIterator<UnitStruct>;
  private _sounds: EntityIterator<SoundStruct>;
  private _tiles: TilesBufferView;

  private _bw: OpenBWWasm;

  constructor(bw: OpenBWWasm) {
    this._bw = bw;
    this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, bw.HEAPU8);
    this._sounds = new EmbindEntityInterator<SoundStruct>();
    this._units = new EmbindEntityInterator<UnitStruct>();
    // this._sprites = new SpritesBufferView(SpritesBufferView.STRUCT_SIZE, 0, 0, heaps.HEAP32);
  }

  update() {
    this._bw._next_frame();
    const funcs = this._bw.get_util_funcs();

    //@todo change one new build is avail
    // this.frame = this._bw._next_frame();
    this.frame = this._bw._replay_get_value(2);
    // for (let i = 0; i < 8; ++i) {
    //     console.log("minerals", this._bw._counts(i, 8));
    //     console.log("gas", this._bw._counts(i, 9));
    //     console.log("workers", this._bw._counts(i, 12));
    //     console.log("army", this._bw._counts(i, 13));
    // }

    this.tiles.ptrIndex = this._bw._get_buffer(0);
    this.tiles.itemsCount = this._bw._counts(0, 0);

    if (this.sounds instanceof EmbindEntityInterator) {
      this.sounds.assign(funcs.get_sounds());
    }

    if (this.units instanceof EmbindEntityInterator) {
      this.units.assign(funcs.get_units(true));
    }

  }

  getSprites() {
    return this._bw.get_util_funcs().get_sprites()
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

}
export default FrameBW;
