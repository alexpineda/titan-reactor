import { log } from "@ipc/log";
import { PluginBase, PluginSystemNative } from "@plugins/plugin-system-native";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { FieldDefinition } from "common/types";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { globalEvents } from "@core/global-events";
import { createSessionStore } from "@stores/session-store";
import { createMutationStore } from "@stores/mutation-store";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";

type PluginResetStore = {
    [pluginName: string]: {
        [variableName: string]: number | boolean | string | number[];
    };
}

/**
 * An api that allows the consumer to modify plugin values and have the system respond.
 */
export const createReactivePluginApi = (plugins: PluginSystemNative, uiPlugins: PluginSystemUI) => {

    const janitor = new Janitor("ReactivePluginApi");

    const sessionStore = createSessionStore({
        sourceOfTruth: plugins.reduce((acc, plugin) => {
            for (const [key, field] of Object.entries(plugin.rawConfig ?? {})) {
                if ((field as FieldDefinition)?.value) {
                    throw new Error(`Plugin ${plugin.name} has a field ${key} with a value property. This is not allowed.`);
                }
                lSet(acc, [plugin.name, key], (field as FieldDefinition).value);
            }
            return acc;
        }, {}) as PluginResetStore,
        validateMerge: (_, __, path) => {
            if (path === undefined) {
                return false;
            }
            const plugin = plugins.getByName(path[0]);

            if (!plugin) {
                log.error(`@validate-merge: Plugin ${path[0]} not found`);
                return false;
            }

            if (!plugins.isRegularPluginOrActiveSceneController(plugin)) {
                return false;
            }

            const field = plugin.getFieldDefinition(path[1]);

            if (field === undefined) {
                return false;
            }

            return true;
        },
        onUpdate: (_, __, path, value) => {
            if (path === undefined) {
                log.warn("@on-update: path is undefined");
                return;
            }

            const plugin = plugins.getByName(path[0]);

            if (!plugin) {
                log.error(`@on-update: Plugin ${path[0]} not found`);
                return false;
            }

            plugins.hook_onConfigChanged(plugin.id, lSet(plugin.rawConfig, [path[1], "value"], value));

            uiPlugins.sendMessage({
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: {
                    pluginId: plugin.id,
                    config: plugin.config,
                }
            });
        }
    });

    const getValue = (path: string[]) => lGet(plugins.getByName(path[0])?.rawConfig ?? {}, path[1]);

    const store = createMutationStore(sessionStore, getValue);

    // The user changed a plugin config so update the defaults
    janitor.mop(globalEvents.on("command-center-plugin-config-changed", ({ pluginId, config }) => {

        const plugin = plugins.getById(pluginId);

        if (plugin) {

            for (const [key, field] of Object.entries(config ?? {})) {

                if (key !== "system") {

                    store.updateSourceOfTruth(lSet({}, [plugin.name, key], (field as FieldDefinition)?.value ?? field));

                }

            }

        }

    }));


    const vars = plugins.reduce((acc, plugin) => {

        Object.keys(plugin.rawConfig).forEach((key) => {

            if (key !== "system") {
                const compKey = [plugin.name, key];
                lSet(acc, compKey, store.createVariable(compKey));
                lSet(acc, [plugin.name, `get${key[0].toUpperCase() + key.slice(1)}`], () => lGet(acc, compKey));
            }

        });

        // callables
        (settingsStore().enabledPlugins.find(p => p.id === plugin.id)?.externMethods ?? []).map((method) => {
            lSet(acc, [plugin.name, method], (...args: any[]) => plugin[method as keyof PluginBase](...args));
        })

        return acc;

    }, {});

    return {
        ...store,
        vars,
        dispose: () => janitor.dispose(),
    }
}
