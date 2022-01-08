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
        this.openBw._next_frame();
        const frame = new FrameBW(this.heaps);
        frame.frame = this.openBw._replay_get_value(2);
        // console.log("units", openBw._counts(0, 1));
        // console.log("upgrades", openBw._counts(0, 2));
        // console.log("research", openBw._counts(0, 3));
        // console.log("sprite", openBw._counts(0, 4));
        // console.log("image", openBw._counts(0, 5));
        // console.log("sound", openBw._counts(0, 6));
        // console.log("building queue", openBw._counts(0, 7));
        // for (let i = 0; i < 8; ++i) {
        //     console.log("minerals", openBw._counts(i, 8));
        //     console.log("gas", openBw._counts(i, 9));
        //     console.log("workers", openBw._counts(i, 12));
        //     console.log("army", openBw._counts(i, 13));
        // }

        frame.setTilesView(this.openBw._get_buffer(0), this.openBw._counts(0, 0));
            
        frame.setSoundsView(this.openBw._get_buffer(8), this.openBw._counts(0, 6));


        // const creep = this.openBw._get_buffer(1);
        // frame.setBuffer("creep", creep, 0, creep.byteLength);

        // const units = this.openBw._get_buffer(2);
        // frame.setBuffer("units", units, 0, units.byteLength);

        // const buildingQueue = this.openBw._get_buffer(3);
        // frame.setBuffer("buildingQueue", buildingQueue, 0, buildingQueue.byteLength);

        // const upgrades = this.openBw._get_buffer(4);
        // frame.setBuffer("upgrades", upgrades, 0, upgrades.byteLength);

        // const research = this.openBw._get_buffer(5);
        // frame.setBuffer("research", research, 0, research.byteLength);

        // const sprites = this.openBw._get_buffer(6);
        // frame.setBuffer("sprites", sprites, 0, sprites.byteLength);

        // const images = this.openBw._get_buffer(7);
        // frame.setBuffer("images", images, 0, images.byteLength);

        // const sounds = this.openBw._get_buffer(8);
        // frame.setBuffer("sounds", sounds, 0, sounds.byteLength);

        return frame;
    }

    dispose() {
        this.openBw._reset();
    }
}