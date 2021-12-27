declare const __static: string;
declare module "postprocessing";
declare module "scm-extractor";


declare module "bw-chk" {

    class ChkUnit {
        x: number;
        y: number;
        unitId: number;
        player: number;
        resourceAmt: number;
        sprite?: number;
        isDisabled?: boolean;
    };

    class ChkSprite {
        x: number;
        y: number;
        spriteId: number;
        isDisabled: boolean;
    };

    export default class Chk {
        title: string | "";
        description: string | "";
        tileset: number;
        units: ChkUnit[];
        sprites: ChkSprite[];
        _tiles: Buffer;
        size: [number, number];
        constructor(data: Buffer);
    }
}



declare module "*!worker" {

    class Worker {
        postMessage(message: {}, transferList?: any[]): void;
        onmessage?: (message: { data: any; }) => void;
        terminate(): void;
    }
    export default Worker;
}

declare module "downgrade-replay" {

    // import Chk from "bw-chk";

    export class Replay {
        version: Version;
        rawCmds: Buffer;
        chk: Buffer;
        header: {
            frameCount: number;
            players: Player[];
        }
    }

    export class CommandsStream {
        constructor(buffer: Buffer);
        generate(): IterableIterator<any>;
    }

    export class ChkDowngrader {

    }

    export function sidegradeReplay(replay: Replay, chkDowngrader?: ChkDowngrader);
    export function parseReplay(buf: Buffer): Promise<Replay>;
    export enum Version {
        classic,
        remastered,
        titanReactor,
    }
}