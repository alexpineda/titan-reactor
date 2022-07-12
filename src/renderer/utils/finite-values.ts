import { Vector3 } from "three";

export const isFiniteVector3 = (v: Vector3) => {
    return !(Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z) || v.x === Infinity || v.y === Infinity || v.z === Infinity || v.x === -Infinity || v.y === -Infinity || v.z === -Infinity || v.x === undefined || v.y === undefined || v.z === undefined);
}