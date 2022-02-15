import UnitsBufferView from "../buffer-view/units-buffer-view";
import { FlingyStruct } from "./flingy-struct";

export interface BulletStruct extends FlingyStruct {
    bulletState: number;
    bulletTarget?: UnitsBufferView;
    bulletTargetPosX: number;
    bulletTargetPosY: number;
    weaponTypeId: number;
    bulletOwnerUnit?: UnitsBufferView;
}
