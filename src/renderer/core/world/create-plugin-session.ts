import { OpenBW } from "common/types";
import {
    UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
    UI_SYSTEM_MOUSE_CLICK,
} from "@plugins/events";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import screenStore from "@stores/scene-store";
import settingsStore from "@stores/settings-store";
import Janitor from "@utils/janitor";
import { createReactivePluginApi } from "@core/world/reactive-plugin-variables";
import { GameTimeApi } from "./game-time-api";
import { ReactiveSessionVariables } from "./reactive-session-variables";
import { mix } from "@utils/object-utils";
import { createMacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { HOOK_ON_FRAME_RESET, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED } from "@plugins/hooks";
import { globalEvents } from "@render/global-events";

export type PluginSession = Awaited<ReturnType<typeof createPluginSession>>;

export const createPluginSession = async (openBW: OpenBW) => {

    const janitor = new Janitor;

    const pluginPackages = settingsStore().enabledPlugins;
    const uiPlugins = janitor.mop(new PluginSystemUI(pluginPackages, (id) => openBW.get_util_funcs().dump_unit(id)));
    const nativePlugins = janitor.mop(new PluginSystemNative(pluginPackages, uiPlugins));

    // available to macros and sandbox only
    const reactiveApi = janitor.mop(createReactivePluginApi(nativePlugins));

    await uiPlugins.isRunning();

    janitor.mop(globalEvents.on("command-center-plugin-config-changed", ({ pluginId, config }) => {
        //TODO: diff
        uiPlugins.sendMessage({
            type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
            payload: { pluginId, config }
        });
        nativePlugins.hook_onConfigChanged(pluginId, config);
    }));

    janitor.mop(globalEvents.on("command-center-plugin-disabled", (pluginId) => {
        nativePlugins.hook_onPluginDispose(pluginId);
        uiPlugins.disablePlugin(pluginId);
    }));

    janitor.mop(globalEvents.on("command-center-plugins-enabled", (plugins) => {
        uiPlugins.enablePlugins(plugins);
        nativePlugins.enableAdditionalPlugins(plugins);
    }));

    janitor.mop(globalEvents.on("initial-install-error-plugins", () => {
        screenStore().setError(new Error("Failed to install plugins"));
    }));

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

    janitor.addEventListener(document.body, "mouseup", _clickPassThrough);

    return {
        nativePlugins,
        uiPlugins,
        reactiveApi,
        dispose() {
            janitor.dispose();
        },

    }

}


export type PluginsAndMacroSession = Awaited<ReturnType<typeof createPluginsAndMacroSession>>;

export const createPluginsAndMacroSession = async (events: TypeEmitter<WorldEvents>, settings: ReactiveSessionVariables, openBW: OpenBW) => {

    const macrosComposer = createMacrosComposer(settings);

    const create = async () => {

        const session = await createPluginSession(openBW);

        session.nativePlugins.externalHookListener = (...args) => macrosComposer.macros.callFromHook(...args);

        macrosComposer.macros.getPluginProperty = session.reactiveApi.getRawValue;
        macrosComposer.macros.doPluginAction = (action) => {
            const result = session.reactiveApi.mutate(action);
            if (result) {
                session.uiPlugins.sendMessage({
                    type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                    payload: result
                });
            }
        };

        return session;

    }

    let _session = await create();

    events.on("completed-upgrade", (upgrade) => _session.nativePlugins.callHook(HOOK_ON_UPGRADE_COMPLETED, upgrade));
    events.on("completed-tech", (tech) => _session.nativePlugins.callHook(HOOK_ON_TECH_COMPLETED, tech));
    events.on("unit-created", (unit) => _session.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit));
    events.on("unit-killed", (unit) => _session.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit));
    events.on("selected-units-changed", units => {
        _session.nativePlugins.callHook(HOOK_ON_UNITS_SELECTED, units);
        _session.uiPlugins.onUnitsSelected(units);
    })
    events.on("frame-reset", () =>
        _session.nativePlugins.callHook(HOOK_ON_FRAME_RESET));


    return {
        activate(gameTimeApi: GameTimeApi, sessionApi: ReactiveSessionVariables) {


            // macros unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            macrosComposer.setContainer(
                mix({
                    plugins: _session.reactiveApi.pluginVars,
                    settings: sessionApi.sessionVars
                },
                    gameTimeApi));

            this.native.injectApi(
                mix({
                    settings: sessionApi.sessionVars
                }, gameTimeApi));

        },
        get native() {
            return _session.nativePlugins;
        },
        get ui() {
            return _session.uiPlugins;
        },
        dispose() {
            macrosComposer.dispose();
            _session.dispose();
        },
        async reload() {
            await (settingsStore().load());
            _session.dispose();
            _session = await create();
        }
    }
}