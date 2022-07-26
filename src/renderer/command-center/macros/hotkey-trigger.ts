import { keyComboWeight } from "@utils/key-utils";
import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";
import { KeyCombo } from "./key-combo";

export class HotkeyTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    #keyCombo = new KeyCombo;

    constructor(raw: string) {
        this.#keyCombo.deserialize(raw);
    }

    test(event: KeyboardEvent) {
        return this.#keyCombo.testKeyComboFromEvent(event);
    }

    serialize() {
        return {
            type: TriggerType.Hotkey,
            value: this.#keyCombo.serialize()
        }
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new HotkeyTrigger(dto.value);
    };

    get weight() {
        return keyComboWeight(this.#keyCombo.keyCombo);
    }
}
