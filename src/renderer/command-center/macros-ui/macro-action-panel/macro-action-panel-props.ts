import { PluginMetaData, MacroAction, Operator } from "common/types";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    updateMacroAction: (action: MacroAction) => void;
    updateMacroActionEffect: (action: MacroAction, effect: Operator) => void;
    pluginsMetadata: PluginMetaData[];
};