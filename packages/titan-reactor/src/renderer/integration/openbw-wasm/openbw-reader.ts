import fs from 'fs';
import type {  OpenBWWasmAPI} from '../../openbw';
import { FrameBW, SoundsBufferView, TilesBufferView } from '../fixed-data';

export interface Heaps {
    HEAP8: Int8Array,
    HEAP16: Int16Array,
    HEAP32: Int32Array,
    HEAPU8: Uint8Array,
    HEAPU16: Uint16Array,
    HEAPU32: Uint32Array,
}

export default class OpenBwWasmReader {
    openBw: OpenBWWasmAPI;
    heaps: Heaps;

    constructor(api: OpenBWWasmAPI) {
        this.openBw = api;
        this.heaps = {
            HEAP8: this.openBw.HEAP8,
            HEAP16: this.openBw.HEAP16,
            HEAP32: this.openBw.HEAP32,
            HEAPU8: this.openBw.HEAPU8,
            HEAPU16: this.openBw.HEAPU16,
            HEAPU32: this.openBw.HEAPU32,
        }
    }

    loadReplay(buffer: Buffer) {
        const buf = this.openBw.allocate(buffer, this.openBw.ALLOC_NORMAL);
        this.openBw._load_replay(buf, buffer.length);
        this.openBw._free(buf);
    }

    next() {
        const frame = new FrameBW(this.heaps);
        frame.update(this.openBw);
        return frame;
    }

    dispose() {
        this.openBw._reset();
    }
}