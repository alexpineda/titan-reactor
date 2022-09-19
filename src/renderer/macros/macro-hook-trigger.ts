import { MacroTrigger, TriggerType } from "common/types";

export interface MacroHookTriggerDTO {
    hookName: string;
    pluginName?: string;
}

export class MacroHookTrigger implements MacroTrigger {
    type = TriggerType.GameHook;
    hookName: string;
    pluginName?: string;

    constructor(dto: MacroHookTriggerDTO = { hookName: "" }) {
        this.hookName = dto.hookName;
        this.pluginName = dto.pluginName;
    }

    serialize() {
        return {
            hookName: this.hookName,
            pluginName: this.pluginName,
        }
    }

    test(hookName: string, pluginName?: string) {
        return this.hookName === hookName && (this.pluginName === undefined || this.pluginName === pluginName);
    }

    static deserialize(dto: MacroHookTriggerDTO) {
        return new MacroHookTrigger(dto);
    };

    toString() {
        return [this.hookName, this.pluginName].filter((v) => v !== undefined).join(":");
    }

    get weight() {
        return this.pluginName === undefined ? 0 : 1;
    }

}