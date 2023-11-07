import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
    ConditionComparator,
    MacroAction,
    MacroCondition,
    Operator,
    PluginMetaData,
    Settings,
} from "common/types";
import { ActionablePanelProps } from "./actionable-pane-props";
import {
    getAvailableOperationsForAction,
    getMacroConditionValidComparators,
} from "common/macros/sanitize-macros";
import { useStore } from "zustand";

const getValidOps = ( action: MacroAction | MacroCondition, settings: Settings, plugins: PluginMetaData[] ) => {
    return action.type === "action"
        ? getAvailableOperationsForAction( action, settings, plugins )
        : getMacroConditionValidComparators( action, settings, plugins );
};

export const ActionableOpsSelector = ( { action, macro }: ActionablePanelProps ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useStore(window.deps.useMacroStore);
    const settings = useStore( window.deps.useSettingsStore );
    const plugins = useStore( window.deps.usePluginsStore );
    const validInstructions = getValidOps( action, settings.data, plugins.enabledPlugins );

    return (
        <select
            onChange={( evt ) => {
                if ( action.type === "action" ) {
                    updateActionable( macro, {
                        ...action,
                        operator: evt.target.value as Operator,
                    } );
                } else {
                    updateActionable( macro, {
                        ...action,
                        comparator:
                            ConditionComparator[
                                evt.target.value as keyof typeof ConditionComparator
                            ],
                    } );
                }
            }}
            value={action.type === "action" ? action.operator : action.comparator}>
            {validInstructions.map( ( key ) => (
                <option key={key} value={key}>
                    {spaceOutCapitalLetters( key )}
                </option>
            ) )}
        </select>
    );
};
