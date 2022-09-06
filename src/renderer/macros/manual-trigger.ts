import { MacroTrigger, TriggerType } from "common/types";

export class ManualTrigger implements MacroTrigger {
    type = TriggerType.Manual;
    readonly weight = 0;

    async test() {
        return false;
    }

    serialize() {
        return null;
    }

    static deserialize() {
        return new ManualTrigger();
    }

}