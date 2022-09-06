import { MacroTrigger, TriggerType } from "common/types";
import { KeyCombo, KeyComboDTO } from "./key-combo";

export class HotkeyTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    value = new KeyCombo();
    onKeyUp = false;

    constructor(dto?: KeyComboDTO) {
        if (dto) {
            this.copy(dto);
        }
    }

    serialize(): KeyComboDTO {
        return {
            ctrlKey: this.value.ctrlKey,
            altKey: this.value.altKey,
            shiftKey: this.value.shiftKey,
            codes: this.value.codes
        }
    }

    static deserialize(dto: KeyComboDTO) {
        return (new HotkeyTrigger).copy(dto);
    };

    get weight() {
        return this.value.codes.length;
    }

    stringify() {
        const shiftKey = this.value.shiftKey ? ["Shift"] : [];
        const ctrlKey = this.value.ctrlKey ? ["Ctrl"] : [];
        const altKey = this.value.altKey ? ["Alt"] : [];
        const v = [...shiftKey, ...ctrlKey, ...altKey, ...this.value.codes].join("+");
        return v;
    }

    copy(dto: KeyComboDTO) {
        this.value.copy(dto)
        return this;
    }
}
