import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";

export class HotkeyTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
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

    serialize() {
        return {
            type: TriggerType.Hotkey,
            value: this.#raw
        }
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new HotkeyTrigger(dto.value);
    };
}
