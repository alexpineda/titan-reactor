
import lGet from "lodash.get";
import lSet from "lodash.set";
import { DeepPartial } from "common/types";
import deepMerge from 'deepmerge';
import { arrayOverwriteMerge } from "@utils/object-utils";

export type CreateSessionStoreArgs<T extends Record<string, any>> = {
    sourceOfTruth: T;
    validateMerge?: (newStore: T, rhs: DeepPartial<T>, path?: string[], value?: any) => boolean;
    onUpdate?: (newStore: T, rhs: DeepPartial<T>, path?: string[], value?: any) => void;
}

export function createSessionStore<T extends Record<string, any>>({ sourceOfTruth, validateMerge: validateMerge, onUpdate }: CreateSessionStoreArgs<T>): SessionStore<T> {

    const defaults = JSON.parse(JSON.stringify(sourceOfTruth));
    const store = JSON.parse(JSON.stringify(sourceOfTruth));

    const getResetValue = (path: string[]) => lGet(defaults, path);

    //TODO: generate path & value if no provided for consistency\
    // or just do it by default and omit path,value params
    // would need to be paths[], and values[] though
    const merge = (rhs: DeepPartial<T>, path?: string[], value?: any) => {

        const result = deepMerge(store, rhs, { arrayMerge: arrayOverwriteMerge }) as Required<T>;

        if (validateMerge === undefined || validateMerge(result, rhs, path, value)) {
            Object.assign(store, result);
            onUpdate && onUpdate(store, rhs, path, value);
        }

    }

    const getValue = (path: string[]) => lGet(store, path);

    const setValue = (path: string[], value: any) => {
        merge(lSet<DeepPartial<T>>({}, path, value), path, value);
    }

    return {
        getState: () => store,
        getResetValue,
        getValue,
        setValue,
        merge,
        updateSourceOfTruth: (newSourceOfTruth: DeepPartial<T>) => {
            Object.assign(defaults, deepMerge(defaults, JSON.parse(JSON.stringify(newSourceOfTruth))));
        }
    }
}

export type SessionStore<T> = {
    getState: () => T;
    getValue: (path: string[]) => any;
    getResetValue: (path: string[]) => any;
    setValue: (path: string[], value: any) => void;
    merge: (rhs: DeepPartial<T>) => void;
    updateSourceOfTruth: (newSourceOfTruth: DeepPartial<T>) => void;
}