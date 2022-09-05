import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";

export class MouseTriggerValue {
    ctrlKey = false;
    altKey = false;
    shiftKey = false;
    button = 0;

    test(e: MouseEvent) {
        return this.ctrlKey === e.ctrlKey && this.altKey === e.altKey && this.shiftKey === e.shiftKey && this.button === e.button;
    }

    stringify() {
        const shiftKey = this.shiftKey ? ["Shift"] : [];
        const ctrlKey = this.ctrlKey ? ["Ctrl"] : [];
        const altKey = this.altKey ? ["Alt"] : [];
        const v = [...shiftKey, ...ctrlKey, ...altKey, this.button].join("+");
        return v;
    }

    parse(raw: string) {
        const keys = (raw ?? "").split("+");
        const button = keys.filter(k => ["Shift", "Ctrl", "Alt"].includes(k) === false)[0];
        const keyCombo = {
            ctrlKey: keys.includes("Ctrl"),
            altKey: keys.includes("Alt"),
            shiftKey: keys.includes("Shift"),
            button: button ? Number(button) : 0,
        }
        Object.assign(this, keyCombo);
    }
}
export class MouseTrigger implements MacroTrigger {
    type = TriggerType.Mouse;
    value = new MouseTriggerValue();

    constructor(raw: string) {
        this.value.parse(raw);
    }

    serialize() {
        return {
            type: this.type,
            value: this.value.stringify()
        }
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new MouseTrigger(dto.value ?? "");
    };

    get weight() {
        return 0;
    }
}
