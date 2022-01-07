import { BwDAT } from "../../../common/bwdat/core/bw-dat";

type TypedArray = Int8Array | Int16Array | Int32Array;
type UTypedArray = Uint8Array | Uint16Array | Uint32Array;
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
export abstract class BufferView<T> {
  readonly count: number;
  protected _index: number;

  private readonly _structSize;
  private readonly _buffer: TypedArray;
  private readonly _ubuffer: UTypedArray;

  constructor(structSize:number, index = 0, count = 0, buffer: TypedArray, ubuffer: UTypedArray) {
    this._buffer = buffer;
    this._ubuffer = ubuffer;
    this.count = count;
    this._structSize = structSize / buffer.BYTES_PER_ELEMENT;
    this._index = index;
  }

  get buffer() {
    return this._buffer.slice(this._index, this._index + this.count * this._structSize);
  }

  get ubuffer() {
    return this._ubuffer.slice(this._index, this._index + this.count * this._structSize);
  }

  private get index() {
    return Math.floor(this._index / this._structSize);
  }

  private set index(value) {
    this._index = value * this._structSize;
  }

  object(): T {
    throw new Error("Not implemented");
  }

  _read(offset: number) {
    return this._buffer[this._index + offset];
  }

  _readU(offset: number) {
    return this._ubuffer[this._index + offset];
  }

  *items(count = this.count): IterableIterator<typeof this> {
    for (let i = 0; i < count; i++) {
      yield this;
      this.index++;
    }
  }

  *reverse(count = this.count): IterableIterator<typeof this> {
    this.index = this.index + count;
    for (let i = 0; i < count; i++) {
      this.index--;
      yield this;
    }
    this.index += count;
  }

  instances(count = this.count): T[] {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(this.object());
      this.index++;
    }
    return arr;
  }
}
export default BufferView;
