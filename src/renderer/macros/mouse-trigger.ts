import { MacroTrigger, TriggerType } from "common/types";

export class MouseTriggerValue {
    ctrlKey = false;
    altKey = false;
    shiftKey = false;
    button = 0;

    test(e: MouseEvent) {
        return (
            this.ctrlKey === e.ctrlKey &&
            this.altKey === e.altKey &&
            this.shiftKey === e.shiftKey &&
            this.button === e.button
        );
    }

    copy(dto: MouseTriggerDTO) {
        this.ctrlKey = dto.ctrlKey;
        this.altKey = dto.altKey;
        this.shiftKey = dto.shiftKey;
        this.button = dto.button;
    }
}

export interface MouseTriggerDTO {
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    button: number;
}

export class MouseTrigger implements MacroTrigger {
    type = TriggerType.Mouse;
    value = new MouseTriggerValue();

    constructor(
        dto: MouseTriggerDTO = {
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            button: 0,
        }
    ) {
        if (dto) {
            this.copy(dto);
        }
    }

    serialize(): MouseTriggerDTO {
        return {
            ctrlKey: this.value.ctrlKey,
            altKey: this.value.altKey,
            shiftKey: this.value.shiftKey,
            button: this.value.button,
        };
    }

    static deserialize(dto: MouseTriggerDTO) {
        return new MouseTrigger().copy(dto);
    }

    stringify() {
        const shiftKey = this.value.shiftKey ? ["Shift"] : [];
        const ctrlKey = this.value.ctrlKey ? ["Ctrl"] : [];
        const altKey = this.value.altKey ? ["Alt"] : [];
        const v = [
            ...shiftKey,
            ...ctrlKey,
            ...altKey,
            `Button${this.value.button}`,
        ].join("+");
        return v;
    }

    copy(dto: MouseTriggerDTO) {
        this.value.copy(dto);
        return this;
    }

    get weight() {
        return 0;
    }
}
