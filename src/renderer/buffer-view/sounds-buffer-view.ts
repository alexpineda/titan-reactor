import { OpenBW } from "common/types";

export class SoundsBufferView {
    #address = 0;
    #bw: OpenBW;

    get( address: number ) {
        this.#address = address;
        return this;
    }

    constructor( bw: OpenBW ) {
        this.#bw = bw;
    }

    private get _index32() {
        return ( this.#address >> 2 ) + 2; //skip link base
    }

    get typeId() {
        return this.#bw.HEAPU32[this._index32];
    }

    get x() {
        return this.#bw.HEAPU32[this._index32 + 1];
    }

    get y() {
        return this.#bw.HEAPU32[this._index32 + 2];
    }

    get unitTypeId() {
        return this.#bw.HEAPU32[this._index32 + 3];
    }
}

export const createSoundBufferIterator = ( openBW: OpenBW ) => {
    const _soundBufferView = new SoundsBufferView( openBW );
    const soundsAddr = openBW.getSoundsAddress();

    return function* soundsBufferViewIterator() {
        for ( let i = 0; i < openBW.getSoundsCount(); i++ ) {
            const addr = soundsAddr + ( i << 4 );
            yield _soundBufferView.get( addr );
        }
    };
};
