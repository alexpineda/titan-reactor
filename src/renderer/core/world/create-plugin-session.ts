import { OpenBW } from "common/types";
import {
    UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
    UI_SYSTEM_MOUSE_CLICK,
} from "@plugins/events";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import screenStore from "@stores/scene-store";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { createReactivePluginApi } from "@core/world/reactive-plugin-variables";
import { globalEvents } from "@core/global-events";

export type PluginSession = Awaited<ReturnType<typeof createPluginSession>>;

export const createPluginSession = async (openBW: OpenBW) => {

    const janitor = new Janitor("PluginSession");

    const pluginPackages = settingsStore().enabledPlugins;
    const uiPlugins = janitor.mop(new PluginSystemUI(pluginPackages, (id) => openBW.get_util_funcs().dump_unit(id)), "uiPlugins");
    const nativePlugins = janitor.mop(new PluginSystemNative(pluginPackages, uiPlugins), "nativePlugins");

    // available to macros and sandbox only
    const reactiveApi = janitor.mop(createReactivePluginApi(nativePlugins), "reactiveApi");

    await uiPlugins.isRunning();

    janitor.mop(globalEvents.on("command-center-plugin-config-changed", ({ pluginId, config }) => {
        //TODO: diff
        uiPlugins.sendMessage({
            type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
            payload: { pluginId, config }
        });
        nativePlugins.hook_onConfigChanged(pluginId, config);
    }), "command-center-plugin-config-changed");

    janitor.mop(globalEvents.on("command-center-plugin-disabled", (pluginId) => {
        nativePlugins.hook_onPluginDispose(pluginId);
        uiPlugins.disablePlugin(pluginId);
    }), "command-center-plugin-disabled");

    janitor.mop(globalEvents.on("command-center-plugins-enabled", (plugins) => {
        uiPlugins.enablePlugins(plugins);
        nativePlugins.enableAdditionalPlugins(plugins);
    }), "command-center-plugins-enabled");

    janitor.mop(globalEvents.on("initial-install-error-plugins", () => {
        screenStore().setError(new Error("Failed to install plugins"));
    }), "initial-install-error-plugins");

    const _clickPassThrough = (evt: MouseEvent) => uiPlugins.sendMessage({
        type: UI_SYSTEM_MOUSE_CLICK,
        payload: {
            clientX: evt.clientX,
            clientY: evt.clientY,
            button: evt.button,
            shiftKey: evt.shiftKey,
            ctrlKey: evt.ctrlKey,
        },
    });

    janitor.addEventListener(document.body, "mouseup", "clickPassThrough", _clickPassThrough);

    return {
        nativePlugins,
        uiPlugins,
        reactiveApi,
        dispose() {
            janitor.dispose();
        },

    }

}