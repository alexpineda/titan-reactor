import { OpenBW, ImageStruct } from "common/types";
import { IScriptBufferView } from "./iscript-buffer-view";
export class ImageBufferView
  implements ImageStruct {

  #address = 0;
  #address32 = 0;

  #bw: OpenBW;
  #iscriptState: IScriptBufferView;

  get(address: number) {
    this._address = address;
    return this;
  }

  get _address() {
    return this.#address;
  }

  set _address(val: number) {
    this.#address = val;
    this.#address32 = val >> 2;
  }

  constructor(bw: OpenBW) {
    this.#bw = bw;
    this.#iscriptState = new IScriptBufferView(bw);
  }

  get index() {
    return this.#bw.HEAPU32[this.#address32 + 2];
  }

  get typeId() {
    const addr = this.#bw.HEAPU32[this.#address32 + 3];
    return this.#bw.HEAP32[addr >> 2];
  }

  get modifier() {
    return this.#bw.HEAP32[this.#address32 + 4];
  }

  get modifierData1() {
    return this.#bw.HEAP32[this.#address32 + 5];
  }

  get modifierData2() {
    return this.#bw.HEAP32[this.#address32 + 6];
  }

  get frameIndex() {
    return this.#bw.HEAPU32[this.#address32 + 7];
  }

  get frameIndexBase() {
    return this.#bw.HEAPU32[this.#address32 + 8];
  }

  get frameIndexOffset() {
    return this.#bw.HEAPU32[this.#address32 + 9];
  }

  get flags() {
    return this.#bw.HEAP32[this.#address32 + 10];
  }

  get x() {
    return this.#bw.HEAP32[this.#address32 + 11];
  }

  get y() {
    return this.#bw.HEAP32[this.#address32 + 12];
  }

  get iscript() {
    return this.#iscriptState.get((this.#address32 + 13) << 2);
  }

  get nextNode() {
    return this.#bw.HEAPU32[this.#address32];
  }

  *[Symbol.iterator]() {
    const header = this._address;
    do {
      yield this;
      this._address = this.nextNode;
    } while (header !== this._address); // intrusive list
  }

  copy(any: Partial<ImageStruct>) {
    any.flags = this.flags;
    any.frameIndex = this.frameIndex;
    any.frameIndexBase = this.frameIndexBase;
    any.frameIndexOffset = this.frameIndexOffset;
    any.index = this.index;
    any.typeId = this.typeId;
    any.modifier = this.modifier;
    any.modifierData1 = this.modifierData1;
    any.modifierData2 = this.modifierData2;
    any.x = this.x;
    any.y = this.y;
    return any;
  }

}



export function* deletedImageIterator(openBW: OpenBW) {
  const deleteImageCount = openBW._counts(15);
  const deletedImageAddr = openBW._get_buffer(3);

  for (let i = 0; i < deleteImageCount; i++) {
    yield openBW.HEAP32[(deletedImageAddr >> 2) + i];
  }
}