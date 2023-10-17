import { OpenBW } from "@openbw/openbw";

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
import { WorldEvents } from "./world-events";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import { normalizePluginConfiguration } from "@utils/function-utils";
import TestController from "@plugins/built-in/default-camera-controller?raw";

export type PluginSession = Awaited<ReturnType<typeof createPluginSession>>;

export const createPluginSession = async (
    openBW: OpenBW,
    _events: TypeEmitter<WorldEvents>
) => {
    const janitor = new Janitor( "PluginSession" );

    const events = janitor.mop( new TypeEmitterProxy( _events ) );

    const pluginPackages = settingsStore().activatedPlugins;
    const uiPlugins = janitor.mop(
        new PluginSystemUI( openBW, pluginPackages ),
        "uiPlugins"
    );

    events.on( "frame-reset", ( frame ) => {
        uiPlugins.onFrameReset( frame );
    } );

    events.on( "selected-units-changed", ( units ) => {
        uiPlugins.onUnitsUpdated( units );
    } );

    const nativePlugins = janitor.mop(
        new PluginSystemNative(
            pluginPackages,
            ( pluginId: string, message: unknown ) =>
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

    nativePlugins.activateAdditionalPlugins([
        {
            externMethods: [],
            apiVersion: "2.0.0",
            hooks: [],
            hostIndexFile: "",
            id: "test-controller",
            indexFile: "",
            isSceneController: true,
            name: "test-controller",
            path: "",
            version: "1.0.0",
            nativeSource: TestController,
        },
    ], createCompartment)

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
                    payload: { pluginId, config: normalizePluginConfiguration( config ) },
                } );
                nativePlugins.hook_onConfigChanged( pluginId, config );
                store.sourceOfTruth.update( nativePlugins.getConfigSnapshot() );
            }
        ),
        "command-center-plugin-config-changed"
    );

    janitor.mop(
        globalEvents.on( "command-center-plugin-deactivated", ( pluginId ) => {
            nativePlugins.deactivatePlugin( pluginId );
            uiPlugins.deactivatePlugin( pluginId );
        } ),
        "command-center-plugin-deactivated"
    );

    janitor.mop(
        globalEvents.on( "command-center-plugins-activated", ( plugins ) => {
            uiPlugins.activatePlugins( plugins );
            nativePlugins.activateAdditionalPlugins( plugins, createCompartment );
        } ),
        "command-center-plugins-activated"
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
