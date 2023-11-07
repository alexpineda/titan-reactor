import { ConditionComparator, Operator } from "common/types";
import { ActionableOpsSelector } from "./actionable-ops-selector";
import { ActionableEditValue } from "./actionable-edit-value";
import { ActionablePanelProps } from "./actionable-pane-props";
import ErrorBoundary from "../../error-boundary";
import { useStore } from "zustand";

export const ActionableTargetPlugin = ( props: ActionablePanelProps ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useStore(window.deps.useMacroStore);
    const { action, pluginsMetadata, macro } = props;

    const pluginName = action.path[1];
    const fieldKey = action.path.slice( 2 )[0];

    const plugin = pluginsMetadata.find( ( p ) => p.name === pluginName );

    if ( !plugin ) {
        throw new Error( `This action has either no plugin configuration or an invalid plugin
              configuration. It could be that the plugin is
              disabled.` );
    }

    const field = plugin.config?.[fieldKey];

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto auto",
                    gridGap: "var(--size-3)",
                    alignItems: "center",
                    justifyContent: "start",
                }}>
                <label>
                    Plugin{" "}
                    <select
                        onChange={( evt ) => {
                            if ( action.type === "action" ) {
                                updateActionable( macro, {
                                    ...action,
                                    path: [":plugin", evt.target.value],
                                    value: undefined,
                                    operator: Operator.SetToDefault,
                                } );
                            } else {
                                updateActionable( macro, {
                                    ...action,
                                    path: [":plugin", evt.target.value],
                                    value: undefined,
                                    comparator: ConditionComparator.Equals,
                                } );
                            }
                        }}
                        value={pluginName}>
                        {pluginsMetadata.map( ( pluginMetadata ) => (
                            <option
                                key={pluginMetadata.name}
                                value={pluginMetadata.name}>
                                {pluginMetadata.description ?? pluginMetadata.name}
                            </option>
                        ) )}
                    </select>
                </label>
                <label>
                    Field{" "}
                    <select
                        onChange={( evt ) => {
                            if ( action.type === "action" ) {
                                updateActionable( macro, {
                                    ...action,
                                    path: [":plugin", pluginName, evt.target.value],
                                    value: undefined,
                                    operator: Operator.SetToDefault,
                                } );
                            } else {
                                updateActionable( macro, {
                                    ...action,
                                    path: [":plugin", pluginName, evt.target.value],
                                    value: undefined,
                                    comparator: ConditionComparator.Equals,
                                } );
                            }
                        }}
                        value={fieldKey}>
                        {plugin.config &&
                            Object.keys( plugin.config )
                                .filter( ( k ) => k !== "system" )
                                .map( ( key ) => {
                                    const field =
                                        plugin.config![key as keyof typeof plugin];
                                    return (
                                        <option key={key} value={key}>
                                            {field.label ?? key}
                                        </option>
                                    );
                                } )}
                    </select>
                </label>
                <ErrorBoundary message="Error with effects">
                    <ActionableOpsSelector {...props} />
                </ErrorBoundary>
            </div>
            {( action.type === "condition" || action.operator === Operator.Set ) &&
                action.value !== undefined && field && (
                    <div style={{ margin: "var(--size-2)" }}>
                        <ErrorBoundary message="Error with modifier">
                            <ActionableEditValue
                                {...props}
                                config={field}
                                action={action}
                                key={action.path.join( "." )}
                            />
                        </ErrorBoundary>
                    </div>
                )}
        </>
    );
};
