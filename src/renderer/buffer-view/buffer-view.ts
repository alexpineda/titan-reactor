import { EntityIterator } from "./entity-iterator";

type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array;
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
export abstract class BufferView<T> implements EntityIterator<T> {
  itemsCount: number;

  private _itemIndex = 0;
  private _ptrIndex = 0;

  private readonly _structSizeInBytes;
  readonly buffer: TypedArray;

  constructor(structSizeInBytes: number, ptr = 0, itemsCount = 0, buffer: TypedArray) {
    this.buffer = buffer;
    this.itemsCount = itemsCount;
    this._structSizeInBytes = structSizeInBytes / buffer.BYTES_PER_ELEMENT;
    this.ptrIndex = ptr;
  }

  set ptrIndex(index: number) {
    this._itemIndex = index / this.buffer.BYTES_PER_ELEMENT;
    this._ptrIndex = index;
  }

  get ptrIndex() {
    return this._ptrIndex;
  }

  copy() {
    return this.buffer.slice(this._itemIndex, this._itemIndex + this.itemsCount * this._structSizeInBytes);
  }

  shallowCopy() {
    return this.buffer.subarray(this._itemIndex, this._itemIndex + this.itemsCount * this._structSizeInBytes);
  }

  object(): T {
    throw new Error("Not implemented");
  }

  protected _read(offset: number) {
    return this.buffer[this._itemIndex + offset];
  }

  *items(count = this.itemsCount) {
    const _index = this._itemIndex;
    for (let i = 0; i < count; i++) {
      yield this as unknown as T;
      this._itemIndex++;
    }
    this._itemIndex = _index;
  }

  *reverse(count = this.itemsCount) {
    this._itemIndex = this._itemIndex + count;
    for (let i = 0; i < count; i++) {
      this._itemIndex--;
      yield this as unknown as T;
    }
    this._itemIndex += count;
  }

  instances(count = this.itemsCount): T[] {
    const arr = [];
    const _index = this._itemIndex;
    for (let i = 0; i < count; i++) {
      arr.push(this.object());
      this._itemIndex++;
    }
    this._itemIndex = _index;
    return arr;
  }
}
