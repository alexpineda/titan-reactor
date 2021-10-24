import ContiguousContainer from "./ContiguousContainer";

export const TILE_BYTE_LENGTH = 2;

// a block of fog of war data representing w x h map dimensions of fog of war information
export default class TilesBW extends ContiguousContainer {
  protected override byteLength = TILE_BYTE_LENGTH;

  get explored() {
    return this._readU8(0);
  }

  get visible() {
    return this._readU8(1);
  }
}
