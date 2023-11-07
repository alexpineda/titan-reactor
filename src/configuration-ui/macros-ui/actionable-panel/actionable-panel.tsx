import ErrorBoundary from "../../error-boundary";
import { ActionablePanelProps } from "./actionable-pane-props";
import { ActionableTargetFunction } from "./actionable-target-function";
import { ActionableTargetApp } from "./actionable-target-app";
import { ActionableTargetPlugin } from "./actionable-target-plugin";
import { MacroAction, TargetType } from "common/types";
import { ActionableTargetMacro } from "./actionable-target-macro";
import { useStore } from "zustand";

const isMacroAction = ( action: object ): action is MacroAction => {
    return "group" in action;
};

export const ActionablePanel = ( props: ActionablePanelProps & { index: number } ) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { deleteActionable, updateActionable, reOrderAction } = useStore(window.deps.useMacroStore);
    const { action, macro, index } = props;

    return (
        <div
            className="hover"
            style={{
                margin: "var(--size-2)",
                order: isMacroAction( action ) ? ( action.group ?? 0 ) * 100 + index : 0,
            }}>
            <div
                style={{
                    padding: "var(--size-2)",
                }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "var(--size-1)",
                    }}>
                    <span
                        style={{
                            fontWeight: 500,
                            gap: "var(--size-3)",
                            display: "flex",
                            alignItems: "center",
                        }}>
                        <i
                            className="material-icons"
                            style={{ fontSize: "var(--font-size-3)" }}>
                            {action.path[0] === ":function"
                                ? "code"
                                : action.path[0] === ":app"
                                ? "settings_applications"
                                : "extension"}
                        </i>

                        <select
                            onChange={( evt ) => {
                                updateActionable( macro, {
                                    ...action,
                                    path: [ evt.target.value as TargetType ],
                                } );
                            }}
                            value={action.path[0]}>
                            <option value=":app">App</option>
                            <option value=":plugin">Plugin</option>
                            <option value=":macro">Macro</option>
                            <option value=":function">Function</option>
                        </select>
                    </span>
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                        {isMacroAction( action ) && (
                            <>
                                <i
                                    style={{ cursor: "pointer" }}
                                    className="material-icons"
                                    onClick={() =>
                                        reOrderAction(
                                            macro.id,
                                            action.id,
                                            action.group!,
                                            -1
                                        )
                                    }>
                                    arrow_upward
                                </i>
                                <i
                                    style={{ cursor: "pointer" }}
                                    className="material-icons"
                                    onClick={() =>
                                        reOrderAction(
                                            macro.id,
                                            action.id,
                                            action.group!,
                                            1
                                        )
                                    }>
                                    arrow_downward
                                </i>
                            </>
                        )}

                        <button
                            style={{
                                justifySelf: "end",
                                color: "var(--red-4)",
                                fontSize: "var(--font-size-00)",
                            }}
                            onClick={() => {
                                deleteActionable( macro, action );
                            }}>
                            <i
                                className="material-icons small"
                                style={{ fontSize: "var(--font-size-2)" }}>
                                delete
                            </i>
                        </button>
                    </span>
                </div>

                {action.error && (
                    <p style={{ color: "var(--red-6)" }}>
                        {" "}
                        - {action.error.type}: {action.error.message}
                    </p>
                )}
                <ErrorBoundary
                    message="There was an error with this action"
                    key={action.id}>
                    {action.path[0] === ":app" && (
                        <ActionableTargetApp {...props} action={action} />
                    )}
                    {action.path[0] === ":function" && (
                        <ActionableTargetFunction {...props} action={action} />
                    )}
                    {action.path[0] === ":plugin" && (
                        <ActionableTargetPlugin {...props} action={action} />
                    )}
                    {action.path[0] === ":macro" && (
                        <ActionableTargetMacro {...props} action={action} />
                    )}
                </ErrorBoundary>
            </div>
        </div>
    );
};
