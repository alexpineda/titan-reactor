import type { OpenBWWasm } from '.';
import { FrameBW } from '../integration/buffer-view';

export interface Heaps {
    HEAP8: Int8Array,
    HEAP16: Int16Array,
    HEAP32: Int32Array,
    HEAPU8: Uint8Array,
    HEAPU16: Uint16Array,
    HEAPU32: Uint32Array,
}

// @todo move this up to api level
const tryCatch = (cb: Function, openBw: OpenBWWasm) => {
    try {
        cb();
    } catch (e) {
        if (typeof e === 'number') {
            throw new Error(openBw.getExceptionMessage(e));
        } else {
            throw e;
        }
    }
}

export default class OpenBwWasmReader {
    openBw: OpenBWWasm;
    heaps: Heaps;
    private _frame: FrameBW;

    constructor(api: OpenBWWasm) {
        this.openBw = api;
        this.heaps = {
            HEAP8: this.openBw.HEAP8,
            HEAP16: this.openBw.HEAP16,
            HEAP32: this.openBw.HEAP32,
            HEAPU8: this.openBw.HEAPU8,
            HEAPU16: this.openBw.HEAPU16,
            HEAPU32: this.openBw.HEAPU32,
        }
        this._frame = new FrameBW(api);
    }

    loadReplay(buffer: Buffer) {
        tryCatch(() => {
            const buf = this.openBw.allocate(buffer, this.openBw.ALLOC_NORMAL);
            this.openBw._load_replay(buf, buffer.length);
            this.openBw._free(buf);
        }, this.openBw);
    }

    next() {
        tryCatch(() => {
            this._frame.update();
        }, this.openBw)
        return this._frame;
    }

    dispose() {
        // this.openBw._reset();
    }
}