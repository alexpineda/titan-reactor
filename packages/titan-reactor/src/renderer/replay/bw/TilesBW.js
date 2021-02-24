import ContiguousContainer from "./ContiguousContainer";

const flags = Object.freeze({
  hasCreep: 0x40,
  creepReceding: 0x1000,
  temporaryCreep: 0x4000,
});

export default class TilesBW extends ContiguousContainer {
  static get byteLength() {
    return 4;
  }

  get explored() {
    return this._readU8(0);
  }

  get visible() {
    return this._readU8(1);
  }

  get flags() {
    return this._readU16(2);
  }

  get hasCreep() {
    return (this.flags & flags.hasCreep) != 0;
  }

  get hasCreepReceding() {
    return (this.flags & flags.creepReceding) != 0;
  }

  get hasTemporaryCreep() {
    return (this.flags & flags.temporaryCreep) != 0;
  }
}
