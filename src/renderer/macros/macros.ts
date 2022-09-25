import { log } from "@ipc/log";
import { MacrosDTO, MacroTrigger, TriggerType, ConditionComparator } from "common/types";
import { Macro } from "./macro";
import { ManualTrigger } from "./manual-trigger";
import { HotkeyTrigger } from "./hotkey-trigger";
import { KeyCombo } from "./key-combo";
import { MacroHookTrigger } from "@macros/macro-hook-trigger";
import { Janitor } from "three-janitor";
import { MouseTrigger, MouseTriggerDTO } from "./mouse-trigger";
import { TargetComposer } from "@core/world/target-composer";

export class Macros {
    targets: TargetComposer;
    revision = 0;
    macros: Macro[] = [];
    #macroAlreadyExecuted: Set<Macro> = new Set();

    meta: {
        hotkeyMacros: Macro[];
        mouseMacros: Macro[];
        hookMacros: Macro[];
    } = {
            hotkeyMacros: [],
            mouseMacros: [],
            hookMacros: []
        }

    constructor(targets: TargetComposer, macros?: MacrosDTO,) {
        if (macros) {
            this.deserialize(macros);
        }
        this.targets = targets;
    }

    add(macro: Macro) {
        this.macros.push(macro);
    }

    #listenForKeyCombos(type: "keydown" | "keyup") {

        const testCombo = new KeyCombo();

        const _keyListener = (e: KeyboardEvent) => {
            if (e.code !== "AltLeft" && e.code !== "F10") {
                e.preventDefault();
            }

            if (testCombo.isIllegal(e)) {
                return;
            }
            if (type == "keyup") {
                this.#macroAlreadyExecuted.clear();
            }

            const candidates: Macro[] = [];
            testCombo.set(e);

            for (const macro of this.meta.hotkeyMacros) {
                if (this.#macroAlreadyExecuted.has(macro)) {
                    continue;
                }
                const trigger = macro.trigger as HotkeyTrigger;
                if (trigger.onKeyUp === (type !== "keyup")) {
                    continue;
                }
                if (trigger.value.test(testCombo) && this.#testMacroConditions(macro, e)) {
                    if (type === "keydown")
                        this.#macroAlreadyExecuted.add(macro);
                    candidates.push(macro);
                }
            }

            for (const macro of candidates) {
                this.#execMacro(macro);
            }

        };

        window.addEventListener(type, _keyListener);
        return () => window.removeEventListener(type, _keyListener);
    }
    /**
     * Manages listening to hotkey triggers and executing macros.
     * @returns disposable
     */
    listenForKeyCombos() {

        const janitor = new Janitor("Macros.listenForKeyCombos");
        janitor.mop(this.#listenForKeyCombos("keydown"), "keydown");
        janitor.mop(this.#listenForKeyCombos("keyup"), "keyup");

        return janitor;
    }

    mouseTrigger(e: MouseTriggerDTO) {
        const candidates: Macro[] = [];
        for (const macro of this.meta.mouseMacros) {
            const trigger = macro.trigger as MouseTrigger;
            if (trigger.value.test(e) && this.#testMacroConditions(macro, e)) {
                candidates.push(macro);
            }
        }

        for (const macro of candidates) {
            this.#execMacro(macro);
        }
    }

    *[Symbol.iterator]() {
        for (const macro of this.macros) {
            yield macro;
        }
    }

    #testCondition(comparator: ConditionComparator, a: any, b: any) {
        if (comparator === ConditionComparator.Equals) {
            return a === b;
        } else if (comparator === ConditionComparator.NotEquals) {
            return a !== b;
        } else if (comparator === ConditionComparator.GreaterThan) {
            return a > b;
        } else if (comparator === ConditionComparator.GreaterThanOrEquals) {
            return a >= b;
        } else if (comparator === ConditionComparator.LessThan) {
            return a < b;
        } else if (comparator === ConditionComparator.LessThanOrEquals) {
            return a <= b;
        }
        return false;
    }

    #testMacroConditions(macro: Macro, context?: any) {

        for (const condition of macro.conditions) {

            const value = this.targets.getHandler(condition.path[0])!.getValue(condition.path, condition.value, context);

            if (this.#testCondition(condition.comparator, value, condition.value) === false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Executes a macro.
     * @param macro 
     * @param context Additional context provided to environment of caller. Usually provided from plugin hook results.
     */
    #execMacro(macro: Macro, context?: any) {
        const actions = macro.getActionSequence();
        for (const action of actions) {
            if (action.error) {
                log.error(action.error.message);
                continue;
            }

            this.targets.getHandler(action.path[0])!.action(action, context);

        }
    }

    /**
     * Executes a macro by Id.
     * @param id 
     */
    execMacroById(id: string) {
        const macro = this.macros.find((m) => m.id === id);
        if (macro && this.#testMacroConditions(macro)) {
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
        const candidates: Macro[] = [];
        for (const macro of this.meta.hookMacros) {
            if ((macro.trigger as MacroHookTrigger).test(hookName, pluginName) && this.#testMacroConditions(macro, context)) {
                candidates.push(macro);
            }
        }

        for (const macro of candidates) {
            this.#execMacro(macro, context);
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
        };
    }

    deserialize(macrosDTO: MacrosDTO) {
        this.revision = macrosDTO.revision;
        this.macros = macrosDTO.macros.map((macro) => {
            let trigger: MacroTrigger = new ManualTrigger();
            if (macro.trigger.type === TriggerType.Hotkey) {
                trigger = HotkeyTrigger.deserialize(macro.trigger.value);
            } else if (macro.trigger.type === TriggerType.GameHook) {
                trigger = MacroHookTrigger.deserialize(macro.trigger.value);
            } else if (macro.trigger.type === TriggerType.Mouse) {
                trigger = MouseTrigger.deserialize(macro.trigger.value);
            }
            const newMacro = new Macro(
                macro.id,
                macro.name,
                trigger,
                macro.actions,
                macro.actionSequence,
                macro.conditions,
            );
            newMacro.enabled = macro.enabled;

            return newMacro;
        });

        this.meta.hookMacros = this.macros.filter((m) => m.trigger instanceof MacroHookTrigger).sort((a, b) => {
            return a.trigger.weight - b.trigger.weight;
        });

        this.meta.hotkeyMacros = this.macros.filter((m) => m.trigger instanceof HotkeyTrigger).sort((a, b) => (a.trigger as HotkeyTrigger).weight - (b.trigger as HotkeyTrigger).weight);

        this.meta.mouseMacros = this.macros.filter((m) => m.trigger instanceof MouseTrigger);
    }
}

