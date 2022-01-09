import { Player, UnitTag } from "../../common/types";
import { BuildingQueueStruct } from "../integration/data-transfer/building-queue-struct";
import { UnitStruct } from "../integration/data-transfer/unit-struct";

export type CrapUnit = UnitStruct & {
    id: UnitTag;
    owner: Player;
    hp: number;
    shields: number;
    typeId: number;
    order: number;
    energy: number;
    kills: number;

    x: number;
    y: number;
    tileX: number;
    tileY: number;

    queue: BuildingQueueStruct | null;
    loaded: (CrapUnit | undefined)[] | null;

    remainingBuildTime: number;
    recievingDamage: number;
    resourceAmount: number | null;
    remainingTrainTime: number;

    //@todo deprecate
    groundWeaponCooldown: number;
    isComplete: boolean;
    wasConstructing: boolean;
    wasFlying: boolean;
    isNowFlying: boolean;
    isFlyingBuilding: boolean;
    dieTime: number;
    showOnMinimap: boolean;
    canSelect: boolean;
    warpingIn?: number;
    warpingLen: number;
    unitId: number;
    ownerId: number;
    selected: boolean;
}