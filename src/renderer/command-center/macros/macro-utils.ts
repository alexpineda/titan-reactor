import { MacroActionEffect, MacroActionHostModifyValue, MacroActionPluginModifyValue } from "common/types";
import * as log from "@ipc/log";

const isFiniteV = (...args: any) => {
    for (const arg of args) {
        if (!Number.isFinite(arg)) {
            return false;
        }
    }
    return true;
}


export const getMacroActionValue = (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, currentValue: any, step?: number, min?: number, max?: number, options?: string[]) => {

    if (options) {
        return getMacroActionOptionsValue(action, currentValue, options);
    }

    if (action.effect === MacroActionEffect.Increase && max !== undefined && isFiniteV(step, max)) {
        return Math.min(currentValue + step, max);
    } else if (action.effect === MacroActionEffect.Decrease && min !== undefined && isFiniteV(step, min)) {
        return Math.max(currentValue - step!, min);
    } else if (action.effect === MacroActionEffect.IncreaseCycle && max !== undefined && isFiniteV(step, max)) {
        let nv = currentValue + step;
        return nv > max ? min : nv;
    } else if (action.effect === MacroActionEffect.DecreaseCycle && min !== undefined && isFiniteV(step, min)) {
        let nv = currentValue - step!;
        return nv < min ? max : nv;
    } else if (action.effect === MacroActionEffect.Set && action.value !== undefined) {
        return action.value;
    } else if (action.effect === MacroActionEffect.Max && Number.isFinite(max)) {
        return max;
    } else if (action.effect === MacroActionEffect.Min && Number.isFinite(min)) {
        return min;
    } else if (action.effect === MacroActionEffect.Toggle && typeof currentValue === "boolean") {
        return !currentValue;
    } else if (action.effect === MacroActionEffect.SetToDefault) {
        return action.resetValue;
    }

    throw new Error(`Invalid macro action effect ${action.effect}`);
}

export const getMacroActionOptionsValue = (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, currentValue: any, options: string[]) => {

    const idx = options.indexOf(currentValue);
    if (idx === -1) {
        log.warning(`Invalid macro action, couldn't find option ${currentValue}`);
        return;
    }

    if (action.effect === MacroActionEffect.Increase) {
        return options[Math.min(idx + 1, options.length - 1)];
    } else if (action.effect === MacroActionEffect.Decrease) {
        return options[Math.max(idx - 1, 0)];
    } else if (action.effect === MacroActionEffect.IncreaseCycle) {
        return options[(idx + 1) % options.length];
    } else if (action.effect === MacroActionEffect.DecreaseCycle) {
        let ndx = idx - 1;
        ndx = ndx < 0 ? options.length - 1 : ndx;
        return options[ndx];
    } else if (action.effect === MacroActionEffect.Set) {
        return action.value;
    } else if (action.effect === MacroActionEffect.Max) {
        return options[options.length - 1];
    } else if (action.effect === MacroActionEffect.Min) {
        return options[0];
    } else if (action.effect === MacroActionEffect.SetToDefault) {
        return action.resetValue;
    }

    throw new Error(`Invalid macro action options effect ${action.effect}`);

}