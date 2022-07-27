import * as log from "@ipc/log";
import settingsStore from "@stores/settings-store";
import { MacroActionType, MacrosDTO, Settings, MacroTrigger, TriggerType } from "common/types";
import * as plugins from "../../plugins";
import packagejson from "../../../../package.json";
import { Macro } from "./macro";
import { ManualTrigger } from "./manual-trigger";
import { HotkeyTrigger } from "./hotkey-trigger";
import { KeyCombo } from "./key-combo";

export class Macros {
    #createGameCompartment?: (deps?: {}) => Compartment;

    version = packagejson.config["titan-reactor-macro-api"];
    revision = 0;
    macros: Macro[] = [];

    add(macro: Macro) {
        this.macros.push(macro);
    }

    listenForKeyCombos() {

        let testCombo = new KeyCombo;
        let candidate: Macro | null;
        let acceptingInput: NodeJS.Timeout | null = null;

        const finishUp = () => {
            acceptingInput = null;
            if (candidate) {
                this.#execMacro(candidate);
                candidate = null;
            }
        }
        //TODO: allow user to configure timeout on key combo
        const createInputWindow = () => {
            clearTimeout(acceptingInput!);
            acceptingInput = setTimeout(() => {
                finishUp();
            }, 800);
        }


        const _listener = (e: KeyboardEvent) => {

            if (testCombo.isIllegal(e)) {
                return;
            }

            const macros = this.macros.filter(m => m.trigger instanceof HotkeyTrigger).sort((a, b) => (a.trigger as HotkeyTrigger).weight - (b.trigger as HotkeyTrigger).weight);


            if (acceptingInput === null) {
                testCombo.set(e);
            } else {
                testCombo.add(e);
            }
            createInputWindow();

            const currentWeight = testCombo.codes.length;
            const maxWeight = macros.reduce((acc, m) => Math.max(acc, (m.trigger as HotkeyTrigger).weight), 0);

            for (const macro of macros) {
                if (macro.trigger instanceof HotkeyTrigger) {
                    const trigger = macro.trigger as HotkeyTrigger;
                    if (trigger.weight === currentWeight) {
                        if (trigger.value.test(testCombo)) {
                            candidate = macro;
                            break;
                        }
                    }
                }
            }

            let _canSkip = true;
            // see if we can short circuit the next weights
            for (let nextWeight = currentWeight + 1; nextWeight <= maxWeight; nextWeight++) {
                for (const macro of macros) {
                    if (macro.trigger instanceof HotkeyTrigger) {
                        const trigger = macro.trigger as HotkeyTrigger;
                        if (trigger.weight === nextWeight) {
                            if (trigger.value.testShallow(testCombo, currentWeight)) {
                                _canSkip = false;
                                break;
                            }
                        }
                    }
                }
            }
            if (_canSkip) {
                clearTimeout(acceptingInput!);
                finishUp();
            }
        }

        window.addEventListener("keydown", _listener);
        return () => window.removeEventListener("keydown", _listener);
    }

    *[Symbol.iterator]() {
        for (const macro of this.macros) {
            yield macro;
        }
    }

    setContainer(createCompartment: ((deps?: {}) => Compartment)) {
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

    #execMacro(macro: Macro) {
        const settings = settingsStore();

        const actions = macro.getActionSequence();
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

    execMacroById(id: string) {
        const macro = this.macros.find((m) => m.id === id);
        if (macro) {
            this.#execMacro(macro);
        } else {
            log.error(`Macro with id ${id} not found`);
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
                trigger: macro.trigger.serialize(),
                actionSequence: macro.actionSequence,
                actions: macro.actions,
            })),
        }
    }

    deserialize(macrosDTO: MacrosDTO) {
        this.version = macrosDTO.version;
        this.macros = macrosDTO.macros.map((macro) => {
            let trigger: MacroTrigger = new ManualTrigger();
            if (macro.trigger.type === TriggerType.Hotkey) {
                trigger = HotkeyTrigger.deserialize(macro.trigger)
            }
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

