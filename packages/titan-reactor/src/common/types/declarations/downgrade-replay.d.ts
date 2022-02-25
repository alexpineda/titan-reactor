declare module "downgrade-replay" {
    export class Replay {
        version: Version;
        rawCmds: Buffer;
        chk: Buffer;
        header: {
            frameCount: number;
            players: Player[];
        };
        containerSize: 1700 | 3400;
    }

    export class CommandsStream {
        constructor(buffer: Buffer);
        generate(): IterableIterator<any>;
    }

    export class ChkDowngrader {

    }

    export function convertReplay(replay: Replay, chkDowngrader?: ChkDowngrader): Buffer;
    export function parseReplay(buf: Buffer): Promise<Replay>;
    export enum Version {
        classic,
        remastered,
        titanReactor,
    }
}