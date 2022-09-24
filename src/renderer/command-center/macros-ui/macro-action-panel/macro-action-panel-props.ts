import { PluginMetaData, MacroAction } from "common/types";

export type MacroActionPanelProps = {
    action: MacroAction;
    viewOnly: boolean;
    pluginsMetadata: PluginMetaData[];
};