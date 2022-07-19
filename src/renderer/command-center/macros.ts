import * as log from "@ipc/log";
import { MathUtils } from "three";

export class Macros {
    macros: Macro[];
    constructor() {
        this.macros = [];
    }
    add(macro: Macro) {
        this.macros.push(macro);
    }
    *trigger(event: KeyboardEvent): Generator<MacroAction[]> {
        for (const macro of this.macros) {
            if (macro.test(event)) {
                yield macro.getActionSequence();
            }
        }
    }
}

export enum MacroActionSequence {
    All,
    Alternate,
    Random
}

export class Macro {
    #trigger: HotkeyTrigger;
    #actions: MacroAction[];
    #actionSequence = MacroActionSequence.All;
    override?= true;
    #counter = 0;
    #guid: string;
    name: string;
    enabled = true;

    constructor(guid: string, labeL: string, trigger: HotkeyTrigger, actions: MacroAction[], actionSequence = MacroActionSequence.All) {
        this.#guid = guid;
        this.name = labeL;
        this.#trigger = trigger;
        this.#actions = actions;
        this.#actionSequence = actionSequence;
    }

    test(event: KeyboardEvent) {
        return this.#trigger.test(event);
    }

    getActionSequence() {

        if (this.#actionSequence === MacroActionSequence.Alternate) {
            const nextInSequence = this.#actions.slice(this.#counter, this.#counter + 1);
            this.#counter = (this.#counter + 1) % this.#actions.length;
            return nextInSequence;
        } else if (this.#actionSequence === MacroActionSequence.Random) {
            const i = MathUtils.randInt(0, this.#actions.length - 1);
            return this.#actions.slice(i, i + 1);
        } else {
            return this.#actions;
        }
    }

    toString() {
        return this.#guid;
    }
}

export enum MacroActionEffect {
    OriginalValue,
    Set,
    Toggle,
    Increase,
    Decrease,
    Min,
    Max,
    CallMethod
}

export enum MacroTargetContext {
    Host,
    GameTimeApi,
    Plugin
}

export interface MacroAction {
    target: MacroTargetContext;
    targetId?: string;
    field?: string[];
    effect: MacroActionEffect;
    value?: any;
    resetValue?: any;
}


interface Trigger<T> {
    test: (event: T) => boolean;
}

export class HotkeyTrigger implements Trigger<KeyboardEvent> {
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

export const getMacroActionValue = (action: MacroAction, defaultValue: any, _step?: number, _min?: number, _max?: number) => {

    let value = action.effect === MacroActionEffect.OriginalValue ? action.resetValue : defaultValue;
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

    //TODO: allow multipliers for increase / decrease
    if (action.effect === MacroActionEffect.Increase) {
        return Math.min(value + step, max);
    } else if (action.effect === MacroActionEffect.Decrease) {
        return Math.max(value - step!, min);
    } else if (action.effect === MacroActionEffect.Set) {
        return value;
    } else if (action.effect === MacroActionEffect.Max) {
        return max;
    } else if (action.effect === MacroActionEffect.Min) {
        return min;
    } else if (action.effect === MacroActionEffect.Toggle) {
        return !value;
    }

    log.warning(`@plugin-system-native: unsupported action effect "${action.effect}"`);
    return value;
}

// class StreamDeckTrigger implements Trigger {

// }