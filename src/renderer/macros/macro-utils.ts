import { MacroActionEffect, FieldDefinition } from "common/types";
import * as log from "@ipc/log";

const isFiniteV = (...args: any) => {
    for (const arg of args) {
        if (!Number.isFinite(arg)) {
            return false;
        }
    }
    return true;
}

export const doMacroActionEffect = (effect: MacroActionEffect, field: FieldDefinition, newValue: any, resetValue: any) => {

    if (field.options) {
        return getMacroActionOptionsValue(effect, field, newValue, resetValue);
    }

    if (effect === MacroActionEffect.Increase && field.max !== undefined && isFiniteV(field.step, field.max)) {
        return Math.min(field.value + field.step, field.max);
    } else if (effect === MacroActionEffect.Decrease && field.min !== undefined && isFiniteV(field.step, field.min)) {
        return Math.max(field.value - field.step!, field.min);
    } else if (effect === MacroActionEffect.IncreaseCycle && field.max !== undefined && field.min !== undefined && isFiniteV(field.step, field.max)) {
        let nv = field.value + field.step;
        return nv > field.max ? field.min : nv;
    } else if (effect === MacroActionEffect.DecreaseCycle && field.step !== undefined && field.max !== undefined && field.min !== undefined && isFiniteV(field.step, field.min)) {
        let nv = field.value - field.step;
        return nv < field.min ? field.max : nv;
    } else if (effect === MacroActionEffect.Set && newValue !== undefined) {
        return newValue;
    } else if (effect === MacroActionEffect.Max && field.max !== undefined && Number.isFinite(field.max)) {
        return field.max;
    } else if (effect === MacroActionEffect.Min && field.min !== undefined && Number.isFinite(field.min)) {
        return field.min;
    } else if (effect === MacroActionEffect.Toggle && typeof field.value === "boolean") {
        return !field.value;
    } else if (effect === MacroActionEffect.SetToDefault) {
        return resetValue;
    }

    log.warning("Macro action effect is invalid.");
    return field;
}

export const getMacroActionOptionsValue = (effect: MacroActionEffect, field: FieldDefinition, newValue: any, resetValue: any) => {

    let options = Array.isArray(field.options) ? field.options : Object.values(field.options!);

    const idx = options.indexOf(field.value);
    if (idx === -1) {
        log.warning(`Invalid macro action, couldn't find option ${field}`);
        return field;
    }

    if (effect === MacroActionEffect.Increase) {
        return options[Math.min(idx + 1, options.length - 1)];
    } else if (effect === MacroActionEffect.Decrease) {
        return options[Math.max(idx - 1, 0)];
    } else if (effect === MacroActionEffect.IncreaseCycle) {
        return options[(idx + 1) % options.length];
    } else if (effect === MacroActionEffect.DecreaseCycle) {
        let ndx = idx - 1;
        ndx = ndx < 0 ? options.length - 1 : ndx;
        return options[ndx];
    } else if (effect === MacroActionEffect.Set) {
        return newValue;
    } else if (effect === MacroActionEffect.Max) {
        return options[options.length - 1];
    } else if (effect === MacroActionEffect.Min) {
        return options[0];
    } else if (effect === MacroActionEffect.SetToDefault) {
        return resetValue;
    }

    log.warning(`Invalid macro action options effect ${effect}`);
    return field;
}