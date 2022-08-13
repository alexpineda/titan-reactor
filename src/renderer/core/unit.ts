import { Vector2 } from "three";
import type { UnitDAT } from "common/types";
import type { UnitStruct } from "common/types/structs";

export interface Unit extends UnitStruct {
    extras: {
        recievingDamage: number;
        selected?: boolean;
        dat: UnitDAT,
        /** @internal */
        turretLo: Vector2 | null;
    }
}

export interface DumpedUnit extends Unit {
    remainingTrainTime?: number;
    upgrade?: {
        id: number;
        level: number;
        time: number;
    }

    research?: {
        id: number;
        time: number;
    }

    loaded?: { id: number, typeId: number, hp: number }[]
    buildQueue?: number[];

}