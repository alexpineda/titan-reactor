import produce from 'immer';

import { FieldDefinition, MacroActionEffect } from "common/types";


function isFieldDefinition(value: any): value is FieldDefinition {
    return value !== undefined && value !== null && value.hasOwnProperty("value")
}

export type BeforeSet = (newValue: any, field: FieldDefinition) => boolean | void;

export type ApplyEffect = (effect: MacroActionEffect, path: string[], field: FieldDefinition, newValue?: any, resetValue?: any, beforeSet?: BeforeSet) => void;

//TODO: batching
export const createReactiveVariable = (applyEffect: ApplyEffect, getValue: (path: string[]) => any) => (definition: FieldDefinition | {}, path: string[], beforeSet?: BeforeSet) => {

    const field = isFieldDefinition(definition) ? definition : { value: definition };

    const apply = (effect: MacroActionEffect, newValue?: any) => {

        applyEffect(effect, path, field, newValue, beforeSet);

    }

    return {
        update(fn: (value: any) => any) {
            this.value = produce(fn, this.value);
        },
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
            apply(MacroActionEffect.Set, newValue);
        },
        /**
         * Increase the value of the property.
         */
        inc: () => apply(MacroActionEffect.Increase),
        /**
         * Increase the value of the property. Loop around if the value is greater than the maximum.
         */
        incCycle: () => apply(MacroActionEffect.IncreaseCycle),
        /**
         * Decrease the value of the property.
         */
        dec: () => apply(MacroActionEffect.Decrease),
        /**
         * Decrease the value of the property. Loop around if the value is less than the minimum.
         */
        decCycle: () => apply(MacroActionEffect.DecreaseCycle),
        /**
         * Set the value of the property to the minimum.
         */
        min: () => apply(MacroActionEffect.Min),
        /**
         * Set the value of the property to the maximum.
         */
        max: () => apply(MacroActionEffect.Max),
        /**
         * Reset the value of the property to the default.
         */
        setToDefault: () => apply(MacroActionEffect.SetToDefault),
        /**
         * Reset the value of the property to the default.
         */
        toggle: () => apply(MacroActionEffect.Toggle),
    }

}

export type ReactiveVariable = ReturnType<ReturnType<typeof createReactiveVariable>>;