import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
    ConditionComparator,
    MacroAction,
    MacroCondition,
    Operator,
} from "common/types";
import { ActionablePanelProps } from "./actionable-pane-props";
import { SettingsStore  } from "@stores";
import {
    getAvailableOperationsForAction,
    getMacroConditionValidComparators,
} from "common/macros/sanitize-macros";
import { useMacroStore } from "../use-macros-store";
import { useSettingsStore } from "@stores/settings-store";

const getValidOps = ( action: MacroAction | MacroCondition, settings: SettingsStore ) => {
    return action.type === "action"
        ? getAvailableOperationsForAction( action, settings )
        : getMacroConditionValidComparators( action, settings );
};

export const ActionableOpsSelector = ( { action, macro }: ActionablePanelProps ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useMacroStore();
    const settings = useSettingsStore();
    const validInstructions = getValidOps( action, settings );

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
