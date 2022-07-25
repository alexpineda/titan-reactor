import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroActionType } from "common/types";
import ErrorBoundary from "../error-boundary";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { MacroActionPanelGameTimeApi } from "./target-game-time-api/target-game-time-api";
import { MacroActionPanelHost } from "./target-host/target-host";
import { MacroActionPanelPlugin } from "./target-plugin/target-plugin";

export const MacroActionPanel = (
  props: MacroActionPanelProps & {
    setActiveAction: (actionId: string) => void;
    deleteAction: (actionId: string) => void;
  }
) => {
  const { action, setActiveAction, deleteAction } = props;

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
        <span style={{ fontWeight: 500 }}>
          Action: {spaceOutCapitalLetters(action.type)}
        </span>
        <button onClick={() => setActiveAction(action.id)}>
          <i className="material-icons small" style={{ fontSize: "1rem" }}>
            edit
          </i>
        </button>
        <button
          style={{
            justifySelf: "end",
            background: "var(--red-4)",
            color: "white",
            fontSize: "var(--font-size-00)",
          }}
          onClick={() => deleteAction(action.id)}
        >
          <i className="material-icons small" style={{ fontSize: "1rem" }}>
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
        {action.type === MacroActionType.ModifyAppSettings && (
          <MacroActionPanelHost {...props} action={action} />
        )}
        {action.type === MacroActionType.CallGameTimeApi && (
          <MacroActionPanelGameTimeApi {...props} action={action} />
        )}
        {action.type === MacroActionType.ModifyPluginSettings && (
          <MacroActionPanelPlugin {...props} action={action} />
        )}
      </ErrorBoundary>
    </div>
  );
};
