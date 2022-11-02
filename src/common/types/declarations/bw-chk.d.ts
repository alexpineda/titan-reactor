declare module "bw-chk" {
    type NameOrUnknown<T> = T | "Unknown";
    type PossiblyUndefined<T> = {
        [P in keyof T]: T[P] | undefined;
    };

    type ScoreType =
        | "Total"
        | "Units"
        | "Buildings"
        | "UnitsAndBuildings"
        | "Kills"
        | "Razings"
        | "KillsAndRazings"
        | "Custom";

    type TriggerActionParams = PossiblyUndefined<{
        location: number;
        destLocation: number;
        movedLocation: number;
        player: number;
        destPlayer: number;
        time: number;
        modifierType: NameOrUnknown<"Set" | "Add" | "Subtract">;
        unitId: number;
        unitOrder: NameOrUnknown<"Move" | "Patrol" | "Attack">;
        unitAmount: number;
        allianceStatus: NameOrUnknown<"Enemy" | "Ally" | "AlliedVictory">;
        switchId: number;
        switchState: NameOrUnknown<"Set" | "Clear" | "Toggle" | "Randomize">;
        resourceType: NameOrUnknown<"Ore" | "Gas" | "OreAndGas">;
        scoreType: NameOrUnknown<ScoreType>;
        aiScript: number;
        alwaysDisplay: boolean;
        text: string;
        soundFile: string;
        state: NameOrUnknown<"Set" | "Clear" | "Toggle">;
    }>;

    type TriggerConditionParams = PossiblyUndefined<{
        location: number;
        player: number;
        amount: number;
        comparisionType: NameOrUnknown<"AtLeast" | "AtMost" | "Exactly">;
        unitId: number;
        switchId: number;
        switchState: NameOrUnknown<"Set" | "Clear">;
        resourceType: NameOrUnknown<"Ore" | "Gas" | "OreAndGas">;
        scoreType: NameOrUnknown<ScoreType>;
    }>;

    class Unit {
        x: number;
        y: number;
        unitId: number;
        player: number;
        resourceAmt: number;
        sprite?: number;
        isDisabled?: boolean;
    }

    class Sprite {
        x: number;
        y: number;
        spriteId: number;
        isDisabled: boolean;
    }

    type ReadFile = ( path: string ) => Promise<Buffer>;

    class FileAccess {
        constructor( cb: ReadFile );
        tileset: ( id: number ) => Promise<Buffer>;
        unit: ( id: number ) => Promise<Buffer>;
        sprite: ( id: number ) => Promise<Buffer>;
    }

    class TriggerAction {
        id: () => number;
        isDisabled: () => boolean;
        params: () => TriggerActionParams;
        rawByteView: () => Buffer;
    }
    class TriggerCondition {
        id: () => number;
        isDisabled: () => boolean;
        params: () => TriggerConditionParams;
        rawByteView: () => Buffer;
    }

    class Trigger {
        players: () => number[];
        conditions: () => Iterable<TriggerCondition>;
        allConditions: () => Iterable<TriggerCondition>;
        actions: () => Iterable<TriggerAction>;
        allActions: () => Iterable<TriggerAction>;
        rawByteView: () => Buffer;
    }

    type ImageOptions = {
        melee?: boolean;
        startLocations?: boolean;
    };

    type FileAccessFn = (
        filename: string,
        isOptional?: boolean
    ) => Promise<Buffer | null>;

    export enum ForceFlags {
        None = 0,
        RandomStartLocations = 0x1,
        StartAsAllied = 0x2,
        StartWithAlliedVictory = 0x4,
        StartWithSharedVision = 0x8,
    }

    export enum ForcePlayerRace {
        Zerg = 0x0,
        Terran = 0x1,
        Protoss = 0x2,
        UserSelectable = 0x5,
        ForcedRandom = 0x6,
    }

    export type ForcePlayer = {
        id: number;
        computer: boolean;
        type: string;
        typeId: number;
        race: ForcePlayerRace;
    };

    export type Force = {
        name: string;
        flags: number;
        players: number[];
    };

    export default class Chk {
        constructor( data: Buffer );

        static customFileAccess: ( cb: FileAccessFn ) => FileAccess;
        static fsFileAccess: ( directory: string ) => FileAccess;
        static actionIds(): Record<string, number>;
        static conditionIds(): number[];

        size: [number, number];
        title: string;
        description: string;
        tileset: number;
        tilesetName: string;
        _tiles: Buffer;

        forces: Force[];
        units: Unit[];
        sprites: Sprite[];
        triggers: () => Iterable<Trigger> & {
            size: number;
            iterateFrom: ( index: number ) => Iterable<Trigger>;
        };
        isEudMap: () => boolean;
        maxPlayers: ( isUms: boolean ) => number;
        encoding: () => string;

        image: (
            fileAccess: FileAccess,
            width: number,
            height: number,
            options?: ImageOptions
        ) => Promise<Buffer>;
    }
}
