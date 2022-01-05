import assert from 'assert';
import { openBw} from '../../openbw';

class OpenBwReader {
    openBw: any;

    constructor(api: any) {
        this.openBw = api;
    }

    next() {
        this.openBw._next_frame();
    }
}