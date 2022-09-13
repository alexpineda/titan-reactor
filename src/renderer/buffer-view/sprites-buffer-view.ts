import { OpenBW, SpriteStruct } from "common/types";
import { ImageBufferView } from ".";
import { IntrusiveList } from "./intrusive-list";

/**
 * Maps to openbw sprite_t starting from index address
 */
export class SpritesBufferView
  implements SpriteStruct {

  readonly images: IntrusiveList;

  #address = 0;
  #bw: OpenBW;
  #mainImage: ImageBufferView;

  get(address: number) {
    this.#address = address;
    this.images.addr = address + (15 << 2);
    return this;
  }

  constructor(bw: OpenBW) {
    this.#bw = bw;
    this.images = new IntrusiveList(bw.HEAPU32, 0);
    this.#mainImage = new ImageBufferView(bw);
  }

  private get _index32() {
    return (this.#address >> 2) + 2; //skip link base
  }

  get index() {
    return this.#bw.HEAPU32[this._index32];
  }

  get typeId() {
    const addr = this.#bw.HEAPU32[this._index32 + 1];
    return this.#bw.HEAP32[addr >> 2];
  }

  get owner() {
    return this.#bw.HEAP32[this._index32 + 2];
  }

  get elevation() {
    return this.#bw.HEAP32[this._index32 + 5];
  }

  get flags() {
    return this.#bw.HEAP32[this._index32 + 6];
  }

  get x() {
    return this.#bw.HEAP32[this._index32 + 10];
  }

  get y() {
    return this.#bw.HEAP32[this._index32 + 11];
  }

  get mainImage() {
    const addr = this.#bw.HEAPU32[this._index32 + 12];
    return this.#mainImage.get(addr);
  }

  get mainImageIndex() {
    const addr = this.#bw.HEAPU32[this._index32 + 12];
    return this.#bw.HEAPU32[(addr >> 2) + 2];
  }

  get extYValue() {
    return this.#bw.HEAP32[this._index32 + 15] / 255;
  }

  get extFlyOffset() {
    return this.#bw.HEAP32[this._index32 + 16] / 255;
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

export function* deletedSpritesIterator(openBW: OpenBW) {
  const deletedSpriteCount = openBW._counts(16);
  const deletedSpriteAddr = openBW._get_buffer(4);


  for (let i = 0; i < deletedSpriteCount; i++) {
    yield openBW.HEAP32[(deletedSpriteAddr >> 2) + i];
  }
}