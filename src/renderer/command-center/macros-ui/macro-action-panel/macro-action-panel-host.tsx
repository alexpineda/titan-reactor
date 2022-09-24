import { settingsStore } from "@stores/settings-store";
import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { getFieldDefinitionDisplayValue } from "common/macros/field-utilities";
import { MacroAction, Operator } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { SessionSettingsDropDown } from "../app-settings-dropdown";
import { MacroActionEffectSelector } from "./macro-action-effect-selector";
import { MacroActionModifyValue } from "./macro-action-modify-value";
import { MacroActionPanelProps } from "./macro-action-panel-props";

export const MacroActionPanelHost = (
  props: MacroActionPanelProps & { action: MacroAction }
) => {
  const settings = settingsStore();
  const { action, viewOnly, updateMacroAction } = props;

  const levaConfig = getAppSettingsPropertyInLevaFormat(
    settings.data,
    settings.enabledPlugins,
    action.path
  );

  const displayValue = getFieldDefinitionDisplayValue(
    levaConfig?.options,
    action.value
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
          updateMacroAction({
            ...action,
            path: [":app", ...evt.target.value.split(".")],
            operator: Operator.SetToDefault,
            value: undefined,
          });
        }}
        value={action.path.join(".")}
        disabled={viewOnly}
      />
      <ErrorBoundary message="Error with effects">
        <MacroActionEffectSelector {...props} />
      </ErrorBoundary>
      {viewOnly && action.operator === Operator.Set && (
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

      {(action.operator === Operator.Set ||
        action.operator === Operator.Toggle) &&
        !viewOnly &&
        action.value !== undefined &&
        levaConfig !== undefined && (
          <ErrorBoundary message="Error with modifier">
            <MacroActionModifyValue
              {...props}
              config={{ ...levaConfig, value: action.value }}
            />
          </ErrorBoundary>
        )}
    </div>
  );
};
