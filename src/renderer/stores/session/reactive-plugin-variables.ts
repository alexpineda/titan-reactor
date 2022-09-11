import { PluginBase, PluginSystemNative } from "@plugins/plugin-system-native";
import settingsStore from "@stores/settings-store";
import { FieldDefinition, MacroActionEffect, MacroActionPluginModifyValue, MacroActionType } from "common/types";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { createReactiveVariable } from "./create-reactive-variable";

/**
 * An api that allows the consumer to modify plugin values and have the system respond.
 */
export const createReactivePluginApi = (plugins: PluginSystemNative) => {

    const applyEffect = (pluginName: string) => (effect: MacroActionEffect, path: string[], newValue: any, resetValue: any) => {
        plugins.doMacroAction({
            effect,
            field: path,
            id: "",
            pluginName,
            type: MacroActionType.ModifyPluginSettings,
            value: newValue,
            resetValue,
        });
    }

    const getRawValue = (name: string, field: string[]) => lGet(plugins.getByName(name)?.rawConfig ?? {}, field);

    const definePluginVar = (plugin: PluginBase) => createReactiveVariable(applyEffect(plugin.name), (path) => getRawValue(plugin.name, path));

    const pluginVars = plugins.reduce((acc, plugin) => {
        Object.entries(plugin.rawConfig).forEach(([key, value]) => {
            if (key !== "system") {
                lSet(acc, [plugin.name, key], definePluginVar(plugin)(value as FieldDefinition, [plugin.name, key]))
            }
        });
        const callables = (settingsStore().enabledPlugins.find(p => p.name === plugin.name)?.methods ?? []).map((method) => {
            console.log(method)
        })
        return acc;
    }, {});


    const doAction = (action: MacroActionPluginModifyValue) => {
        return plugins.doMacroAction(action);
    }

    return {
        getRawValue,
        doAction,
        pluginVars
    }
}
