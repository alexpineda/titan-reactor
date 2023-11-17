import { ThingyStruct } from "./thingy-struct";

export interface FlingyStruct extends ThingyStruct {
    x: number;
    y: number;
    direction: number;
    currentSpeed: number;
    moveTargetX: number;
    moveTargetY: number;
    nextMovementWaypointX: number;
    nextMovementWaypointY: number;
    nextTargetWaypointX: number;
    nextTargetWaypointY: number;
    movementFlags: number;
    currentVelocityDirection: number;
}
