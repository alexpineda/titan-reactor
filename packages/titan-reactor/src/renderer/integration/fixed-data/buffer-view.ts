import { EntityIterator } from "./entity-iterator";

type TypedArray = Int8Array | Int16Array | Int32Array;
type UTypedArray = Uint8Array | Uint16Array | Uint32Array;
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
// @todo allow reading of any heap type
export abstract class BufferView<T> implements EntityIterator<T> {
  itemsCount: number;

  private _itemIndex = 0;
  private _ptrIndex = 0;

  private readonly _structSizeInBytes;
  private readonly _buffer: TypedArray;
  private readonly _ubuffer: UTypedArray;

  constructor(structSizeInBytes:number, ptr = 0, itemsCount = 0, buffer: TypedArray, ubuffer: UTypedArray) {
    this._buffer = buffer;
    this._ubuffer = ubuffer;
    this.itemsCount = itemsCount;
    this._structSizeInBytes = structSizeInBytes / buffer.BYTES_PER_ELEMENT;
    this.ptrIndex = ptr;
  }

  set ptrIndex(index: number) {
    this._itemIndex = index / this._buffer.BYTES_PER_ELEMENT;
    this._ptrIndex = index;
  }

  get ptrIndex() {
    return this._ptrIndex;
  }

  copy() {
    return this._buffer.slice(this._itemIndex, this._itemIndex + this.itemsCount * this._structSizeInBytes);
  }

  object(): T {
    throw new Error("Not implemented");
  }

  protected _read(offset: number) {
    return this._buffer[this._itemIndex + offset];
  }

  protected _readU(offset: number) {
    return this._ubuffer[this._itemIndex + offset];
  }

  // protected _read8(offset: number) {
  //   return this.heaps.HEAP8[this._ptrIndex + offset];
  // }

  // protected _readU8(offset: number) {
  //   return this.heaps.HEAPU8[this._ptrIndex + offset];
  // }

  // protected _read16(offset: number) {
  //   return this.heaps.HEAP16[this._ptrIndex / 2 + offset];
  // }

  // protected _readU16(offset: number) {
  //   return this.heaps.HEAPU16[this._ptrIndex / 2 + offset];
  // }

  // protected _read32(offset: number) {
  //   return this.heaps.HEAP32[this._ptrIndex / 4 + offset];
  // }

  // protected _readU32(offset: number) {
  //   return this.heaps.HEAPU32[this._ptrIndex / 4 + offset];
  // }

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
export default BufferView;
