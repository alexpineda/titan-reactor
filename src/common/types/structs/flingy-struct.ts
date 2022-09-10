import { UnitStruct } from "titan-reactor/host";
import { ThingyStruct } from "./thingy-struct";

export interface FlingyStruct extends ThingyStruct {
    x: number;
    y: number;
    direction: number;
    moveTargetX: number;
    moveTargetY: number;
    moveTargetUnit: UnitStruct | null;
    nextMovementWaypointX: number;
    nextMovementWaypointY: number;
    nextTargetWaypointX: number;
    nextTargetWaypointY: number;
    movementFlags: number;
}
