import { PluginMetaData, MacroAction, MutationInstruction, MacroActionHostModifyValue, MacroActionPluginModifyValue } from "common/types";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    updateMacroAction: (action: MacroAction) => void;
    updateMacroActionEffect: (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, effect: MutationInstruction) => void;
    pluginsMetadata: PluginMetaData[];
};