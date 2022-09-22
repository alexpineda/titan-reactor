import { FieldDefinition, Mutation, MutationInstruction } from "common/types";
import { macroEffectApply } from "@macros/macro-effect-apply";
import { log } from "@ipc/log";
import { SessionStore } from "./session-store";

export const createPathVariable = (mutate: (action: Mutation) => void, getValue: (path: string[]) => any) => (path: string[]) => {

    const _data = {
        value: undefined,
        path,
        instruction: MutationInstruction.Set

    }
    const apply = (instruction: MutationInstruction, value?: any) => {
        _data.instruction = instruction;
        _data.value = value;
        mutate(_data);
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
            apply(MutationInstruction.Set, newValue);
        },
        /**
         * Increase the value of the property.
         */
        inc: () => apply(MutationInstruction.Increase),
        /**
         * Increase the value of the property. Loop around if the value is greater than the maximum.
         */
        incCycle: () => apply(MutationInstruction.IncreaseCycle),
        /**
         * Decrease the value of the property.
         */
        dec: () => apply(MutationInstruction.Decrease),
        /**
         * Decrease the value of the property. Loop around if the value is less than the minimum.
         */
        decCycle: () => apply(MutationInstruction.DecreaseCycle),
        /**
         * Set the value of the property to the minimum.
         */
        min: () => apply(MutationInstruction.Min),
        /**
         * Set the value of the property to the maximum.
         */
        max: () => apply(MutationInstruction.Max),
        /**
         * Reset the value of the property to the default.
         */
        reset: () => apply(MutationInstruction.SetToDefault),
        /**
         * Reset the value of the property to the default.
         */
        toggle: () => apply(MutationInstruction.Toggle),
    }

}

export function createMutationStore<T>(store: SessionStore<T>, getFieldDefinition: (state: T, path: string[]) => FieldDefinition | undefined) {

    const mutate = (action: Mutation) => {

        const field = getFieldDefinition(store.getState(), action.path);

        if (field) {

            store.setValue(action.path, macroEffectApply(action.instruction, field, action.value, store.getResetValue(action.path)));

        } else {

            log.warn("Session field is no found.");

        }

    };

    return {
        mutate,
        createVariable: createPathVariable(mutate, (path) => store.getValue(path))
    }
}