type TypedArray =
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
export class SimpleBufferView<K extends TypedArray> {
    viewSize: number;

    #viewOffset = 0;
    #address = 0;

    private readonly _structSizeInBytes;
    readonly #buffer: K;

    constructor( structSizeInBytes: number, address = 0, itemsCount = 0, buffer: K ) {
        this.#buffer = buffer;
        this.viewSize = itemsCount;
        this._structSizeInBytes = structSizeInBytes / buffer.BYTES_PER_ELEMENT;
        this.address = address;
    }

    set address( address: number ) {
        this.#viewOffset = address / this.#buffer.BYTES_PER_ELEMENT;
        this.#address = address;
    }

    get address() {
        return this.#address;
    }

    copy() {
        return this.#buffer.slice(
            this.#viewOffset,
            this.#viewOffset + this.viewSize * this._structSizeInBytes
        );
    }

    shallowCopy() {
        return this.#buffer.subarray(
            this.#viewOffset,
            this.#viewOffset + this.viewSize * this._structSizeInBytes
        ) as K;
    }
}
