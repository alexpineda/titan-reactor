import { spaceOutCapitalLetters } from "@utils/string-utils";
import ErrorBoundary from "../../error-boundary";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { MacroActionPanelGameTimeApi } from "./macro-action-panel-game-time-api";
import { MacroActionPanelHost } from "./macro-action-panel-host";
import { MacroActionPanelPlugin } from "./macro-action-panel-plugin";
import { useMacroStore } from "../macros-store";

export const MacroActionPanel = (
  props: MacroActionPanelProps & {
    setActiveAction: (actionId: string) => void;
  }
) => {
  const { deleteAction } = useMacroStore();
  const { action, setActiveAction, viewOnly } = props;

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
          onClick={() => deleteAction(action.id)}
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
          <MacroActionPanelHost {...props} action={action} />
        )}
        {action.path[0] === ":function" && (
          <MacroActionPanelGameTimeApi {...props} action={action} />
        )}
        {action.path[0] === ":plugin" && (
          <MacroActionPanelPlugin {...props} action={action} />
        )}
      </ErrorBoundary>
    </div>
  );
};
