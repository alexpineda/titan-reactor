import * as log from "@ipc/log";
import settingsStore from "@stores/settings-store";
import { PluginMetaData, Settings } from "common/types";
import get from "lodash.get";
import { MathUtils } from "three";
import * as plugins from "../plugins";
import packagejson from "../../../package.json";
import { getAppSettingsLevaConfigField } from "./global-settings";

export enum MacroActionEffect {
    SetToDefault = "SetToDefault",
    Set = "Set",
    Toggle = "Toggle",
    Increase = "Increase",
    Decrease = "Decrease",
    Min = "Min",
    Max = "Max",
    CallMethod = "CallMethod",
}

export enum MacroActionType {
    ModifyAppSettings = "ModifyAppSettings",
    ModifyPluginSettings = "ModifyPluginSettings",
    CallGameTimeApi = "CallGameTimeApi",
}

export enum MacroActionConfigurationError {
    InvalidField = "InvalidField",
}

export type MacroActionBase = {
    id: string;
    type: MacroActionType;
    effect: MacroActionEffect;
    error?: MacroActionConfigurationError;
    resetValue?: any;
}

export type MacroActionHostModifyValue = MacroActionBase & {
    type: MacroActionType.ModifyAppSettings;
    field: string[];
    value?: any;
}

export type MacroActionGameTimeApiCallMethod = MacroActionBase & {
    type: MacroActionType.CallGameTimeApi;
    value: string;
}

export type MacroActionPluginModifyValue = MacroActionBase & {
    type: MacroActionType.ModifyPluginSettings;
    pluginName: string;
    field: string[];
    value?: any;
}

export type MacroActionPlugin = MacroActionPluginModifyValue;
export type MacroAction = (MacroActionHostModifyValue | MacroActionGameTimeApiCallMethod | MacroActionPlugin);

export type MacroTriggerDTO = {
    type: string;
    value: string;
}

export type MacroDTO = {
    id: string;
    name: string;
    enabled: boolean;
    trigger: MacroTriggerDTO;
    actions: MacroAction[];
    actionSequence: MacroActionSequence;
};

export type MacrosDTO = {
    version: string;
    revision: number;
    macros: MacroDTO[];
};

export const validateMacroAction = (action: MacroAction, plugins: PluginMetaData[]) => {
    delete action.error;
    if (action.type === MacroActionType.ModifyAppSettings || action.type === MacroActionType.ModifyPluginSettings) {
        if (!action.field) {
            action.error = MacroActionConfigurationError.InvalidField;
        }

        //TODO validate that field exists in plugin or config

        const validEffects = getMacroActionValidEffects(action, plugins);
        if (!validEffects.includes(action.effect)) {
            action.effect = validEffects[0];
        }

        if (action.effect !== MacroActionEffect.Set && action.effect !== MacroActionEffect.Toggle) {
            delete action.value;
        }
    }
}

export const getMacroActionValidModifyEffects = (valueType: "boolean" | "number" | "string") => {
    if (valueType === "boolean") {
        return [
            MacroActionEffect.SetToDefault,
            MacroActionEffect.Set,
            MacroActionEffect.Toggle,
        ];
    } else if (valueType === "number") {
        return [
            MacroActionEffect.SetToDefault,
            MacroActionEffect.Set,
            MacroActionEffect.Increase,
            MacroActionEffect.Decrease,
            MacroActionEffect.Min,
            MacroActionEffect.Max,
        ];
    } else if (valueType === "string") {
        return [MacroActionEffect.SetToDefault, MacroActionEffect.Set];
    }
    return [];
};

// if value type === boolean, set to default, toggle,
// if number, increase, decrease, min, max, set
// if string, set
// if method, call
export const getMacroActionValidEffects = (
    action: MacroAction,
    pluginsMetadata: PluginMetaData[]
): MacroActionEffect[] => {
    const settings = settingsStore();

    if (action.type === MacroActionType.ModifyAppSettings) {
        if (action.effect === MacroActionEffect.CallMethod) {
            return [];
        }
        const config = getAppSettingsLevaConfigField(settings, action.field);
        if (!config) {
            return [];
        }

        const typeOfField = typeof config.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return getMacroActionValidModifyEffects(typeOfField);
    } else if (action.type === MacroActionType.CallGameTimeApi) {
        return [MacroActionEffect.CallMethod];
    } else if (action.type === MacroActionType.ModifyPluginSettings) {
        const plugin = pluginsMetadata.find((p) => p.name === action.pluginName);
        if (!plugin) {
            return [];
        }

        const callMethod = plugin.methods.includes(action.field[0]) ? [MacroActionEffect.CallMethod] : [];

        const field = plugin.config?.[action.field[0] as keyof typeof plugin];
        if (field === undefined) {
            return callMethod;
        }
        const typeOfField = typeof field.value;
        if (typeOfField !== "boolean" && typeOfField !== "number" && typeOfField !== "string") {
            console.warn(`Unsupported field type: ${typeOfField}`);
            return [];
        }
        return [...callMethod, ...getMacroActionValidModifyEffects(typeOfField)];
    }
    return [];
};
export class Macros {
    #createGameCompartment?: (deps?: {}) => Compartment;

    version = packagejson.config["titan-reactor-macro-api"];
    revision = 0;
    macros: Macro[] = [];

    add(macro: Macro) {
        this.macros.push(macro);
    }

    *trigger(event: KeyboardEvent): Generator<Macro> {
        for (const macro of this.macros) {
            if (macro.test(event)) {
                yield macro;
            }
        }
    }

    *[Symbol.iterator]() {
        for (const macro of this.macros) {
            yield macro;
        }
    }

    initGame(createCompartment: ((deps?: {}) => Compartment)) {
        this.#createGameCompartment = createCompartment;
    }

    setHostDefaults(settings: Settings) {
        for (const macro of this.macros) {
            macro.setHostDefaults(settings);
        }
    }

    setPluginsDefaults(pluginName: string, data: any) {
        for (const macro of this.macros) {
            macro.setPluginsDefaults(pluginName, data);
        }
    }

    doMacros(e: KeyboardEvent) {
        let actions;
        const settings = settingsStore();

        for (const macro of this.trigger(e)) {
            actions = macro.getActionSequence();
            for (const action of actions) {
                if (action.type === MacroActionType.ModifyAppSettings) {
                    settings.doMacroAction(action);
                } else if (action.type === MacroActionType.ModifyPluginSettings) {
                    plugins.doMacroAction(action);
                } else if (action.type === MacroActionType.CallGameTimeApi) {
                    const c = this.#createGameCompartment!();
                    try {
                        c.evaluate(action.value);
                    } catch (e) {
                        log.error(`Error executing macro action: ${e}`);
                    }
                }
                else {
                    log.error(`Invalid macro action ${macro.name}`);
                }
            }
        }
    }

    serialize(): MacrosDTO {
        return {
            version: this.version,
            revision: this.revision,
            macros: this.macros.map((macro) => ({
                id: macro.id,
                name: macro.name,
                enabled: macro.enabled,
                trigger: {
                    type: macro.trigger.type,
                    value: macro.trigger.toString(),
                },
                actionSequence: macro.actionSequence,
                actions: macro.actions,
            })),
        }
    }

    deserialize(macrosDTO: MacrosDTO) {
        this.version = macrosDTO.version;
        this.macros = macrosDTO.macros.map((macro) => {
            const trigger = new HotkeyTrigger(macro.trigger.value);
            const newMacro = new Macro(
                macro.id,
                macro.name,
                trigger,
                macro.actions,
                macro.actionSequence
            );
            newMacro.enabled = macro.enabled;
            return newMacro;
        });
    }
}

export enum MacroActionSequence {
    AllSync = "AllSync",
    AllAsync = "AllAsync",
    SingleAlternate = "SingleAlternate",
    SingleRandom = "SingleRandom",
}

export class Macro {
    name: string;
    enabled = true;
    trigger: HotkeyTrigger;
    actions: MacroAction[];
    actionSequence = MacroActionSequence.AllSync;
    #counter = 0;
    id: string;


    constructor(guid: string, labeL: string, trigger: HotkeyTrigger, actions: MacroAction[], actionSequence = MacroActionSequence.AllSync) {
        this.id = guid;
        this.name = labeL;
        this.trigger = trigger;
        this.actions = actions;
        this.actionSequence = actionSequence;
    }

    test(event: KeyboardEvent) {
        return this.trigger.test(event);
    }

    setHostDefaults(settings: Settings) {
        for (const action of this.actions) {
            if (action.type === MacroActionType.ModifyAppSettings) {
                action.resetValue = get(settings, action.field);
            }
        }
    }

    setPluginsDefaults(pluginName: string, data: any) {
        for (const action of this.actions) {
            if (action.type === MacroActionType.ModifyPluginSettings && action.pluginName === pluginName) {
                action.resetValue = get(data.config, action.field);
            }
        }
    }

    getActionSequence() {

        if (this.actionSequence === MacroActionSequence.SingleAlternate) {
            const nextInSequence = this.actions.slice(this.#counter, this.#counter + 1);
            this.#counter = (this.#counter + 1) % this.actions.length;
            return nextInSequence;
        } else if (this.actionSequence === MacroActionSequence.SingleRandom) {
            const i = MathUtils.randInt(0, this.actions.length - 1);
            return this.actions.slice(i, i + 1);
        } else {
            return this.actions;
        }
    }

    toString() {
        return this.id;
    }

}


interface Trigger<T> {
    type: string;
    test: (event: T) => boolean;
}

export class HotkeyTrigger implements Trigger<KeyboardEvent> {
    type = "hotkey";
    #raw: string;
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    modifierCount = 0;

    constructor(raw: string) {
        this.#raw = raw;
        this.key = /(\+(.+))$/.exec(raw)?.[2] ?? raw;
        this.ctrl = raw.includes("Ctrl");
        this.alt = raw.includes("Alt");
        this.shift = raw.includes("Shift");

        if (this.ctrl) {
            this.modifierCount++;
        }
        if (this.alt) {
            this.modifierCount++;
        }
        if (this.shift) {
            this.modifierCount++;
        }
    }

    test(event: KeyboardEvent) {
        if (this.ctrl !== event.ctrlKey) {
            return false;
        }

        if (this.alt !== event.altKey) {
            return false;
        }

        if (this.shift !== event.shiftKey) {
            return false;
        }

        return event.code === this.key;
    }

    toString() {
        return this.#raw;
    }
}

export const getMacroActionValue = (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, defaultValue: any, _step?: number, _min?: number, _max?: number) => {

    let value = action.effect === MacroActionEffect.SetToDefault ? action.resetValue : defaultValue;
    value = action.effect === MacroActionEffect.Set ? action.value : value;

    const min = _min ?? -Infinity;
    const max = _max ?? Infinity;

    let step = _step;

    if (typeof value === "number") {
        value = MathUtils.clamp(value, min, max)

        if (!step) {
            if (Number.isFinite(min)) {
                if (Number.isFinite(max)) { step = +(Math.abs(max - min) / 100).toPrecision(1) }
                else { step = +(Math.abs(value - min) / 100).toPrecision(1) }
            }
            else if (Number.isFinite(max)) { step = +(Math.abs(max - value) / 100).toPrecision(1) }
            else { step = 1; }
        }
    }

    if (action.effect === MacroActionEffect.Increase) {
        return Math.min(value + step, max);
    } else if (action.effect === MacroActionEffect.Decrease) {
        return Math.max(value - step!, min);
    } else if (action.effect === MacroActionEffect.Set) {
        return value;
    } else if (action.effect === MacroActionEffect.Max && Number.isFinite(max)) {
        return max;
    } else if (action.effect === MacroActionEffect.Min && Number.isFinite(min)) {
        return min;
    } else if (action.effect === MacroActionEffect.Toggle) {
        return !value;
    }

    return value;
}

// class StreamDeckTrigger implements Trigger {

// }