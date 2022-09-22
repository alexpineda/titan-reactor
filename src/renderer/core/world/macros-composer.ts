import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { ReactiveSessionVariables } from "./reactive-session-variables";
import { Janitor } from "three-janitor";
import { createCompartment } from "@utils/ses-util";
import { globalEvents } from "../global";
import { WorldEvents } from "./world";
import { TypeEmitter } from "@utils/type-emitter";

export type MacrosComposer = ReturnType<typeof createMacrosComposer>;

export const createMacrosComposer = (events: TypeEmitter<WorldEvents>, settings: ReactiveSessionVariables) => {

    const janitor = new Janitor("MacrosComposer");

    const macros = new Macros(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos(), "listenForKeyCombos");

    macros.doSessionAction = settings.mutate;
    macros.getSessionProperty = settings.getRawValue;

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
            macros.setCreateCompartment((context?: any) => {
                container.globalThis.context = context;
                return container;
            });
        },
        dispose() {
            janitor.dispose();
        }
    }
}