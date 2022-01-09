import { Player, UnitTag, UnitDAT } from "../../common/types";
import { BuildingQueueRAW } from "../integration/building-queue-raw";
import { UnitRAW } from "../integration/unit-raw";

export type CrapUnit = UnitRAW & {
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

    queue: BuildingQueueRAW | null;
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