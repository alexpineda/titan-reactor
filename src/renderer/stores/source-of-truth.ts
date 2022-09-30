import { arrayOverwriteMerge, intersection } from "@utils/object-utils";
import { DeepPartial } from "common/types";
import get from "lodash.get";
import deepMerge from "deepmerge";

const structuredClone = globalThis.structuredClone || ((x: object) => JSON.parse(JSON.stringify(x)));
export class SourceOfTruth<T extends object> {

    #data: T;
    onUpdate: ((diff: DeepPartial<T>) => void) | undefined;

    constructor(data: T) {

        this.#data = data;

    }

    getValue(path: string[]): any {

        return get(this.#data, path);

    }

    update(data: Partial<T>) {

        const result = intersection(this.#data, data) as DeepPartial<T>;
        this.#data = deepMerge(this.#data, result, { arrayMerge: arrayOverwriteMerge }) as Required<T>;
        this.onUpdate && this.onUpdate(result);

    }

    snapshot() {
        return structuredClone(this.#data);
    }

}