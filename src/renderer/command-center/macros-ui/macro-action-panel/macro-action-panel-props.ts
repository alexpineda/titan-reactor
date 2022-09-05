import { PluginMetaData, MacroAction } from "common/types";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    updateMacroAction: (action: MacroAction) => void;
    pluginsMetadata: PluginMetaData[];
};