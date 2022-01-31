import { strict as assert } from "assert";
import { OpenBWAPI, OpenBWWasm } from "src/renderer/openbw";
import { TilesBufferView } from ".";
import { SoundStruct } from "../structs";
import { UnitStruct } from "../structs";
import { EmbindEntityInterator, EntityIterator } from "./entity-iterator";

// a wrapper for a bw frames entire game state
export class FrameBW {
  frame = 0;
  prevFrame = -1;
  needsUpdate = false;
  minerals: number[] = [];
  gas: number[] = [];
  supplyUsed: number[] = [];
  supplyAvailable: number[] = [];
  workerSupply: number[] = [];

  private _units: EntityIterator<UnitStruct>;
  private _sounds: EntityIterator<SoundStruct>;
  private _tiles: TilesBufferView;

  private _bw: OpenBWAPI;

  constructor(bw: OpenBWAPI) {
    assert(bw.wasm);
    this._bw = bw;
    this._tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, bw.wasm.HEAPU8);
    this._sounds = new EmbindEntityInterator<SoundStruct>();
    this._units = new EmbindEntityInterator<UnitStruct>();
  }

  update() {

    this.frame = this._bw.call.nextFrame();
    this.needsUpdate = this.frame !== this.prevFrame;
    if (this.needsUpdate === false) {
      return;
    }
    this.prevFrame = this.frame;

    // for (let i = 0; i < 8; ++i) {
    //     console.log("minerals", this._bw._counts(i, 8));
    //     console.log("gas", this._bw._counts(i, 9));
    //     console.log("workers", this._bw._counts(i, 12));
    //     console.log("army", this._bw._counts(i, 13));
    // }

    this.tiles.ptrIndex = this._bw.call.getTilesPtr();
    this.tiles.itemsCount = this._bw.call.getTilesSize();

    if (this.sounds instanceof EmbindEntityInterator) {
      this.sounds.assign(this._bw.call.getSoundObjects());
    }

    if (this.units instanceof EmbindEntityInterator) {
      this.units.assign(this._bw.call.getUnitsObjects());
    }


  }

  getSprites() {
    return this._bw.call.getSpriteAddresses();
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
