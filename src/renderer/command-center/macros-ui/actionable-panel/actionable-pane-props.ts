import { PluginMetaData, Actionable, MacroDTO } from "common/types";

export type ActionablePanelProps = {
    macro: MacroDTO,
    action: Actionable;
    pluginsMetadata: PluginMetaData[];
};