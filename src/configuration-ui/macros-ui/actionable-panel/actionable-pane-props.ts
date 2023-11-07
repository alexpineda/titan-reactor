import { PluginMetaData, Actionable, MacroDTO } from "common/types";

export interface ActionablePanelProps {
    macro: MacroDTO;
    action: Actionable;
    pluginsMetadata: PluginMetaData[];
}
