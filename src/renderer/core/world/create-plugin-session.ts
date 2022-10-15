import { OpenBW } from "common/types";
import {
    UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
    UI_SYSTEM_MOUSE_CLICK,
    UI_SYSTEM_CUSTOM_MESSAGE,
} from "@plugins/events";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import screenStore from "@stores/scene-store";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import { createPluginSessionStore } from "@core/world/plugin-session-store";
import { createCompartment } from "@utils/ses-util";
import { globalEvents } from "@core/global-events";

export type PluginSession = Awaited<ReturnType<typeof createPluginSession>>;

export const createPluginSession = async ( openBW: OpenBW ) => {
    const janitor = new Janitor( "PluginSession" );

    const pluginPackages = settingsStore().enabledPlugins;
    const uiPlugins = janitor.mop(
        new PluginSystemUI( pluginPackages, ( id ) =>
            openBW.get_util_funcs().dump_unit( id )
        ),
        "uiPlugins"
    );
    const nativePlugins = janitor.mop(
        new PluginSystemNative(
            pluginPackages,
            ( pluginId: string, message: any ) =>
                uiPlugins.sendMessage( {
                    type: UI_SYSTEM_CUSTOM_MESSAGE,
                    payload: {
                        pluginId,
                        message,
                    },
                } ),
            createCompartment
        ),
        "nativePlugins"
    );

    // available to macros and sandbox only
    const store = janitor.mop(
        createPluginSessionStore( nativePlugins, uiPlugins ),
        "reactiveApi"
    );

    await uiPlugins.isRunning();

    janitor.mop(
        globalEvents.on(
            "command-center-plugin-config-changed",
            ( { pluginId, config } ) => {
                uiPlugins.sendMessage( {
                    type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                    payload: { pluginId, config },
                } );
                nativePlugins.hook_onConfigChanged( pluginId, config );
                store.sourceOfTruth.update( nativePlugins.getConfigSnapshot() );
            }
        ),
        "command-center-plugin-config-changed"
    );

    janitor.mop(
        globalEvents.on( "command-center-plugin-disabled", ( pluginId ) => {
            nativePlugins.disposePlugin( pluginId );
            uiPlugins.disablePlugin( pluginId );
        } ),
        "command-center-plugin-disabled"
    );

    janitor.mop(
        globalEvents.on( "command-center-plugins-enabled", ( plugins ) => {
            uiPlugins.enablePlugins( plugins );
            nativePlugins.enableAdditionalPlugins( plugins, createCompartment );
        } ),
        "command-center-plugins-enabled"
    );

    janitor.mop(
        globalEvents.on( "initial-install-error-plugins", () => {
            screenStore().setError( new Error( "Failed to install plugins" ) );
        } ),
        "initial-install-error-plugins"
    );

    const _clickPassThrough = ( evt: MouseEvent ) =>
        uiPlugins.sendMessage( {
            type: UI_SYSTEM_MOUSE_CLICK,
            payload: {
                clientX: evt.clientX,
                clientY: evt.clientY,
                button: evt.button,
                shiftKey: evt.shiftKey,
                ctrlKey: evt.ctrlKey,
            },
        } );

    janitor.addEventListener(
        document.body,
        "mouseup",
        "clickPassThrough",
        _clickPassThrough
    );

    return {
        nativePlugins,
        uiPlugins,
        store,
        dispose() {
            janitor.dispose();
        },
    };
};
