import { MacroTrigger, MacroTriggerDTO, TriggerType } from "common/types";

export class PluginCustomHookTrigger implements MacroTrigger {
    type = TriggerType.Hotkey;
    hookName: string;
    pluginName?: string;

    constructor(raw: string) {
        const [hookName, pluginName] = raw.split(":");
        this.hookName = hookName;
        this.pluginName = pluginName;
    }

    serialize() {
        return {
            type: TriggerType.Hotkey,
            value: this.toString()
        }
    }

    test(hookName: string, pluginName?: string) {
        return this.hookName === hookName && (this.pluginName === undefined || this.pluginName === pluginName);
    }

    static deserialize(dto: MacroTriggerDTO) {
        return new PluginCustomHookTrigger(dto.value ?? "");
    };

    toString() {
        return [this.hookName, this.pluginName].filter((v) => v !== undefined).join(":");
    }

    get weight() {
        return this.pluginName === undefined ? 0 : 1;
    }

}