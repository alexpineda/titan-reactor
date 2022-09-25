import { GameTimeApi } from "./game-time-api";
import { SettingsSessionStore } from "./settings-session-store";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { HOOK_ON_FRAME_RESET, HOOK_ON_PLUGINS_DISPOSED, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED } from "@plugins/hooks";
import { createPluginSession } from "./create-plugin-session";
import { settingsStore } from "@stores/settings-store";
import { OpenBW } from "common/types";

export type PluginsAndMacroSession = Awaited<ReturnType<typeof createPluginsAndMacroSession>>;

export const createPluginsAndMacroSession = async (events: TypeEmitter<WorldEvents>, settings: SettingsSessionStore, openBW: OpenBW) => {

    const macrosComposer = createMacrosComposer(events, settings);

    const create = async () => {

        const pluginSession = await createPluginSession(openBW);

        pluginSession.nativePlugins.externalHookListener = (...args) => macrosComposer.macros.callFromHook(...args);

        macrosComposer.macros.targets.setHandler(":plugin", {
            action: (action) => pluginSession.store.operate(action, path => path.slice(1)),
            getValue: (path) => pluginSession.store.getValue(path),
        });

        return pluginSession;

    }

    let _pluginSession = await create();

    events.on("completed-upgrade", (upgrade) => _pluginSession.nativePlugins.callHook(HOOK_ON_UPGRADE_COMPLETED, upgrade));
    events.on("completed-tech", (tech) => _pluginSession.nativePlugins.callHook(HOOK_ON_TECH_COMPLETED, tech));
    events.on("unit-created", (unit) => _pluginSession.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit));
    events.on("unit-killed", (unit) => _pluginSession.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit));
    events.on("selected-units-changed", units => {
        _pluginSession.nativePlugins.callHook(HOOK_ON_UNITS_SELECTED, units);
        _pluginSession.uiPlugins.onUnitsSelected(units);
    })
    events.on("frame-reset", () =>
        _pluginSession.nativePlugins.callHook(HOOK_ON_FRAME_RESET));

    events.on("dispose", () => {
        _pluginSession.nativePlugins.callHook(HOOK_ON_PLUGINS_DISPOSED);
        macrosComposer.dispose();
        _pluginSession.dispose();
        _undoInject();
    });

    let _undoInject = () => { };

    return {
        activate(gameTimeApi: GameTimeApi, sessionSettings: SettingsSessionStore, events: TypeEmitter<WorldEvents>) {

            _undoInject();

            // macros unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            macrosComposer.setContainer(
                mix({
                    api: borrow(gameTimeApi),
                    plugins: borrow(_pluginSession.store.vars),
                    settings: borrow(sessionSettings.vars),
                    events
                }));

            _undoInject = this.native.injectApi(
                mix({
                    settings: sessionSettings.vars,
                    events
                }, gameTimeApi));

        },
        get native() {
            return _pluginSession.nativePlugins;
        },
        get ui() {
            return _pluginSession.uiPlugins;
        },
        async reload() {
            _undoInject();
            await (settingsStore().load());
            _pluginSession.dispose();
            _pluginSession = await create();
        }
    }
}