import type { OpenBWAPI, OpenBWWasm } from '.';
import { FrameBW } from '../integration/buffer-view';

export default class OpenBwWasmReader {
    openBw: OpenBWAPI;
    private _frame: FrameBW;

    constructor(api: OpenBWAPI) {
        this.openBw = api;
        this._frame = new FrameBW(api);
    }

    loadReplay(buffer: Buffer) {
        this.openBw.call.loadReplay(buffer);
    }

    next() {
        this._frame.update();
        return this._frame;
    }

    dispose() {
        // this.openBw._reset();
    }
}