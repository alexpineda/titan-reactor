import { GameTimeApi } from "./game-time-api";
import { ReactiveSessionVariables } from "./reactive-session-variables";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { HOOK_ON_FRAME_RESET, HOOK_ON_PLUGINS_DISPOSED, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED } from "@plugins/hooks";
import { createPluginSession } from "./create-plugin-session";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";
import settingsStore from "@stores/settings-store";
import { OpenBW } from "common/types";

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

    events.on("dispose", () => {
        _session.nativePlugins.callHook(HOOK_ON_PLUGINS_DISPOSED);
        macrosComposer.dispose();
        _session.dispose();
        _undoInject();
    });

    let _undoInject = () => { };

    return {
        activate(gameTimeApi: GameTimeApi, sessionApi: ReactiveSessionVariables, events: TypeEmitter<WorldEvents>) {

            _undoInject();

            // macros unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            macrosComposer.setContainer(
                mix({
                    api: borrow(gameTimeApi),
                    plugins: borrow(_session.reactiveApi.pluginVars),
                    settings: borrow(sessionApi.sessionVars),
                    events
                }));

            _undoInject = this.native.injectApi(
                mix({
                    settings: sessionApi.sessionVars,
                    events
                }, gameTimeApi));

        },
        get native() {
            return _session.nativePlugins;
        },
        get ui() {
            return _session.uiPlugins;
        },
        async reload() {
            _undoInject();
            await (settingsStore().load());
            _session.dispose();
            _session = await create();
        }
    }
}