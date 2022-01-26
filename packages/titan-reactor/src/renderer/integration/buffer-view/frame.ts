import { OpenBWWasm } from "src/renderer/openbw";
import { SpritesBufferView, TilesBufferView } from ".";
import { SoundStruct, SpriteStruct } from "../structs";
import { Heaps } from "../../openbw/openbw-reader";
import { UnitStruct } from "../structs";
import { EmbindEntityInterator, EntityIterator } from "./entity-iterator";

// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

  private _sprites: EntityIterator<SpriteStruct>;
  private _units: EntityIterator<UnitStruct>;
  private _sounds: EntityIterator<SoundStruct>;
  private _tiles: TilesBufferView;

  constructor(heaps: Heaps) {
    this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, heaps.HEAPU8);
    this._sounds = new EmbindEntityInterator<SoundStruct>();
    this._units = new EmbindEntityInterator<UnitStruct>();
    this._sprites = new EmbindEntityInterator<SpriteStruct>();
    // this._sprites = new SpritesBufferView(SpritesBufferView.STRUCT_SIZE, 0, 0, heaps.HEAP32);
  }

  update(openBw: OpenBWWasm) {
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

    if (this.sounds instanceof EmbindEntityInterator) {
      this.sounds.assign(funcs.get_sounds());
    }

    if (this.units instanceof EmbindEntityInterator) {
      this.units.assign(funcs.get_units(true));
    }

    if (this.sprites instanceof EmbindEntityInterator) {
      this.sprites.assign(funcs.get_sprites(true));
    } else if (this.sprites instanceof SpritesBufferView) {
      this.sprites.ptrIndex = openBw._get_buffer(1);
      this.sprites.itemsCount = openBw._counts(0, 7);
    }

  }

  get sprites() {
    return this._sprites;
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
