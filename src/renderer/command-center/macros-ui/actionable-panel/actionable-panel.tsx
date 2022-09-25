import { spaceOutCapitalLetters } from "@utils/string-utils";
import ErrorBoundary from "../../error-boundary";
import { ActionablePanelProps } from "./actionable-pane-props";
import { ActionableTargetFunction } from "./actionable-target-function";
import { ActionableTargetApp } from "./actionable-target-app";
import { ActionableTargetPlugin } from "./actionable-target-plugin";
import { useMacroStore } from "../use-macros-store";
import { TargetType } from "common/types";

export const ActionablePanel = (
  props: ActionablePanelProps & {
    setActiveAction: (actionId: string) => void;
  }
) => {
  const { deleteActionable, updateActionable } = useMacroStore();
  const { action, setActiveAction, viewOnly, macro } = props;

  return (
    <div
      className="hover"
      style={{
        margin: "var(--size-6)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto 1fr",
          gridGap: "var(--size-3)",
          alignItems: "center",
          justifyContent: "start",
          marginBottom: "var(--size-1)",
        }}
      >
        <span
          style={{ fontWeight: 500, display: "flex", alignItems: "center" }}
        >
          <i
            className="material-icons"
            style={{ fontSize: "var(--font-size-3)" }}
          >
            {action.path[0] === ":function"
              ? "code"
              : action.path[0] === ":app"
              ? "settings_applications"
              : "extension"}
          </i>
          <select
            onChange={(evt) => {
              updateActionable(macro, {
                ...action,
                path: [evt.target.value as TargetType],
              });
            }}
          >
            <option value=":app">App</option>
            <option value=":plugin">Plugin</option>
            <option value=":function">Function</option>
          </select>
          <span>{spaceOutCapitalLetters(action.path[0].slice(1))}</span>
        </span>
        <button
          onClick={() => setActiveAction(action.id)}
          style={{
            padding: "var(--size-1)",
          }}
        >
          <i
            className="material-icons small"
            style={{
              fontSize: "var(--size-3)",
              color: viewOnly ? "inherit" : "var(--red-4)",
            }}
          >
            edit
          </i>
        </button>
        <button
          style={{
            justifySelf: "end",
            color: "var(--red-4)",
            fontSize: "var(--font-size-00)",
          }}
          onClick={() => {
            deleteActionable(macro, action);
          }}
        >
          <i
            className="material-icons small"
            style={{ fontSize: "var(--font-size-2)" }}
          >
            delete
          </i>
        </button>
      </div>

      {action.error && (
        <p style={{ color: "var(--red-6)" }}>
          {" "}
          - {action.error.type}: {action.error.message}
        </p>
      )}
      <ErrorBoundary
        message="There was an error with this action"
        key={action.id}
      >
        {action.path[0] === ":app" && (
          <ActionableTargetApp {...props} action={action} />
        )}
        {action.path[0] === ":function" && (
          <ActionableTargetFunction {...props} action={action} />
        )}
        {action.path[0] === ":plugin" && (
          <ActionableTargetPlugin {...props} action={action} />
        )}
      </ErrorBoundary>
    </div>
  );
};
