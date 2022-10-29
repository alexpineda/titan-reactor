import { OpenBW } from "@openbw/openbw";
import { SpriteStruct } from "common/types";
import { ImageBufferView } from ".";
import { IntrusiveList } from "./intrusive-list";

/**
 * Maps to openbw sprite_t starting from index address
 */
export class SpritesBufferView implements SpriteStruct {
    readonly images: IntrusiveList;

    #address32 = 0;

    #bw: OpenBW;

    #mainImage: ImageBufferView;

    get( address: number ) {
        this.#address32 = ( address >> 2 ) + 2; //skip link base

        this.images.addr = address + ( 15 << 2 );
        return this;
    }

    constructor( bw: OpenBW ) {
        this.#bw = bw;
        this.images = new IntrusiveList( bw.HEAPU32, 0 );
        this.#mainImage = new ImageBufferView( bw );
    }

    get index() {
        return this.#bw.HEAPU32[this.#address32];
    }

    get typeId() {
        const addr = this.#bw.HEAPU32[this.#address32 + 1];
        return this.#bw.HEAP32[addr >> 2];
    }

    get owner() {
        return this.#bw.HEAP32[this.#address32 + 2];
    }

    get elevation() {
        return this.#bw.HEAP32[this.#address32 + 5];
    }

    get flags() {
        return this.#bw.HEAP32[this.#address32 + 6];
    }

    get x() {
        return this.#bw.HEAP32[this.#address32 + 10];
    }

    get y() {
        return this.#bw.HEAP32[this.#address32 + 11];
    }

    get mainImage() {
        const addr = this.#bw.HEAPU32[this.#address32 + 12];
        return this.#mainImage.get( addr );
    }

    get mainImageIndex() {
        const addr = this.#bw.HEAPU32[this.#address32 + 12];
        return this.#bw.HEAPU32[( addr >> 2 ) + 2];
    }

    get extYValue() {
        return this.#bw.HEAP32[this.#address32 + 15] / 255;
    }

    get extFlyOffset() {
        return this.#bw.HEAP32[this.#address32 + 16] / 255;
    }
}
