import { FlingyStruct } from "./flingy-struct";

export interface BulletStruct extends FlingyStruct {
    state: number;
    targetPosX: number;
    targetPosY: number;
    weaponTypeId: number;
    remainingTime: number;
    targetUnit?: number;
    ownerUnit?: number;
    prevBounceUnit?: number;
}
