import { MacroTrigger, TriggerType } from "common/types";

export class ManualTrigger implements MacroTrigger {
    type = TriggerType.Manual;

    test() {
        return false;
    }

    serialize() {
        return {
            type: this.type,
        };
    }

    static deserialize() {
        return new ManualTrigger();
    }
}