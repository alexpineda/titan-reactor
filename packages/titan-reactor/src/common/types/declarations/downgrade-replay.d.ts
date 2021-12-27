
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