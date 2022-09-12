import { DeepPartial } from "common/types";
import { diff } from "deep-diff";
import lSet from "lodash.set";
import lGet from "lodash.get";

export function createDiff<T extends {}>(newValue: T, previousValue: T) {
    const diffs = diff(previousValue, newValue);
    if (diffs === undefined)
        return;

    //@ts-ignore
    const diffValues: DeepPartial<T> = {};

    for (const d of diffs) {
        //TODO add A support
        if (d.kind === "E" && d.path) {
            const parentProp = lGet(newValue, d.path.slice(0, d.path.length - 1));
            // don't diff down to array elements, just the entire array is fine!
            // otherwise we're left with a sparse array :(
            if (Array.isArray(parentProp) && typeof d.path[d.path.length - 1] === "number") {
                lSet(parentProp, d.path, d.rhs);
                lSet<DeepPartial<T>>(diffValues, d.path.slice(0, d.path.length - 1), parentProp);
            } else {
                lSet<DeepPartial<T>>(diffValues, d.path, d.rhs);
            }
        }
    }

    return diffValues;
}