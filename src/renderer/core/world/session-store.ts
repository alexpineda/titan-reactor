
import lGet from "lodash.get";
import lSet from "lodash.set";
import { DeepPartial } from "common/types";
import deepMerge from 'deepmerge';
import { arrayOverwriteMerge } from "@utils/object-utils";

export type CreateSessionStoreArgs<T extends Record<string, any>> = {
    sourceOfTruth: T;
    validateMerge?: (newStore: T, rhs: DeepPartial<T>) => boolean;
    onUpdate?: (newStore: T, rhs: DeepPartial<T>) => void;
}

export function createSessionStore<T extends Record<string, any>>({ sourceOfTruth, validateMerge: validateMerge, onUpdate }: CreateSessionStoreArgs<T>): SessionStore<T> {

    const store = JSON.parse(JSON.stringify(sourceOfTruth));

    const getResetValue = (path: string[]) => lGet(sourceOfTruth, path);

    const merge = (rhs: DeepPartial<T>) => {
        const result = deepMerge(store, rhs, { arrayMerge: arrayOverwriteMerge }) as Required<T>;
        if (validateMerge === undefined || validateMerge(result, rhs)) {
            Object.assign(store, result);
            onUpdate && onUpdate(store, rhs);
        }
    }

    const getValue = (path: string[]) => lGet(store, path);

    const setValue = (path: string[], value: any) => {
        merge(lSet<DeepPartial<T>>({}, path, value));
    }

    return {
        getState: () => store,
        getResetValue,
        getValue,
        setValue,
        merge,
    }
}

export type SessionStore<TStore> = {
    getState: () => TStore;
    getValue: (path: string[]) => any;
    getResetValue: (path: string[]) => any;
    setValue: (path: string[], value: any) => void;
    merge: (rhs: DeepPartial<TStore>) => void;
}