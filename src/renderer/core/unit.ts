import type { Player, UnitDAT } from "../../common/types";
import type { UnitStruct } from "../../common/types/structs";

export type Unit = UnitStruct & {
    extras: {
        player?: Player;
        recievingDamage: number;
        warpingIn?: number;
        warpingLen?: number;
        selected?: boolean;
        dat: UnitDAT
    }
}