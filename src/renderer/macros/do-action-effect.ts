import { ModifyValueActionEffect as ActionEffect, FieldDefinition } from "common/types";
import * as log from "@ipc/log";

const isFiniteV = (...args: any) => {
    for (const arg of args) {
        if (!Number.isFinite(arg)) {
            return false;
        }
    }
    return true;
}

export const doActionEffect = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultValue: any) => {

    if (field.options) {
        return getActionEffectOptionsValue(effect, field, newValue, defaultValue);
    }

    if (effect === ActionEffect.Increase && field.max !== undefined && isFiniteV(field.step, field.max)) {
        return Math.min(field.value + field.step, field.max);
    } else if (effect === ActionEffect.Decrease && field.min !== undefined && isFiniteV(field.step, field.min)) {
        return Math.max(field.value - field.step!, field.min);
    } else if (effect === ActionEffect.IncreaseCycle && field.max !== undefined && field.min !== undefined && isFiniteV(field.step, field.max)) {
        let nv = field.value + field.step;
        return nv > field.max ? field.min : nv;
    } else if (effect === ActionEffect.DecreaseCycle && field.step !== undefined && field.max !== undefined && field.min !== undefined && isFiniteV(field.step, field.min)) {
        let nv = field.value - field.step;
        return nv < field.min ? field.max : nv;
    } else if (effect === ActionEffect.Set && newValue !== undefined) {

        if (field.max !== undefined && newValue > field.max) {
            return field.max;
        } else if (field.min !== undefined && newValue < field.min) {
            return field.min;
        }

        return newValue;

    } else if (effect === ActionEffect.Max && field.max !== undefined && Number.isFinite(field.max)) {
        return field.max;
    } else if (effect === ActionEffect.Min && field.min !== undefined && Number.isFinite(field.min)) {
        return field.min;
    } else if (effect === ActionEffect.Toggle && typeof field.value === "boolean") {
        return !field.value;
    } else if (effect === ActionEffect.SetToDefault) {
        return defaultValue;
    }

    log.warning("Macro action effect is invalid.");
    return field;
}

export const getActionEffectOptionsValue = (effect: ActionEffect, field: FieldDefinition, newValue: any, defaultVAlue: any) => {

    let options = Array.isArray(field.options) ? field.options : Object.values(field.options!);

    const idx = options.indexOf(field.value);
    if (idx === -1) {
        log.warning(`Invalid macro action, couldn't find option ${field}`);
        return field;
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
    } else if (effect === ActionEffect.Set) {
        return newValue;
    } else if (effect === ActionEffect.Max) {
        return options[options.length - 1];
    } else if (effect === ActionEffect.Min) {
        return options[0];
    } else if (effect === ActionEffect.SetToDefault) {
        return defaultVAlue;
    }

    log.warning(`Invalid macro action options effect ${effect}`);
    return field;
}