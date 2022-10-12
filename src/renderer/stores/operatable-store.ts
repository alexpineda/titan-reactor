import { FieldDefinition, Operation, Operator } from "common/types";
import { fieldOperation } from "./field-operation";
import { log } from "@ipc/log";
import { DeepStore } from "./deep-store";
import { SourceOfTruth } from "./source-of-truth";

export type MutationVariable = ReturnType<ReturnType<typeof createMutationVariable>>;

export const createMutationVariable = (operate: (operation: Operation) => void, getValue: (path: string[]) => any) => (path: string[]) => {

    const _data = {
        value: undefined,
        path,
        operator: Operator.Set
    }

    const apply = (operator: Operator, value?: any) => {
        _data.operator = operator;
        _data.value = value;
        operate(_data);
    }

    const fn = function (value?: any) {
        if (value !== undefined) {
            apply(Operator.Set, value);
        } else {
            return getValue(path);
        }
    }

    return Object.assign(fn, {

        set: (value: any) => apply(Operator.Set, value),
        get: () => getValue(path),

        /**
         * Increase the value of the property.
         */
        inc: () => apply(Operator.Increase),
        /**
         * Increase the value of the property. Loop around if the value is greater than the maximum.
         */
        incCycle: () => apply(Operator.IncreaseCycle),
        /**
         * Decrease the value of the property.
         */
        dec: () => apply(Operator.Decrease),
        /**
         * Decrease the value of the property. Loop around if the value is less than the minimum.
         */
        decCycle: () => apply(Operator.DecreaseCycle),
        /**
         * Set the value of the property to the minimum.
         */
        min: () => apply(Operator.Min),
        /**
         * Set the value of the property to the maximum.
         */
        max: () => apply(Operator.Max),
        /**
         * Reset the value of the property to the default.
         */
        reset: () => apply(Operator.SetToDefault),
        /**
         * Reset the value of the property to the default.
         */
        toggle: () => apply(Operator.Toggle),
    });

}

export type OperatableStore<T extends object> = DeepStore<T> & {
    operate: (action: Operation, transformPath?: (path: string[]) => string[]) => void;
    createVariable: (path: string[]) => MutationVariable;
    sourceOfTruth: SourceOfTruth<T>;
}

/**
 * 
 * An operatable store provides a defined set of operations that can be applied to the store.
 * 
 * @param store The store to operate on.
 * @param getFieldDefinition A function that returns the field definition for a given path.
 * @returns 
 */
export function createOperatableStore<T extends object>(store: DeepStore<T>, sourceOfTruth: SourceOfTruth<T>, getFieldDefinition: (path: string[], state: T) => FieldDefinition | undefined): OperatableStore<T> {

    // when the source of truth is updated, we want to update our session state as well
    sourceOfTruth.onUpdate = (diff) => {
        store.merge(diff);
    }

    const operate = (operation: Operation, transformPath: (path: string[]) => string[] = x => x) => {

        const path = transformPath(operation.path);

        const field = getFieldDefinition(path, store.getState());

        if (field) {

            store.setValue(path, fieldOperation(operation.operator, field, operation.value, sourceOfTruth.getValue(path)));

        } else {

            log.warn("Session field is no found.");

        }

    };

    return {
        ...store,
        sourceOfTruth,
        operate,
        createVariable: createMutationVariable(operate, (path) => store.getValue(path))
    }
}