import { MacroTrigger, TriggerType } from "common/types";
import { KeyCombo, KeyComboDTO } from "./key-combo";

export interface HotkeyTriggerDTO extends KeyComboDTO {
    onKeyUp: boolean;
}

export class HotkeyTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    value = new KeyCombo();
    onKeyUp = false;

    constructor(
        dto: HotkeyTriggerDTO = {
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            codes: [],
            onKeyUp: false,
        }
    ) {
        this.copy( dto );
    }

    serialize(): HotkeyTriggerDTO {
        return {
            ctrlKey: this.value.ctrlKey,
            altKey: this.value.altKey,
            shiftKey: this.value.shiftKey,
            codes: this.value.codes,
            onKeyUp: this.onKeyUp,
        };
    }

    static deserialize( dto: HotkeyTriggerDTO ) {
        return new HotkeyTrigger().copy( dto );
    }

    get weight() {
        return this.value.codes.length;
    }

    stringify() {
        const shiftKey = this.value.shiftKey ? ["Shift"] : [];
        const ctrlKey = this.value.ctrlKey ? ["Ctrl"] : [];
        const altKey = this.value.altKey ? ["Alt"] : [];
        const v = [...shiftKey, ...ctrlKey, ...altKey, ...this.value.codes].join( "+" );
        return v;
    }

    copy( dto: HotkeyTriggerDTO ) {
        this.value.copy( dto );
        this.onKeyUp = dto.onKeyUp;
        return this;
    }
}
