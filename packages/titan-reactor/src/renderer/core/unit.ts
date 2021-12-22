import { Player, UnitTag, UnitDAT } from "../../common/types";
import { BuildingQueueRAW } from "../integration/building-queue-raw";
import { UnitRAW } from "../integration/unit-raw";

export type Unit = UnitRAW & {
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

    dat: UnitDAT;
    queue: BuildingQueueRAW | null;
    loaded: (Unit | undefined)[] | null;

    remainingBuildTime: number;
    idleTime: number;
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