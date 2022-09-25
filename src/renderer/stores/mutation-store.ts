import { FieldDefinition, Operation, Operator } from "common/types";
import { applyMutationInstruction } from "./apply-mutation-instruction";
import { log } from "@ipc/log";
import { ResettableStore } from "./session-store";

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

    return {
        /**
         * Get value of the property.
         */
        get value() {
            return getValue(path);
        },
        /**
         * Set value of the property.
         */
        set value(newValue: any) {
            apply(Operator.Set, newValue);
        },
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
    }

}

export type OperatableStore<T> = ResettableStore<T> & {
    operate: (action: Operation, transformPath?: (path: string[]) => string[]) => void;
    createVariable: (path: string[]) => MutationVariable;
}

export function createOperatableStore<T>(store: ResettableStore<T>, getFieldDefinition: (path: string[], state: T) => FieldDefinition | undefined): OperatableStore<T> {

    const operate = (mutation: Operation, transformPath: (path: string[]) => string[] = x => x) => {

        const path = transformPath(mutation.path);

        const field = getFieldDefinition(path, store.getState());

        if (field) {

            store.setValue(path, applyMutationInstruction(mutation.operator, field, mutation.value, store.getResetValue(path)));

        } else {

            log.warn("Session field is no found.");

        }

    };

    return {
        ...store,
        operate,
        createVariable: createMutationVariable(operate, (path) => store.getValue(path))
    }
}