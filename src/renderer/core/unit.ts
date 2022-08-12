import { Vector2 } from "three";
import type { UnitDAT } from "common/types";
import type { UnitStruct } from "common/types/structs";

export type Unit = UnitStruct & {
    extras: {
        recievingDamage: number;
        selected?: boolean;
        dat: UnitDAT,
        /** @internal */
        turretLo: Vector2 | null;
    }
}