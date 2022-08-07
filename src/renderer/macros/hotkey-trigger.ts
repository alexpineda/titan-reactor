import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";
import { KeyCombo } from "./key-combo";

export class HotkeyTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    value = new KeyCombo();

    constructor(raw: string) {
        this.value.parse(raw);
    }

    serialize() {
        return {
            type: TriggerType.Hotkey,
            value: this.value.stringify()
        }
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new HotkeyTrigger(dto.value ?? "");
    };

    get weight() {
        return this.value.codes.length;
    }
}
