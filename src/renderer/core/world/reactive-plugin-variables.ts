import { log } from "@ipc/log";
import { macroEffectApply } from "@macros/macro-effect-apply";
import { createMutateEffectStore } from "@macros/create-mutate-effect-store";
import { PluginBase, PluginSystemNative } from "@plugins/plugin-system-native";
import { settingsStore } from "@stores/settings-store";
import { last } from "@utils/function-utils";
import { Janitor } from "three-janitor";
import { FieldDefinition, MutateActionEffect, MacroActionPluginModifyValue } from "common/types";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { globalEvents } from "@core/global-events";

type PluginResetStore = {
    [pluginName: string]: {
        [variableName: string]: FieldDefinition | number | boolean | string | number[];
    };
}

/**
 * An api that allows the consumer to modify plugin values and have the system respond.
 */
export const createReactivePluginApi = (plugins: PluginSystemNative) => {

    const janitor = new Janitor("ReactivePluginApi");

    // set the default values for user with reset()
    const defaultValues = JSON.parse(JSON.stringify(plugins.reduce((acc, plugin) => {
        for (const [key, field] of Object.entries(plugin.rawConfig ?? {})) {
            lSet(acc, [plugin.name, key], (field as FieldDefinition)?.value ?? field);
        }
        return acc;
    }, {}))) as PluginResetStore;

    // The user changed a plugin config so update the defaults
    janitor.mop(globalEvents.on("command-center-plugin-config-changed", ({ pluginId, config }) => {
        const plugin = plugins.getById(pluginId);
        if (plugin) {
            for (const [key, field] of Object.entries(config ?? {})) {
                if (key !== "system") {
                    lSet(defaultValues, [plugin.name, key], (field as FieldDefinition)?.value ?? field);
                }
            }
        }
    }));

    const modifyPluginValue = (pluginName: string, fieldKey: string, effect: MutateActionEffect, newValue: any, resetValue: any) => {

        const plugin = plugins.getByName(pluginName);

        if (!plugin) {
            log.error(`@macro-action: Plugin ${pluginName} not found`);
            return null;
        }

        if (!plugins.isRegularPluginOrActiveSceneController(plugin)) {
            return null;
        }

        const field = plugin.getRawConfigComponent(fieldKey);

        if (field === undefined) {
            return null;
        }

        //TODO: copy config to new config so onConfigChanged works properly
        plugin.setConfig(fieldKey, macroEffectApply(effect, field, newValue, resetValue), false);
        plugins.hook_onConfigChanged(plugin.id, plugin.rawConfig);

        return {
            pluginId: plugin.id,
            config: plugin.config
        }

    }


    const applyEffectFromMethod = (pluginName: string) => (effect: MutateActionEffect, path: string[], newValue: any) => {

        const resetValue = lGet(defaultValues, path);

        modifyPluginValue(pluginName, last(path), effect, newValue, resetValue);

    }

    const getRawValue = (name: string, field: string[]) => lGet(plugins.getByName(name)?.rawConfig ?? {}, field);

    const definePluginVar = (plugin: PluginBase) => createMutateEffectStore(applyEffectFromMethod(plugin.name), (path: string[]) => getRawValue(plugin.name, last(path)));

    const vars = plugins.reduce((acc, plugin) => {

        Object.entries(plugin.rawConfig).forEach(([key, value]) => {

            if (key !== "system") {
                const compKey = [plugin.name, key];
                lSet(acc, compKey, definePluginVar(plugin)(value as FieldDefinition, compKey));
                lSet(acc, [plugin.name, `get${key[0].toUpperCase() + key.slice(1)}`], () => lGet(acc, compKey));
            }

        });

        // callables
        (settingsStore().enabledPlugins.find(p => p.id === plugin.id)?.externMethods ?? []).map((method) => {
            lSet(acc, [plugin.name, method], (...args: any[]) => plugin[method as keyof PluginBase](...args));
        })

        return acc;

    }, {});


    const mutate = (action: MacroActionPluginModifyValue) => {

        const resetValue = lGet(defaultValues, [action.pluginName, ...action.field]);

        return modifyPluginValue(action.pluginName, action.field[0], action.effect, action.value, resetValue);

    }

    return {
        getRawValue,
        mutate,
        vars,
        dispose: () => janitor.dispose(),
    }
}
