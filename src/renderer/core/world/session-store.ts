
import { State, StoreApi } from "zustand";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { DeepPartial, FieldDefinition, MutateAction } from "common/types";
import deepMerge from 'deepmerge';
import { arrayOverwriteMerge } from "@utils/object-utils";
import { macroEffectApply } from "@macros/macro-effect-apply";

// mutation store handles its own external updates, mutations and notifications
// provides sourceOfTruthStore and sessionStore
// provides accessors to state
// provides transfomers to/from field definitionsa

export type CreateSessionStoreArgs<T extends State> = {
    sourceOfTruth: StoreApi<T>;
    getFieldDefinition?: (path: string[]) => FieldDefinition;
    validateMutation?: (newStore: T, rhs: DeepPartial<T>) => boolean
}

export function createSessionStore<T extends State>({ sourceOfTruth, validateMutation, getFieldDefinition }: CreateSessionStoreArgs<T>): SessionStore<T> {

    const store = JSON.parse(JSON.stringify(sourceOfTruth.getState()));

    // const createVariable = createMutateEffectStore(applyEffectToSessionRoot, (path: string[]) => lGet(store, path));

    return {
        getState: () => store,
        getValue: (path: string[]) => lGet(store, path),
        getResetValue: (path: string[]) => lGet(sourceOfTruth.getState(), path),
        setValue(path: string[], value: any) {
            this.merge(lSet<DeepPartial<T>>({}, path, value));
        },
        merge: (rhs: DeepPartial<T>) => {
            const result = deepMerge(store, rhs, { arrayMerge: arrayOverwriteMerge }) as Required<T>;
            if (validateMutation === undefined || validateMutation(result, rhs)) {
                Object.assign(store, result);
            }
        },
        mutate(action: MutateAction) {
            const field = getFieldDefinition === undefined ? action.value : getFieldDefinition(action.path);

            if (field) {

                this.setValue(action.path, macroEffectApply(action.effect, field, action.value, this.getResetValue(action.path)));

            }
        }
    }
}


type SessionStore<TStore> = {
    getState: () => TStore;
    getValue: (path: string[]) => any;
    getResetValue: (path: string[]) => any;
    // pathToField: (path: string[]) => FieldDefinition;
    setValue: (path: string[], value: any) => void;
    merge: (rhs: DeepPartial<TStore>) => void;
    mutate: (action: MutateAction) => void;
}