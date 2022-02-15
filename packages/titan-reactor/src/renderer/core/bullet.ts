import { BulletState } from "../../common/bwdat/enums";
import { BulletStruct } from "../integration/structs/bullet-struct";

export interface Bullet extends BulletStruct {
    bulletState: BulletState;
    bulletTargetIndex?: number;
    bulletTargetPosX: number;
    bulletTargetPosY: number;
    weaponTypeId: number;
    bulletOwnerUnitIndex?: number;
}