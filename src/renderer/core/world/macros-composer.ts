import { Macros } from "@macros";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { SettingsSessionStore } from "./settings-session-store";
import { Janitor } from "three-janitor";
import { createCompartment } from "@utils/ses-util";
import { globalEvents } from "../global-events";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";
import { TargetComposer } from "./target-composer";
import { log } from "@ipc/log";

export type MacrosComposer = ReturnType<typeof createMacrosComposer>;

export const createMacrosComposer = (events: TypeEmitter<WorldEvents>, settings: SettingsSessionStore) => {

    const janitor = new Janitor("MacrosComposer");

    const targets = new TargetComposer();

    targets.setHandler(":app", {
        action: (path) => settings.operate(path, path => path.slice(1)),
        getValue: (path) => settings.getValue(path),
    });

    const macros = new Macros(targets, settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos(), "listenForKeyCombos");

    janitor.mop(globalEvents.on("exec-macro", (macroId) => {
        macros.execMacroById(macroId);
    }), "exec-macro");

    janitor.mop(useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

    }), "useSettingsStore.subscribe");


    janitor.mop(events.on("mouse-click", (button) => {
        macros.mouseTrigger(button);
    }), "mouse-click");

    return {
        macros,
        setContainer(api: any) {

            const container = createCompartment(api);

            targets.setHandler(":function", {
                action: (action, context) => {
                    container.globalThis.context = context;

                    try {
                        container.globalThis.Function(action.value)();
                    } catch (e) {
                        log.error(`Error executing macro action: ${e}`);
                    }
                },
                getValue: ([value], context) => {
                    container.globalThis.context = context;
                    try {
                        return container.globalThis.Function(value)();
                    } catch (e) {
                        log.error(`Error executing macro condition: ${e}`);
                        return;
                    }
                }
            });


        },
        dispose() {
            janitor.dispose();
        }
    }
}