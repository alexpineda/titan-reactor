import { settingsStore } from "@stores/settings-store";
import { getAppSettingsPropertyInLevaFormat } from "common/get-app-settings-leva-config";
import { getFieldDefinitionDisplayValue } from "common/macros/field-utilities";
import { ConditionComparator, MacroCondition } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { SessionSettingsDropDown } from "../app-settings-dropdown";
import { MacroConditionComparatorSelector } from "./macro-condition-comparator-selector";
import { MacroConditionModifyValue } from "./macro-condition-modify-value";
import { MacroConditionPanelProps } from "./macro-condition-panel";

export const MacroConditionPanelHost = (
  props: MacroConditionPanelProps & { condition: MacroCondition }
) => {
  const settings = settingsStore();
  const { condition, viewOnly, updateMacroCondition } = props;
  const levaConfig = getAppSettingsPropertyInLevaFormat(
    settings.data,
    settings.enabledPlugins,
    condition.path
  );

  const displayValue = getFieldDefinitionDisplayValue(
    levaConfig?.options,
    condition.value
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
          updateMacroCondition({
            ...condition,
            path: [":app", ...evt.target.value.split(".")],
            comparator: ConditionComparator.Equals,
            value: undefined,
          });
        }}
        value={condition.path.join(".")}
        disabled={viewOnly}
      />
      <ErrorBoundary message="Error with comparators">
        <MacroConditionComparatorSelector {...props} />
      </ErrorBoundary>
      {viewOnly && (
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

      {!viewOnly && condition.value !== undefined && levaConfig !== undefined && (
        <ErrorBoundary message="Error with modifier">
          <MacroConditionModifyValue
            {...props}
            config={{ ...levaConfig, value: condition.value }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
