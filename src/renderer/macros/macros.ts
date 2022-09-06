import * as log from "@ipc/log";
import { MacroActionType, MacrosDTO, Settings, MacroTrigger, TriggerType, MacroConditionType, MacroConditionComparator } from "common/types";
import * as plugins from "@plugins";
import { Macro } from "./macro";
import { ManualTrigger } from "./manual-trigger";
import { HotkeyTrigger } from "./hotkey-trigger";
import { KeyCombo } from "./key-combo";
import { UseStore } from "zustand";
import { SessionStore } from "@stores/session-store";
import { MacroHookTrigger } from "common/macro-hook-trigger";
import get from "lodash.get";
import Janitor from "@utils/janitor";
import { MouseTrigger } from "./mouse-trigger";

export class Macros {
    #createGameCompartment?: (context?: any) => Compartment;
    #session: UseStore<SessionStore>;
    revision = 0;
    macros: Macro[] = [];

    #meta: {
        hotkeyMacros: Macro[];
        mouseMacros: Macro[];
        hookMacros: Macro[];
    } = {
            hotkeyMacros: [],
            mouseMacros: [],
            hookMacros: []
        }

    constructor(session: UseStore<SessionStore>) {
        this.#session = session;
    }

    add(macro: Macro) {
        this.macros.push(macro);
    }

    /**
     * Manages listening to hotkey triggers and executing macros.
     * @returns disposable
     */
    listenForKeyCombos() {

        const janitor = new Janitor();
        let testCombo = new KeyCombo;
        let candidates: Macro[] = [];
        let acceptingInput: NodeJS.Timeout | null = null;

        const finishUp = () => {
            acceptingInput = null;
            for (const candidate of candidates) {
                this.#execMacro(candidate);
            }
            candidates.length = 0;
        }

        const createInputWindow = () => {
            clearTimeout(acceptingInput!);
            acceptingInput = setTimeout(() => {
                finishUp();
            }, 800);
        }


        const _keyListener = (e: KeyboardEvent) => {
            if (e.code !== "AltLeft" && e.code !== "F10") {
                e.preventDefault();
            }

            if (testCombo.isIllegal(e)) {
                return;
            }

            if (acceptingInput === null) {
                testCombo.set(e);
            } else {
                testCombo.add(e);
            }
            createInputWindow();

            const currentWeight = testCombo.codes.length;
            const maxWeight = this.#meta.hotkeyMacros.reduce((acc, m) => Math.max(acc, (m.trigger as HotkeyTrigger).weight), 0);

            for (const macro of this.#meta.hotkeyMacros) {
                const trigger = macro.trigger as HotkeyTrigger;
                if (trigger.weight === currentWeight) {
                    if (trigger.value.test(testCombo)) {
                        candidates.push(macro);
                    }
                }
            }

            let _canSkipNextInSequence = true;
            // see if we can short circuit the next weights
            for (let nextWeight = currentWeight + 1; nextWeight <= maxWeight; nextWeight++) {
                for (const macro of this.#meta.hotkeyMacros) {
                    const trigger = macro.trigger as HotkeyTrigger;
                    if (trigger.weight === nextWeight) {
                        if (trigger.value.testShallow(testCombo, currentWeight)) {
                            _canSkipNextInSequence = false;
                            break;
                        }
                    }
                }
            }
            if (_canSkipNextInSequence) {
                clearTimeout(acceptingInput!);
                finishUp();
            }
        }

        const _mouseListener = (e: MouseEvent) => {
            for (const macro of this.#meta.mouseMacros) {
                const trigger = macro.trigger as MouseTrigger;
                if (trigger.value.test(e)) {
                    this.#execMacro(macro);
                }
            }
        }

        janitor.addEventListener(window, "keydown", _keyListener);
        janitor.addEventListener(window, "mousedown", _mouseListener);
        return janitor;
    }

    *[Symbol.iterator]() {
        for (const macro of this.macros) {
            yield macro;
        }
    }

    setCreateCompartment(createCompartment: ((context?: any) => Compartment)) {
        this.#createGameCompartment = createCompartment;
    }

    /**
     * Resets the defaults from system configuration. Referred to in Set To Default option.
     * @param settings 
     */
    setHostDefaults(settings: Settings) {
        for (const macro of this.macros) {
            macro.setHostDefaults(settings);
        }
    }

    /**
     * Resets the defaults from plugin configuration. Referred to in Set To Default option.
     * @param settings 
     */
    setPluginsDefaults(pluginName: string, data: any) {
        for (const macro of this.macros) {
            macro.setPluginsDefaults(pluginName, data);
        }
    }

    #testCondition(comparator: MacroConditionComparator, a: any, b: any) {
        if (comparator === MacroConditionComparator.Equals) {
            return a === b;
        } else if (comparator === MacroConditionComparator.NotEquals) {
            return a !== b;
        } else if (comparator === MacroConditionComparator.GreaterThan) {
            return a > b;
        } else if (comparator === MacroConditionComparator.GreaterThanOrEquals) {
            return a >= b;
        } else if (comparator === MacroConditionComparator.LessThan) {
            return a < b;
        } else if (comparator === MacroConditionComparator.LessThanOrEquals) {
            return a <= b;
        }
        return false;
    }

    /**
     * Executes a macro.
     * @param macro 
     * @param context Additional context provided to environment of caller. Usually provided from plugin hook results.
     */
    #execMacro(macro: Macro, context?: any) {

        for (const condition of macro.conditions) {
            let value: any;
            if (condition.type === MacroConditionType.AppSettingsCondition) {
                value = get(this.#session.getState(), condition.field);
            } else if (condition.type === MacroConditionType.PluginSettingsCondition) {
                value = get(plugins.getPluginByName(condition.pluginName)?.rawConfig ?? {}, condition.field);
            } else {
                const c = this.#createGameCompartment!(context);
                try {
                    value = c.globalThis.Function(condition.value)();
                } catch (e) {
                    log.error(`Error executing macro condition: ${e}`);
                    return;
                }
            }

            if (this.#testCondition(condition.comparator, value, condition.value) === false) {
                console.log('failed test')
                return;
            }
        }

        const actions = macro.getActionSequence();
        for (const action of actions) {
            if (action.error) {
                log.error(action.error.message);
                continue;
            }
            if (action.type === MacroActionType.ModifyAppSettings) {
                this.#session.getState().doMacroAction(action);
            } else if (action.type === MacroActionType.ModifyPluginSettings) {
                plugins.doMacroAction(action);
            } else if (action.type === MacroActionType.CallGameTimeApi) {
                const c = this.#createGameCompartment!(context);
                try {
                    c.globalThis.Function(action.value)();
                } catch (e) {
                    log.error(`Error executing macro action: ${e}`);
                }
            }
            else {
                log.error(`Invalid macro action ${macro.name}`);
            }
        }
    }

    /**
     * Executes a macro by Id.
     * @param id 
     */
    execMacroById(id: string) {
        const macro = this.macros.find((m) => m.id === id);
        if (macro) {
            this.#execMacro(macro);
        } else {
            log.error(`Macro with id ${id} not found`);
        }
    }

    /**
     * Executes a hook type macro. These are executed by Game Time API events and can either target a plugin or global context.
     * @param hookName 
     * @param pluginName 
     * @param context 
     */
    callFromHook(hookName: string, pluginName?: string, ...context: any[]) {
        for (const macro of this.#meta.hookMacros) {
            if ((macro.trigger as MacroHookTrigger).test(hookName, pluginName)) {
                this.#execMacro(macro, context);
            }
        }
    }

    serialize(): MacrosDTO {
        return {
            revision: this.revision,
            macros: this.macros.map((macro) => ({
                id: macro.id,
                name: macro.name,
                enabled: macro.enabled,
                trigger: {
                    type: macro.trigger.type,
                    value: macro.trigger.serialize()
                },
                actionSequence: macro.actionSequence,
                actions: macro.actions,
                conditions: macro.conditions,
            })),
        }
    }

    deserialize(macrosDTO: MacrosDTO) {
        this.revision = macrosDTO.revision;
        this.macros = macrosDTO.macros.map((macro) => {
            let trigger: MacroTrigger = new ManualTrigger();
            if (macro.trigger.type === TriggerType.Hotkey) {
                trigger = HotkeyTrigger.deserialize(macro.trigger.value)
            } else if (macro.trigger.type === TriggerType.GameHook) {
                trigger = MacroHookTrigger.deserialize(macro.trigger.value)
            } else if (macro.trigger.type === TriggerType.Mouse) {
                trigger = MouseTrigger.deserialize(macro.trigger.value)
            }
            const newMacro = new Macro(
                macro.id,
                macro.name,
                trigger,
                macro.actions,
                macro.actionSequence
            );
            newMacro.enabled = macro.enabled;

            // instead of migration just check if it exists
            newMacro.conditions = macro?.conditions ?? [];
            return newMacro;
        });

        this.#meta.hookMacros = this.macros.filter((m) => m.trigger instanceof MacroHookTrigger).sort((a, b) => {
            return a.trigger.weight - b.trigger.weight;
        });

        this.#meta.hotkeyMacros = this.macros.filter((m) => m.trigger instanceof HotkeyTrigger).sort((a, b) => (a.trigger as HotkeyTrigger).weight - (b.trigger as HotkeyTrigger).weight)

        this.#meta.mouseMacros = this.macros.filter((m) => m.trigger instanceof MouseTrigger);
    }
}

