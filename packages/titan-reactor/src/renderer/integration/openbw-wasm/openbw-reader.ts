import fs from 'fs';
import type {  OpenBWWasmAPI} from '../../openbw';
import { FrameBW, TilesBW } from '../fixed-data';

export default class OpenBwWasmReader {
    openBw: OpenBWWasmAPI;

    constructor(api: OpenBWWasmAPI) {
        this.openBw = api;
    }

    loadReplay(buffer: Buffer) {
        const buf = this.openBw.allocate(buffer, this.openBw.ALLOC_NORMAL);
        this.openBw._load_replay(buf, buffer.length);
        this.openBw._free(buf);
    }

    next() {
        this.openBw._next_frame_exact();
        const frame = new FrameBW();
        frame.frame = this.openBw._replay_get_value(2);
        // frame.creepCount = this.tilesCount;
        // frame.unitCount = this.openBw._counts(1);
        // frame.upgradeCount = this.openBw._counts(2);
        // frame.researchCount = this.openBw._counts(3);
        // frame.spriteCount = this.openBw._counts(4);
        // frame.imageCount = this.openBw._counts(5);
        // frame.soundCount = this.openBw._counts(6);
        // frame.buildingQueueCount = this.openBw._counts(7);
        // for (let i = 0; i < 8; i++) {
        //     frame.minerals[i] = this.openBw._resources(0);
        //     frame.gas[i] = this.openBw._resources(1);
        //     frame.supplyUsed[i] = this.openBw._resources(2);
        //     frame.supplyAvailable[i] = this.openBw._resources(3);
        //     frame.workerSupply[i] = this.openBw._resources(4);
        // }

        const tilesPtr = this.openBw._get_buffer(0);
        frame.tiles = new TilesBW(
            TilesBW.STRUCT_SIZE,
            tilesPtr,
            this.openBw._counts(0, 0),
            this.openBw.HEAP8,
            this.openBw.HEAPU8,
        )

        if (frame.frame === 0) {
            fs.writeFileSync("fog.bin", frame.tiles.ubuffer)
        }
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