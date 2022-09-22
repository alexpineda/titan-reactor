import { settingsStore } from "@stores/settings-store";
import { getMacroActionOrConditionLevaConfig } from "common/sanitize-macros";
import {
  MacroConditionAppSetting,
  MacroConditionComparator,
} from "common/types";
import ErrorBoundary from "../../error-boundary";
import { SessionSettingsDropDown } from "../app-settings-dropdown";
import { MacroConditionComparatorSelector } from "./macro-condition-comparator-selector";
import { MacroConditionModifyValue } from "./macro-condition-modify-value";
import { MacroConditionPanelProps } from "./macro-condition-panel";

export const MacroConditionPanelHost = (
  props: MacroConditionPanelProps & { condition: MacroConditionAppSetting }
) => {
  const settings = settingsStore();
  const { condition, viewOnly, updateMacroCondition } = props;
  const levaConfig = getMacroActionOrConditionLevaConfig(condition, settings);

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
            field: evt.target.value.split("."),
            comparator: MacroConditionComparator.Equals,
            value: undefined,
          });
        }}
        value={condition.field.join(".")}
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
          {levaConfig.displayValue}
        </p>
      )}

      {!viewOnly && condition.value !== undefined && levaConfig !== undefined && (
        <ErrorBoundary message="Error with modifier">
          <MacroConditionModifyValue {...props} config={levaConfig} />
        </ErrorBoundary>
      )}
    </div>
  );
};
