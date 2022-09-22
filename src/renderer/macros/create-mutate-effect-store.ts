import { FieldDefinition, MutationInstruction } from "common/types";


function isFieldDefinition(value: any): value is FieldDefinition {
    return value !== undefined && value !== null && value.hasOwnProperty("value")
}

export type BeforeSet = (newValue: any, field: FieldDefinition) => boolean | void;

export type ApplyMutationInstruction = (effect: MutationInstruction, path: string[], field: FieldDefinition, newValue?: any, resetValue?: any) => void;

//TODO: batching / cacheing
export const createMutateEffectStore =
    (applyEffect: ApplyMutationInstruction, getValue: (path: string[]) => any) =>
        (definition: FieldDefinition | {}, path: string[]) => {

            const field = isFieldDefinition(definition) ? definition : { value: definition };

            const apply = (effect: MutationInstruction, newValue?: any) => {

                applyEffect(effect, path, field, newValue);

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

export type MutationVariable = ReturnType<ReturnType<typeof createMutateEffectStore>>;