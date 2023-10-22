import { sendWindow, SendWindowActionType } from "../ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { createMacroStore } from "./macros-store";

export const useMacroStore = createMacroStore( ( payload ) => {
    sendWindow( InvokeBrowserTarget.Game, {
        type: SendWindowActionType.CommitSettings,
        payload,
    } );
} );

useSettingsStore.subscribe( ( settings ) => {
    useMacroStore.setState( ( state ) => {
        state.macros = settings.data.macros;
    } );
} );
