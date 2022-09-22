import { PluginMetaData, MacroAction, MutateActionEffect, MacroActionHostModifyValue, MacroActionPluginModifyValue } from "common/types";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    updateMacroAction: (action: MacroAction) => void;
    updateMacroActionEffect: (action: MacroActionHostModifyValue | MacroActionPluginModifyValue, effect: MutateActionEffect) => void;
    pluginsMetadata: PluginMetaData[];
};