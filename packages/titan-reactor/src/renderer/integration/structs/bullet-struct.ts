import UnitsBufferView from "../buffer-view/units-buffer-view";
import { FlingyStruct } from "./flingy-struct";

export interface BulletStruct extends FlingyStruct {
    state: number;
    targetUnit?: UnitsBufferView;
    targetPosX: number;
    targetPosY: number;
    weaponTypeId: number;
    ownerUnit?: UnitsBufferView;
    prevBounceUnit?: UnitsBufferView;
}
