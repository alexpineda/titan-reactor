import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { ReactiveSessionVariables } from "./reactive-session-variables";
import Janitor from "@utils/janitor";
import { createCompartment } from "@utils/ses-util";

export type MacrosComposer = ReturnType<typeof createMacrosComposer>;

export const createMacrosComposer = (sessionApi: ReactiveSessionVariables) => {

    const janitor = new Janitor();

    const macros = new Macros(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos());

    macros.doSessionAction = sessionApi.doAction;
    macros.getSessionProperty = sessionApi.getRawValue;

    janitor.on(ipcRenderer, SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => {
        macros.execMacroById(macroId);
    });

    // a macro was triggered manually or via web server
    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
        type: SendWindowActionType.ManualMacroTrigger,
        payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
    }) => {
        if (type === SendWindowActionType.ManualMacroTrigger) {
            macros.execMacroById(payload);
        }
    });

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