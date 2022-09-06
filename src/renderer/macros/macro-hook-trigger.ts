import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";

export interface MacroHookTriggerDTO {
    hookName: string;
    pluginName?: string;
}

export class MacroHookTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    hookName: string;
    pluginName?: string;

    constructor(dto: MacroHookTriggerDTO = { hookName: "" }) {
        this.hookName = dto.hookName;
        this.pluginName = dto.pluginName;
    }

    serialize() {
        return {
            type: this.type,
            value: {
                hookName: this.hookName,
                pluginName: this.pluginName,
            }
        }
    }

    test(hookName: string, pluginName?: string) {
        return this.hookName === hookName && (this.pluginName === undefined || this.pluginName === pluginName);
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new MacroHookTrigger(dto.value);
    };

    toString() {
        return [this.hookName, this.pluginName].filter((v) => v !== undefined).join(":");
    }

    get weight() {
        return this.pluginName === undefined ? 0 : 1;
    }

}