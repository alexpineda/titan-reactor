import {
    MacroAction,
    MacroActionSequence,
    MacroCondition,
    MacroTrigger,
} from "common/types";
import groupBy from "lodash.groupby";
import { MathUtils } from "three";

export class Macro {
    name: string;
    description = "";
    enabled = true;
    trigger: MacroTrigger;
    actions: MacroAction[];
    conditions: MacroCondition[] = [];
    actionSequence = MacroActionSequence.AllSync;
    #groups: Record<string, MacroAction[]> = {};
    #counter = 0;
    id: string;

    constructor(
        guid: string,
        labeL: string,
        trigger: MacroTrigger,
        actions: MacroAction[],
        actionSequence: MacroActionSequence = MacroActionSequence.AllSync,
        conditions: MacroCondition[] = []
    ) {
        this.id = guid;
        this.name = labeL;
        this.trigger = trigger;
        this.actions = actions;
        this.actionSequence = actionSequence;
        this.conditions = conditions;
        this.#groups = groupBy( this.actions, ( a ) => a.group );
    }

    getActionSequence() {
        const groupArray = Object.values( this.#groups );
        if ( this.actionSequence === MacroActionSequence.SingleAlternate ) {
            const nextInSequence = groupArray[this.#counter];
            this.#counter = ( this.#counter + 1 ) % groupArray.length;
            return nextInSequence;
        } else if ( this.actionSequence === MacroActionSequence.SingleRandom ) {
            const i = MathUtils.randInt( 0, groupArray.length - 1 );
            return groupArray[i];
        } else {
            return this.actions;
        }
    }

    toString() {
        return this.id;
    }
}
