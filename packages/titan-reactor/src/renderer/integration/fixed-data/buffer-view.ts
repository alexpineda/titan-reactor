type TypedArray = Int8Array | Int16Array | Int32Array;
type UTypedArray = Uint8Array | Uint16Array | Uint32Array;
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
export abstract class BufferView<T> {
  readonly itemsCount: number;
  private index: number;

  private readonly _structSize;
  private readonly _buffer: TypedArray;
  private readonly _ubuffer: UTypedArray;

  constructor(structSize:number, ptr = 0, itemsCount = 0, buffer: TypedArray, ubuffer: UTypedArray) {
    this._buffer = buffer;
    this._ubuffer = ubuffer;
    this.itemsCount = itemsCount;
    this._structSize = structSize / buffer.BYTES_PER_ELEMENT;
    this.index = ptr / buffer.BYTES_PER_ELEMENT;
  }

  get buffer() {
    return this._buffer.slice(this.index, this.index + this.itemsCount * this._structSize);
  }

  get ubuffer() {
    return this._ubuffer.slice(this.index, this.index + this.itemsCount * this._structSize);
  }

  object(): T {
    throw new Error("Not implemented");
  }

  _read(offset: number) {
    return this._buffer[this.index + offset];
  }

  _readU(offset: number) {
    return this._ubuffer[this.index + offset];
  }

  *items(count = this.itemsCount): IterableIterator<typeof this> {
    const _index = this.index;
    for (let i = 0; i < count; i++) {
      yield this;
      this.index++;
    }
    this.index = _index;
  }

  *reverse(count = this.itemsCount): IterableIterator<typeof this> {
    this.index = this.index + count;
    for (let i = 0; i < count; i++) {
      this.index--;
      yield this;
    }
    this.index += count;
  }

  instances(count = this.itemsCount): T[] {
    const arr = [];
    const _index = this.index;
    for (let i = 0; i < count; i++) {
      arr.push(this.object());
      this.index++;
    }
    this.index = _index;
    return arr;
  }
}
export default BufferView;
