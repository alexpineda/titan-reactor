import { PluginMetaData, Actionable, MacroDTO } from "common/types";

export type MacroActionPanelProps = {
    macro: MacroDTO,
    action: Actionable;
    viewOnly: boolean;
    pluginsMetadata: PluginMetaData[];
};