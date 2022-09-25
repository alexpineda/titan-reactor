import { log } from "@ipc/log";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { FieldDefinition } from "common/types";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { globalEvents } from "@core/global-events";
import { createResettableStore } from "@stores/resettable-store";
import { createOperatableStore } from "@stores/operatable-store";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";
import { PluginBase } from "@plugins/plugin-base";

type PluginResetStore = {
    [pluginName: string]: {
        [variableName: string]: number | boolean | string | number[];
    };
}

/**
 * An api that allows the consumer to modify plugin values and have the system respond.
 */
export const createPluginSessionStore = (plugins: PluginSystemNative, uiPlugins: PluginSystemUI) => {

    const janitor = new Janitor("ReactivePluginApi");

    const sessionStore = createResettableStore({
        sourceOfTruth: plugins.reduce((acc, plugin) => {
            for (const [key, field] of Object.entries(plugin.rawConfig ?? {})) {
                if (key !== "system" && (field as FieldDefinition)?.value !== undefined) {
                    lSet(acc, [plugin.name, key], (field as FieldDefinition).value);
                }
            }
            return acc;
        }, {}) as PluginResetStore,
        validateMerge: (_, __, path) => {
            if (path === undefined) {
                log.warn("Attempted to set the entire plugin session store. This is not allowed.");
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

            if (!plugin.configExists) {
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

            const plugin = plugins.getByName(path[0])!;

            plugins.hook_onConfigChanged(plugin.id, lSet(plugin.rawConfig!, [path[1], "value"], value));

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

    const store = createOperatableStore(sessionStore, getValue);

    // The user changed a plugin config so update the defaults
    janitor.mop(globalEvents.on("command-center-plugin-config-changed", ({ pluginId, config }) => {

        const plugin = plugins.getById(pluginId);

        if (plugin) {

            for (const [key, field] of Object.entries(config ?? {})) {

                if (key !== "system") {

                    //TODO: update store as well
                    store.updateSourceOfTruth(lSet({}, [plugin.name, key], (field as FieldDefinition)?.value ?? field));

                }

            }

        }

    }));


    const vars = plugins.reduce((acc, plugin) => {

        Object.keys(plugin.rawConfig ?? {}).forEach((key) => {

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
