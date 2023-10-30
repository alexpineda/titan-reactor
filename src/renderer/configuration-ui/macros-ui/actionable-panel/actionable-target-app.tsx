import { getAppFieldDefinition } from "common/macros/field-utilities";
import { ConditionComparator, Operator, TargetedPath } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { SessionSettingsDropDown } from "../app-settings-dropdown";
import { useMacroStore } from "../use-macros-store";
import { ActionableOpsSelector } from "./actionable-ops-selector";
import { ActionableEditValue } from "./actionable-edit-value";
import { ActionablePanelProps } from "./actionable-pane-props";
import { useStore } from "zustand";

export const ActionableTargetApp = ( props: ActionablePanelProps ) => {
    const settings = useStore( window.deps.useSettingsStore );
    const plugins = useStore( window.deps.usePluginsStore );
    const { action, macro } = props;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useMacroStore();

    const levaConfig = getAppFieldDefinition(
        settings.data,
        plugins.enabledPlugins,
        action.path as TargetedPath<":app">
    );

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto auto auto auto",
                gridGap: "var(--size-3)",
                alignItems: "center",
                justifyContent: "start",
            }}>
            <SessionSettingsDropDown
                onChange={( evt ) => {
                    if ( action.type === "action" ) {
                        updateActionable( macro, {
                            ...action,
                            path: [ ":app", ...evt.target.value.split( "." ) ],
                            operator: Operator.SetToDefault,
                            value: undefined,
                        } );
                    } else {
                        updateActionable( macro, {
                            ...action,
                            path: [ ":app", ...evt.target.value.split( "." ) ],
                            comparator: ConditionComparator.Equals,
                            value: undefined,
                        } );
                    }
                }}
                value={action.path.slice( 1 ).join( "." )}
                onlyConditional={action.type === "condition"}
            />
            <ErrorBoundary message="Error with effects">
                <ActionableOpsSelector {...props} />
            </ErrorBoundary>

            {levaConfig !== null &&
                action.value !== undefined &&
                ( ( action.type === "action" && action.operator === Operator.Set ) ||
                    action.type === "condition" ) && (
                    <ErrorBoundary message="Error with modifier">
                        <ActionableEditValue
                            {...props}
                            config={{ ...levaConfig, value: action.value }}
                            key={action.path.join( "." )}
                        />
                    </ErrorBoundary>
                )}
        </div>
    );
};
