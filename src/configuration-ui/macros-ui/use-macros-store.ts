import { createMacroStore } from "./macros-store";

export const useMacroStore = createMacroStore();

//todo: why are we doing this again? i'd rather it not be here at all
// window.deps.useSettingsStore.subscribe( ( settings ) => {
//     useMacroStore.setState( ( state ) => {
//         state.macros = settings.data.macros;
//     } );
// } );
