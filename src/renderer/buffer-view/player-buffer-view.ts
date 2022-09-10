export enum PlayerController {
    InActive = 0,
    ComputerGame = 1,
    Occupied = 2,
    Rescuable = 3,
    UnusedRescuePassive = 4,
    Computer = 5,
    Open = 6,
    Neutral = 7,
    Closed = 8,
    UnusedObserver = 9,
    UserLeft = 10,
    ComputerDefeated = 11
}

import { Race } from "common/enums";
import { OpenBW } from "common/types";

/**
 * Maps to openbw player_t
 */
export class PlayerBufferView {

    protected _address = 0;
    protected _bw: OpenBW;

    get address() {
        return this._address;
    }

    get(address: number) {
        this._address = address;
        return this;
    }

    constructor(bw: OpenBW) {
        this._bw = bw;
    }

    protected get _addr8() {
        return this._address; //skip link base
    }

    protected get _addr32() {
        return (this._address >> 2); //skip link base
    }

    get controller(): PlayerController {
        return this._bw.HEAPU32[this._addr32 + 0];
    }

    get race(): Race {
        return this._bw.HEAPU32[this._addr32 + 1];
    }

    get force() {
        return this._bw.HEAPU32[this._addr32 + 2];
    }

    get color() {
        return this._bw.HEAPU32[this._addr32 + 3];
    }

    get initiallyActive() {
        return !!this._bw.HEAPU32[this._addr32 + 4];
    }


    get victoryState() {
        return this._bw.HEAPU32[this._addr32 + 5];
    }

}


export class PlayerBufferViewIterator {
    #openBW: OpenBW;
    #player: PlayerBufferView;
    constructor(openBW: OpenBW) {
        this.#openBW = openBW;
        this.#player = new PlayerBufferView(openBW);
    }

    *[Symbol.iterator]() {
        let addr = this.#openBW.getPlayersAddress();
        for (let l = 0; l < 8; l++) {
            addr = addr + ((l * 5) << 2);
            yield this.#player.get(addr);
        }
    }

}