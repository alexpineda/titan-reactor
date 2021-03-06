import ContiguousContainer from "./ContiguousContainer";

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