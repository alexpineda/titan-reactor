import { MutationInstruction, FieldDefinition } from "common/types";
import { log } from "@ipc/log";

export const applyMutationInstruction = (instruction: MutationInstruction, field: FieldDefinition, newValue: any, defaultValue: any) => {

    if (instruction === MutationInstruction.SetToDefault && typeof defaultValue === "undefined") {

        log.error("Cannot set value to default because default value is undefined");
        return field.value;

    }


    if (field.options) {
        return macroEffectApplyList(instruction, field, newValue, defaultValue);
    } else if (typeof newValue === "boolean" || instruction === MutationInstruction.Toggle) {
        return macroEffectApplyBoolean(instruction, field, newValue, defaultValue);
    }
    return macroEffectApplyNumeric(instruction, field, newValue, defaultValue);
}

const macroEffectApplyGeneric = (instruction: MutationInstruction, field: FieldDefinition, newValue: any, defaultValue: any, expectedType: string) => {

    if (instruction === MutationInstruction.Set) {

        if (typeof field.value !== expectedType) {

            log.warn(`field.value is not a ${expectedType}`);
            return field.value

        }

        return newValue;

    } else if (instruction === MutationInstruction.SetToDefault) {

        if (typeof defaultValue !== expectedType) {

            log.warn(`defaultValue is not a ${expectedType}`);
            return field.value
        }

        return defaultValue;

    }

    return field.value;

}

const macroEffectApplyBoolean = (instruction: MutationInstruction, field: FieldDefinition, newValue: boolean, defaultValue: boolean) => {



    if (instruction === MutationInstruction.Toggle) {

        return !field.value;

    }

    return macroEffectApplyGeneric(instruction, field, newValue, defaultValue, "boolean");

}

const macroEffectApplyNumeric = (instruction: MutationInstruction, field: FieldDefinition, newValue: any, defaultValue: any) => {

    const max = field.max === undefined || !Number.isFinite(field.max) ? Number.MAX_SAFE_INTEGER : field.max;

    const min = field.min === undefined || !Number.isFinite(field.min) ? Number.MIN_SAFE_INTEGER : field.min;

    if (max < min) {

        log.warn(`field.max is less than field.min`);
        return field.value;

    }

    if (instruction === MutationInstruction.Increase && Number.isFinite(field.step)) {
        return Math.min(field.value + field.step, max);
    } else if (instruction === MutationInstruction.Decrease && Number.isFinite(field.step)) {
        return Math.max(field.value - field.step!, min);
    } else if (instruction === MutationInstruction.IncreaseCycle && Number.isFinite(field.step)) {
        let nv = field.value + field.step;
        return nv > max ? min : nv;
    } else if (instruction === MutationInstruction.DecreaseCycle && Number.isFinite(field.step)) {
        let nv = field.value - field.step!;
        return nv < min ? max : nv;
    } else if (instruction === MutationInstruction.Set && newValue !== undefined) {

        if (newValue > max) {
            return field.max;
        } else if (newValue < min) {
            return field.min;
        }

        return newValue;

    } else if (instruction === MutationInstruction.Max && Number.isFinite(field.max)) {
        return field.max;
    } else if (instruction === MutationInstruction.Min && Number.isFinite(field.min)) {
        return field.min;
    } else if (instruction === MutationInstruction.SetToDefault) {
        return defaultValue;
    }

    log.warn("Macro action effect is invalid.");
    return field.value;
}

const macroEffectApplyList = (instruction: MutationInstruction, field: FieldDefinition, newValue: any, defaultValue: any) => {

    let options = Array.isArray(field.options) ? field.options : Object.values(field.options!);

    const idx = options.indexOf(field.value);
    if (idx === -1) {
        log.warn(`Invalid macro action, couldn't find option ${field}`);
        return options[0];
    }

    if (instruction === MutationInstruction.Increase) {
        return options[Math.min(idx + 1, options.length - 1)];
    } else if (instruction === MutationInstruction.Decrease) {
        return options[Math.max(idx - 1, 0)];
    } else if (instruction === MutationInstruction.IncreaseCycle) {
        return options[(idx + 1) % options.length];
    } else if (instruction === MutationInstruction.DecreaseCycle) {
        let ndx = idx - 1;
        ndx = ndx < 0 ? options.length - 1 : ndx;
        return options[ndx];
    } else if (instruction === MutationInstruction.Set && options.includes(newValue)) {
        return newValue;
    } else if (instruction === MutationInstruction.Max) {
        return options[options.length - 1];
    } else if (instruction === MutationInstruction.Min) {
        return options[0];
    } else if (instruction === MutationInstruction.SetToDefault && options.includes(defaultValue)) {
        return defaultValue;
    }

    log.warn(`Invalid macro action options effect ${instruction}`);
    return field.value;
}