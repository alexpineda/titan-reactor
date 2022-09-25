import { settingsStore } from "@stores/settings-store";
import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { getFieldDefinitionDisplayValue } from "common/macros/field-utilities";
import { ConditionComparator, Operator } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { SessionSettingsDropDown } from "../app-settings-dropdown";
import { useMacroStore } from "../use-macros-store";
import { ActionableOpsSelector } from "./actionable-ops-selector";
import { ActionableEditValue } from "./actionable-edit-value";
import { ActionablePanelProps } from "./actionable-pane-props";

export const ActionableTargetApp = (props: ActionablePanelProps) => {
  const settings = settingsStore();
  const { action, viewOnly, macro } = props;
  const { updateActionable } = useMacroStore();

  const levaConfig = getAppSettingsPropertyInLevaFormat(
    settings.data,
    settings.enabledPlugins,
    action.path.slice(1)
  );

  const displayValue = getFieldDefinitionDisplayValue(
    levaConfig?.options,
    action.value
  );

  console.log(
    viewOnly === false,
    levaConfig !== undefined,
    action.value !== undefined,
    (action.type === "action" && action.operator === Operator.Set) ||
      action.type === "condition"
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto auto",
        gridGap: "var(--size-3)",
        alignItems: "center",
        justifyContent: "start",
      }}
    >
      <SessionSettingsDropDown
        onChange={(evt) => {
          if (action.type === "action") {
            updateActionable(macro, {
              ...action,
              path: [":app", ...evt.target.value.split(".")],
              operator: Operator.SetToDefault,
              value: undefined,
            });
          } else {
            updateActionable(macro, {
              ...action,
              path: [":app", ...evt.target.value.split(".")],
              comparator: ConditionComparator.Equals,
              value: undefined,
            });
          }
        }}
        value={action.path.join(".")}
        disabled={viewOnly}
      />
      <ErrorBoundary message="Error with effects">
        <ActionableOpsSelector {...props} />
      </ErrorBoundary>
      {viewOnly &&
        ((action.type === "action" && action.operator === Operator.Set) ||
          action.type === "condition") && (
          <p
            style={{
              background: "var(--green-0)",
              paddingBlock: "var(--size-2)",
              borderRadius: "var(--radius-2)",
              paddingInline: "var(--size-3)",
              color: "var(--green-9)",
            }}
          >
            {displayValue}
          </p>
        )}

      {viewOnly === false &&
        levaConfig !== undefined &&
        action.value !== undefined &&
        ((action.type === "action" && action.operator === Operator.Set) ||
          action.type === "condition") && (
          <ErrorBoundary message="Error with modifier">
            <ActionableEditValue
              {...props}
              config={{ ...levaConfig, value: action.value }}
            />
          </ErrorBoundary>
        )}
    </div>
  );
};
