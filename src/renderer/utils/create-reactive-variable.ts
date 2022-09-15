import { FieldDefinition, ModifyValueActionEffect } from "common/types";


function isFieldDefinition(value: any): value is FieldDefinition {
    return value !== undefined && value !== null && value.hasOwnProperty("value")
}

export type BeforeSet = (newValue: any, field: FieldDefinition) => boolean | void;

export type ApplyEffect = (effect: ModifyValueActionEffect, path: string[], field: FieldDefinition, newValue?: any, resetValue?: any, beforeSet?: BeforeSet) => void;

//TODO: batching / cacheing
export const createReactiveVariable = (applyEffect: ApplyEffect, getValue: (path: string[]) => any) => (definition: FieldDefinition | {}, path: string[], beforeSet?: BeforeSet) => {

    const field = isFieldDefinition(definition) ? definition : { value: definition };

    const apply = (effect: ModifyValueActionEffect, newValue?: any) => {

        applyEffect(effect, path, field, newValue, beforeSet);

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
            apply(ModifyValueActionEffect.Set, newValue);
        },
        /**
         * Increase the value of the property.
         */
        inc: () => apply(ModifyValueActionEffect.Increase),
        /**
         * Increase the value of the property. Loop around if the value is greater than the maximum.
         */
        incCycle: () => apply(ModifyValueActionEffect.IncreaseCycle),
        /**
         * Decrease the value of the property.
         */
        dec: () => apply(ModifyValueActionEffect.Decrease),
        /**
         * Decrease the value of the property. Loop around if the value is less than the minimum.
         */
        decCycle: () => apply(ModifyValueActionEffect.DecreaseCycle),
        /**
         * Set the value of the property to the minimum.
         */
        min: () => apply(ModifyValueActionEffect.Min),
        /**
         * Set the value of the property to the maximum.
         */
        max: () => apply(ModifyValueActionEffect.Max),
        /**
         * Reset the value of the property to the default.
         */
        setToDefault: () => apply(ModifyValueActionEffect.SetToDefault),
        /**
         * Reset the value of the property to the default.
         */
        toggle: () => apply(ModifyValueActionEffect.Toggle),
    }

}

export type ReactiveVariable = ReturnType<ReturnType<typeof createReactiveVariable>>;