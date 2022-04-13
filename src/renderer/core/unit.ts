import type { Player, UnitDAT } from "../../common/types";
import type { UnitStruct } from "../../common/types/structs";
import type { Mesh } from "three";

export type Unit = UnitStruct & {
    extras: {
        player?: Player;
        recievingDamage: number;
        timeOfDeath?: number;
        warpingIn?: number;
        warpingLen?: number;
        selected?: boolean;
        highlight: Mesh;
        dat: UnitDAT
    }
}