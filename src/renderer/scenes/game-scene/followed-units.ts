import { Unit } from "@core";
import { Vector3 } from "three";
import { debounce } from "lodash";
import { PxToWorld } from "common/utils/conversions";

const followedUnits: Unit[] = [];
let _followedUnitsPosition = new Vector3();
export const followUnits = (units: Unit[]) => {
    followedUnits.length = 0;
    followedUnits.push(...units);
}

export const hasFollowedUnits = () => followedUnits.length > 0;
export const unfollowUnit = (unit: Unit) => {
    const idx = followedUnits.indexOf(unit);
    if (idx > -1) {
        followedUnits.splice(idx, 1);
    }
}

export const clearFollowedUnits = () => {
    if (followedUnits.length > 0) {
        followedUnits.length = 0;
    }
}

export const calculateFollowedUnitsTarget = debounce((pxToGameUnit: PxToWorld) => {
    if (followedUnits.length === 0) {
        return;
    }

    _followedUnitsPosition.set(pxToGameUnit.x(followedUnits[0].x), 0, pxToGameUnit.y(followedUnits[0].y));

    for (let i = 1; i < followedUnits.length; i++) {
        _followedUnitsPosition.set(
            (_followedUnitsPosition.x + pxToGameUnit.x(followedUnits[i].x)) / 2,
            0,
            (_followedUnitsPosition.z + pxToGameUnit.y(followedUnits[i].y)) / 2
        )
    }
    return _followedUnitsPosition;
}, 30);