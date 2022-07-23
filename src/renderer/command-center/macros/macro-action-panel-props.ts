import { PluginMetaData } from "common/types";
import { MacroAction } from "../macros";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    updateMacroAction: (action: MacroAction) => void;
    pluginsMetadata: PluginMetaData[];
};