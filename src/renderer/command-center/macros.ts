import * as log from "@ipc/log";
import settingsStore from "@stores/settings-store";
import { MacroAction, MacroActionEffect, MacroActionHostModifyValue, MacroActionPluginModifyValue, MacroActionSequence, MacroActionType, MacrosDTO, Settings, Trigger } from "common/types";
import get from "lodash.get";
import { MathUtils } from "three";
import * as plugins from "../plugins";
import packagejson from "../../../package.json";

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
                if (action.error) {
                    log.error(action.error.message);
                    continue;
                }
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

const isFiniteV = (...args: any) => {
    for (const arg of args) {
        if (!Number.isFinite(arg)) {
            return false;
        }
    }
    return true;
}

export const getMacroActionValue = (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, defaultValue: any, step?: number, min?: number, max?: number, options?: string[]) => {

    if (options) {
        return getMacroActionOptionsValue(action, options);
    }

    if (action.effect === MacroActionEffect.Increase && max !== undefined && isFiniteV(step, max)) {
        return Math.min(defaultValue + step, max);
    } else if (action.effect === MacroActionEffect.Decrease && min !== undefined && isFiniteV(step, min)) {
        return Math.max(defaultValue - step!, min);
    } else if (action.effect === MacroActionEffect.Set) {
        return action.value;
    } else if (action.effect === MacroActionEffect.Max && Number.isFinite(max)) {
        return max;
    } else if (action.effect === MacroActionEffect.Min && Number.isFinite(min)) {
        return min;
    } else if (action.effect === MacroActionEffect.Toggle && typeof action.value === "boolean") {
        return !action.value;
    } else if (action.effect === MacroActionEffect.SetToDefault) {
        return action.resetValue;
    }

    throw new Error(`Invalid macro action effect ${action.effect}`);
}

export const getMacroActionOptionsValue = (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, options: string[]) => {

    const idx = options.indexOf(action.value);

    if (action.effect === MacroActionEffect.Increase) {
        return options[Math.min(idx + 1, options.length - 1)];
    } else if (action.effect === MacroActionEffect.Decrease) {
        return options[Math.max(idx - 1, 0)];
    } else if (action.effect === MacroActionEffect.Set) {
        return action.value;
    } else if (action.effect === MacroActionEffect.Max) {
        return options[options.length - 1];
    } else if (action.effect === MacroActionEffect.Min) {
        return options[0];
    }

    throw new Error(`Invalid macro action options effect ${action.effect}`);

}

// class StreamDeckTrigger implements Trigger {

// }