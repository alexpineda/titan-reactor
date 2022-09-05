import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroCondition, PluginMetaData } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { MacroConditionPanelHost } from "./macro-condition-panel-host";

export type MacroConditionPanelProps = {
  condition: MacroCondition;
  viewOnly: boolean;
  updateMacroCondition: (action: MacroCondition) => void;
  pluginsMetadata: PluginMetaData[];
};

export const MacroConditionPanel = (
  props: MacroConditionPanelProps & {
    setActiveCondition: (id: string) => void;
    deleteCondition: (id: string) => void;
  }
) => {
  const { condition, deleteCondition, setActiveCondition, viewOnly } = props;

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
            {condition.type === "FunctionCondition"
              ? "code"
              : condition.type === "AppSettingsCondition"
              ? "settings_applications"
              : "extension"}
          </i>
          <span>{spaceOutCapitalLetters(condition.type)}</span>
        </span>
        <button
          onClick={() => setActiveCondition(condition.id)}
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
          onClick={() => deleteCondition(condition.id)}
        >
          <i
            className="material-icons small"
            style={{ fontSize: "var(--font-size-2)" }}
          >
            delete
          </i>
        </button>
      </div>

      {condition.error && (
        <p style={{ color: "var(--red-6)" }}>
          {" "}
          - {condition.error.type}: {condition.error.message}
        </p>
      )}
      <ErrorBoundary
        message="There was an error with this action"
        key={condition.id}
      >
        {condition.type === "AppSettingsCondition" && (
          <MacroConditionPanelHost {...props} condition={condition} />
        )}
      </ErrorBoundary>
    </div>
  );
};
