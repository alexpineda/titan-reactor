declare module "downgrade-replay" {
    export interface ReplayPlayer {
        color: {
            hex: string;
            id: number;
            name: string;
            rgb: number;
        },
        id: number;
        isComputer: boolean;
        name: string;
        race: "zerg" | "protoss" | "terran";
        team: number;
    }
    export class Replay {
        version: Version;
        rawCmds: Buffer;
        chk: Buffer;
        header: {
            frameCount: number;
            players: ReplayPlayer[];
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