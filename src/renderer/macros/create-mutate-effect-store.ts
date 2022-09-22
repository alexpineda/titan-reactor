import { FieldDefinition, MutateActionEffect } from "common/types";


function isFieldDefinition(value: any): value is FieldDefinition {
    return value !== undefined && value !== null && value.hasOwnProperty("value")
}

export type BeforeSet = (newValue: any, field: FieldDefinition) => boolean | void;

export type ApplyEffect = (effect: MutateActionEffect, path: string[], field: FieldDefinition, newValue?: any, resetValue?: any, beforeSet?: BeforeSet) => void;

//TODO: batching / cacheing
export const createMutateEffectStore =
    (applyEffect: ApplyEffect, getValue: (path: string[]) => any) =>
        (definition: FieldDefinition | {}, path: string[], beforeSet?: BeforeSet) => {

            const field = isFieldDefinition(definition) ? definition : { value: definition };

            const apply = (effect: MutateActionEffect, newValue?: any) => {

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
                    apply(MutateActionEffect.Set, newValue);
                },
                /**
                 * Increase the value of the property.
                 */
                inc: () => apply(MutateActionEffect.Increase),
                /**
                 * Increase the value of the property. Loop around if the value is greater than the maximum.
                 */
                incCycle: () => apply(MutateActionEffect.IncreaseCycle),
                /**
                 * Decrease the value of the property.
                 */
                dec: () => apply(MutateActionEffect.Decrease),
                /**
                 * Decrease the value of the property. Loop around if the value is less than the minimum.
                 */
                decCycle: () => apply(MutateActionEffect.DecreaseCycle),
                /**
                 * Set the value of the property to the minimum.
                 */
                min: () => apply(MutateActionEffect.Min),
                /**
                 * Set the value of the property to the maximum.
                 */
                max: () => apply(MutateActionEffect.Max),
                /**
                 * Reset the value of the property to the default.
                 */
                reset: () => apply(MutateActionEffect.SetToDefault),
                /**
                 * Reset the value of the property to the default.
                 */
                toggle: () => apply(MutateActionEffect.Toggle),
            }

        }

export type MacroEffectVariable = ReturnType<ReturnType<typeof createMutateEffectStore>>;