import { OpenBW, SpriteStruct } from "common/types";
import { ImageBufferView } from ".";
import { IntrusiveList } from "./intrusive-list";

/**
 * Maps to openbw sprite_t starting from index address
 */
export class SpritesBufferView
  implements SpriteStruct {

  _address = 0;
  _bw: OpenBW;
  #mainImage: ImageBufferView;
  readonly images: IntrusiveList;

  get(address: number) {
    this._address = address;
    this.images.addr = address + (15 << 2);
    return this;
  }

  constructor(bw: OpenBW) {
    this._bw = bw;
    this.images = new IntrusiveList(bw.HEAPU32, 0);
    this.#mainImage = new ImageBufferView(bw);
  }

  private get _index32() {
    return (this._address >> 2) + 2; //skip link base
  }

  get index() {
    return this._bw.HEAPU32[this._index32];
  }

  get typeId() {
    const addr = this._bw.HEAPU32[this._index32 + 1];
    return this._bw.HEAP32[addr >> 2];
  }

  get owner() {
    return this._bw.HEAP32[this._index32 + 2];
  }

  get elevation() {
    return this._bw.HEAP32[this._index32 + 5];
  }

  get flags() {
    return this._bw.HEAP32[this._index32 + 6];
  }

  get x() {
    return this._bw.HEAP32[this._index32 + 10];
  }

  get y() {
    return this._bw.HEAP32[this._index32 + 11];
  }

  get mainImage() {
    const addr = this._bw.HEAPU32[this._index32 + 12];
    return this.#mainImage.get(addr);
  }

  get mainImageIndex() {
    const addr = this._bw.HEAPU32[this._index32 + 12];
    return this._bw.HEAPU32[(addr >> 2) + 2];
  }

}

export class SpritesBufferViewIterator {
  #openBW: OpenBW;
  #sprites: SpritesBufferView;
  constructor(openBW: OpenBW) {
    this.#openBW = openBW;
    this.#sprites = new SpritesBufferView(openBW);
  }

  *[Symbol.iterator]() {
    const spriteList = new IntrusiveList(this.#openBW.HEAPU32);
    const spriteTileLineSize = this.#openBW.getSpritesOnTileLineSize();
    const spritetileAddr = this.#openBW.getSpritesOnTileLineAddress();
    for (let l = 0; l < spriteTileLineSize; l++) {
      spriteList.addr = spritetileAddr + (l << 3)
      for (const spriteAddr of spriteList) {
        if (spriteAddr === 0) {
          continue;
        }
        yield this.#sprites.get(spriteAddr);
      }
    }
  }

  getSprite(addr: number) {
    return this.#sprites.get(addr);
  }
}