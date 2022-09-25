import { PluginMetaData, Actionable, MacroDTO } from "common/types";

export type ActionablePanelProps = {
    macro: MacroDTO,
    action: Actionable;
    viewOnly: boolean;
    pluginsMetadata: PluginMetaData[];
};