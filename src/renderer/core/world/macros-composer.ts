import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { ReactiveSessionVariables } from "./reactive-session-variables";
import Janitor from "@utils/janitor";
import { createCompartment } from "@utils/ses-util";
import { globalEvents } from "../../global";

export type MacrosComposer = ReturnType<typeof createMacrosComposer>;

export const createMacrosComposer = (settings: ReactiveSessionVariables) => {

    const janitor = new Janitor();

    const macros = new Macros(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos());

    macros.doSessionAction = settings.mutate;
    macros.getSessionProperty = settings.getRawValue;

    janitor.mop(globalEvents.on("exec-macro", (macroId) => {
        macros.execMacroById(macroId);
    }));

    janitor.mop(useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

    }));

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