import { Vector2 } from "three";
import type { Player, UnitDAT } from "../../common/types";
import type { UnitStruct } from "../../common/types/structs";

export type Unit = UnitStruct & {
    extras: {
        player?: Player;
        recievingDamage: number;
        selected?: boolean;
        dat: UnitDAT,
        turretLo: Vector2 | null;
    }
}