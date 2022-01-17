import { Player } from "../../common/types";
import { UnitStruct } from "../integration/data-transfer/unit-struct";
import { Sprite } from "."

export type CrapUnit = UnitStruct & {
    extra: {
        sprite: Sprite;
        player?: Player;
        recievingDamage: number;
        isComplete?: boolean;
        wasFlying?: boolean;
        isNowFlying?: boolean;
        timeOfDeath?: number;
        showOnMinimap?: boolean;
        canSelect?: boolean;
        warpingIn?: number;
        warpingLen?: number;
        selected?: boolean;
    }
}