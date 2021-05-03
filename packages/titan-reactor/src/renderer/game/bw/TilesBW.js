import ContiguousContainer from "./ContiguousContainer";

// a block of fog of war data representing w x h map dimensions of fog of war information
export default class TilesBW extends ContiguousContainer {
  static get byteLength() {
    return 2;
  }

  get explored() {
    return this._readU8(0);
  }

  get visible() {
    return this._readU8(1);
  }
}
