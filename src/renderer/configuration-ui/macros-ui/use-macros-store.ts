import { sendWindow } from "../send-window";
import { createMacroStore } from "./macros-store";
import { useSettingsStore } from "@stores/settings-store";

export const useMacroStore = createMacroStore( ( payload ) =>
    sendWindow( "command-center-save-settings", payload )
);

useSettingsStore.subscribe( ( settings ) => {
    useMacroStore.setState( ( state ) => {
        state.macros = settings.data.macros;
    } );
} );
