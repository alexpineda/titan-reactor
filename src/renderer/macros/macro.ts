import { MacroAction, MacroActionSequence, MacroActionType, MacroCondition, MacroTrigger, Settings } from "common/types";
import get from "lodash.get";
import { MathUtils } from "three";

export class Macro {
    name: string;
    enabled = true;
    trigger: MacroTrigger;
    actions: MacroAction[];
    actionSequence = MacroActionSequence.AllSync;
    conditions: MacroCondition[] = [];
    #counter = 0;
    id: string;


    constructor(guid: string, labeL: string, trigger: MacroTrigger, actions: MacroAction[], actionSequence: MacroActionSequence = MacroActionSequence.AllSync, conditions: MacroCondition[] = []) {
        this.id = guid;
        this.name = labeL;
        this.trigger = trigger;
        this.actions = actions;
        this.actionSequence = actionSequence;
        this.conditions = conditions;
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