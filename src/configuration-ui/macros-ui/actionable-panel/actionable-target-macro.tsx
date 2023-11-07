import { ConditionComparator, Operator, TargetedPath } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { ActionableOpsSelector } from "./actionable-ops-selector";
import { ActionableEditValue } from "./actionable-edit-value";
import { ActionablePanelProps } from "./actionable-pane-props";
import { useStore } from "zustand";

export const ActionableTargetMacro = ( props: ActionablePanelProps ) => {
    const {
        macros: { macros },
    } = useStore(window.deps.useMacroStore);
    const { action, macro } = props;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useStore(window.deps.useMacroStore);

    const levaConfig = {
        enabled: {
            label: "Enabled",
        },
        program: {
            label: "Program",
        },
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "auto auto auto auto",
                gridGap: "var(--size-3)",
                alignItems: "center",
                justifyContent: "start",
            }}>
            <select
                onChange={( evt ) => {
                    if ( action.type === "action" ) {
                        updateActionable( macro, {
                            ...action,
                            path: [":macro", evt.target.value],
                            operator: Operator.Set,
                            value: true,
                        } );
                    } else {
                        updateActionable( macro, {
                            ...action,
                            path: [":macro", evt.target.value],
                            comparator: ConditionComparator.Equals,
                            value: true,
                        } );
                    }
                }}
                value={action.path[1]}>
                {macros.map( ( macro ) => {
                    return (
                        <option key={macro.id} value={macro.id}>
                            {macro.name}
                        </option>
                    );
                } )}
            </select>

            <select
                value={action.path[2]}
                onChange={( evt ) => {
                    updateActionable( macro, {
                        ...action,
                        path: [
                            ...( action.path.slice( 0, 2 ) as TargetedPath ),
                            evt.target.value,
                        ],
                    } );
                }}>
                <option value="enabled">Enabled</option>
                {action.type === "action" && <option value="program">Program</option>}
            </select>

            <ErrorBoundary message="Error with effects">
                <ActionableOpsSelector {...props} />
            </ErrorBoundary>

            {levaConfig &&
                levaConfig[action.path[2] as keyof typeof levaConfig] &&
                action.value !== undefined &&
                ( ( action.type === "action" && action.operator === Operator.Set ) ||
                    action.type === "condition" ) && (
                    <ErrorBoundary message="Error with modifier">
                        <ActionableEditValue
                            {...props}
                            config={{
                                ...levaConfig[
                                    action.path[2] as keyof typeof levaConfig
                                ],
                                value: action.value,
                            }}
                            key={action.path.join( "." )}
                        />
                    </ErrorBoundary>
                )}
        </div>
    );
};
