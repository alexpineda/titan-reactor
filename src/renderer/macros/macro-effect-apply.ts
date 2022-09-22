import { MutateActionEffect as ActionEffect, FieldDefinition } from "common/types";
import { log } from "@ipc/log";

//todo include expected type in fielddefinition
export const macroEffectApply = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultValue: any) => {

    if (effect === ActionEffect.SetToDefault && typeof defaultValue === "undefined") {

        log.error("Cannot set value to default because default value is undefined");
        return field.value;

    }


    if (field.options) {
        return macroEffectApplyList(effect, field, newValue, defaultValue);
    } else if (typeof newValue === "boolean" || effect === ActionEffect.Toggle) {
        return macroEffectApplyBoolean(effect, field, newValue, defaultValue);
    }
    return macroEffectApplyNumeric(effect, field, newValue, defaultValue);
}

const macroEffectApplyGeneric = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultValue: any, expectedType: string) => {

    if (effect === ActionEffect.Set) {

        if (typeof field.value !== expectedType) {

            log.warn(`field.value is not a ${expectedType}`);
            return field.value

        }

        return newValue;

    } else if (effect === ActionEffect.SetToDefault) {

        if (typeof defaultValue !== expectedType) {

            log.warn(`defaultValue is not a ${expectedType}`);
            return field.value
        }

        return defaultValue;

    }

    return field.value;

}

const macroEffectApplyBoolean = (effect: ActionEffect, field: FieldDefinition, newValue: boolean, defaultValue: boolean) => {



    if (effect === ActionEffect.Toggle) {

        return !field.value;

    }

    return macroEffectApplyGeneric(effect, field, newValue, defaultValue, "boolean");

}

// apply effect generic (set/default)
// apply effect boolean (toggle)
// number
// list
// vector?

// TOOD: santiize value, then sanitize max, min, and step to guarantee they are finite
export const macroEffectApplyNumeric = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultValue: any) => {

    const max = field.max === undefined || !Number.isFinite(field.max) ? Number.MAX_SAFE_INTEGER : field.max;

    const min = field.min === undefined || !Number.isFinite(field.min) ? Number.MIN_SAFE_INTEGER : field.min;

    if (max < min) {

        log.warn(`field.max is less than field.min`);
        return field.value;

    }

    if (effect === ActionEffect.Increase && Number.isFinite(field.step)) {
        return Math.min(field.value + field.step, max);
    } else if (effect === ActionEffect.Decrease && Number.isFinite(field.step)) {
        return Math.max(field.value - field.step!, min);
    } else if (effect === ActionEffect.IncreaseCycle && Number.isFinite(field.step)) {
        let nv = field.value + field.step;
        return nv > max ? min : nv;
    } else if (effect === ActionEffect.DecreaseCycle && Number.isFinite(field.step)) {
        let nv = field.value - field.step!;
        return nv < min ? max : nv;
    } else if (effect === ActionEffect.Set && newValue !== undefined) {

        if (newValue > max) {
            return field.max;
        } else if (newValue < min) {
            return field.min;
        }

        return newValue;

    } else if (effect === ActionEffect.Max && Number.isFinite(field.max)) {
        return field.max;
    } else if (effect === ActionEffect.Min && Number.isFinite(field.min)) {
        return field.min;
    } else if (effect === ActionEffect.SetToDefault) {
        return defaultValue;
    }

    log.warn("Macro action effect is invalid.");
    return field.value;
}

export const macroEffectApplyList = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultValue: any) => {

    let options = Array.isArray(field.options) ? field.options : Object.values(field.options!);

    const idx = options.indexOf(field.value);
    if (idx === -1) {
        log.warn(`Invalid macro action, couldn't find option ${field}`);
        return options[0];
    }

    if (effect === ActionEffect.Increase) {
        return options[Math.min(idx + 1, options.length - 1)];
    } else if (effect === ActionEffect.Decrease) {
        return options[Math.max(idx - 1, 0)];
    } else if (effect === ActionEffect.IncreaseCycle) {
        return options[(idx + 1) % options.length];
    } else if (effect === ActionEffect.DecreaseCycle) {
        let ndx = idx - 1;
        ndx = ndx < 0 ? options.length - 1 : ndx;
        return options[ndx];
    } else if (effect === ActionEffect.Set && options.includes(newValue)) {
        return newValue;
    } else if (effect === ActionEffect.Max) {
        return options[options.length - 1];
    } else if (effect === ActionEffect.Min) {
        return options[0];
    } else if (effect === ActionEffect.SetToDefault && options.includes(defaultValue)) {
        return defaultValue;
    }

    log.warn(`Invalid macro action options effect ${effect}`);
    return field.value;
}