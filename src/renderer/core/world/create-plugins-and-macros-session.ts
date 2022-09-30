import { GameTimeApi } from "./game-time-api";
import { SettingsSessionStore } from "./settings-session-store";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world-events";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import { HOOK_ON_FRAME_RESET, HOOK_ON_PLUGINS_DISPOSED, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED } from "@plugins/hooks";
import { createPluginSession } from "./create-plugin-session";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { OpenBW } from "common/types";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { Janitor } from "three-janitor";

export type PluginsAndMacroSession = Awaited<ReturnType<typeof createPluginsAndMacroSession>>;

export const createPluginsAndMacroSession = async (_events: TypeEmitter<WorldEvents>, settings: SettingsSessionStore, openBW: OpenBW) => {

    const macrosComposer = createMacrosComposer(_events, settings);

    const macrosProxy = new TypeEmitterProxy(_events);

    const hookMacrosToWorldEvents = () => {

        macrosProxy.dispose();

        for (const macro of macrosComposer.macros.meta.hookMacros) {

            macrosProxy.on((macro.trigger as WorldEventTrigger).eventName as keyof WorldEvents, (...args: any[]) => {
                macrosComposer.macros.execMacroById(macro.id, args);
            });

        }

    }

    const create = async () => {

        const eventsProxy = new TypeEmitterProxy(_events);
        const pluginSession = await createPluginSession(openBW);

        macrosComposer.macros.targets.setHandler(":plugin", {
            action: (action) => pluginSession.store.operate(action, path => path.slice(1)),
            getValue: (path) => pluginSession.store.getValue(path.slice(1)),
        });

        hookMacrosToWorldEvents();

        eventsProxy.on("completed-upgrade", (upgrade) => pluginSession.nativePlugins.callHook(HOOK_ON_UPGRADE_COMPLETED, upgrade));
        eventsProxy.on("completed-tech", (tech) => pluginSession.nativePlugins.callHook(HOOK_ON_TECH_COMPLETED, tech));
        eventsProxy.on("unit-created", (unit) => pluginSession.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit));
        eventsProxy.on("unit-killed", (unit) => pluginSession.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit));
        eventsProxy.on("selected-units-changed", units => {
            pluginSession.nativePlugins.callHook(HOOK_ON_UNITS_SELECTED, units);
            pluginSession.uiPlugins.onUnitsSelected(units);
        })
        eventsProxy.on("frame-reset", () =>
            pluginSession.nativePlugins.callHook(HOOK_ON_FRAME_RESET));

        eventsProxy.on("dispose", () => {
            pluginSession.nativePlugins.callHook(HOOK_ON_PLUGINS_DISPOSED);
            janitor.dispose();
            macrosComposer.dispose();
        });

        return {
            pluginSession, dispose() {
                eventsProxy.dispose();
                macrosProxy.dispose();
                pluginSession.dispose();
            }
        }

    }

    const janitor = new Janitor("PluginsAndMacroSession");
    janitor.mop(useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macrosComposer.macros.revision) {

            macrosComposer.macros.deserialize(settings.data.macros);

            hookMacrosToWorldEvents();

        }

    }), "useSettingsStore.subscribe");

    const { pluginSession } = janitor.mop(await create());
    let _pluginSession = pluginSession;

    return {
        activate(gameTimeApi: GameTimeApi, sessionSettings: SettingsSessionStore, events: TypeEmitter<WorldEvents>) {

            // macros unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            macrosComposer.setContainer(
                mix({
                    api: borrow(gameTimeApi),
                    plugins: borrow(_pluginSession.store.vars),
                    settings: borrow(sessionSettings.vars),
                    events
                }));

            janitor.mop(this.native.injectApi(
                mix({
                    settings: sessionSettings.vars,
                    events
                }, gameTimeApi)), "native.injectApi");

        },
        get native() {
            return _pluginSession.nativePlugins;
        },
        get ui() {
            return _pluginSession.uiPlugins;
        },
        async reload() {
            await (settingsStore().load());
            janitor.dispose();
            const { pluginSession } = janitor.mop(await create());
            _pluginSession = pluginSession;
        }
    }
}