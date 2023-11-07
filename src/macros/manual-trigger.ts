import { MacroTrigger, TriggerType } from "common/types";

export class ManualTrigger implements MacroTrigger {
    type = TriggerType.None;
    readonly weight = 0;

    test() {
        return false;
    }

    serialize() {
        return null;
    }

    static deserialize() {
        return new ManualTrigger();
    }
}
