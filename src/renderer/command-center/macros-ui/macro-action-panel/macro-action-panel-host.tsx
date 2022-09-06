import settingsStore from "@stores/settings-store";
import { getMacroActionOrConditionLevaConfig } from "common/sanitize-macros";
import { MacroActionEffect, MacroActionHostModifyValue } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { AppSettingsDropDown } from "../app-settings-dropdown";
import { MacroActionEffectSelector } from "./macro-action-effect-selector";
import { MacroActionModifyValue } from "./macro-action-modify-value";
import { MacroActionPanelProps } from "./macro-action-panel-props";

export const MacroActionPanelHost = (
  props: MacroActionPanelProps & { action: MacroActionHostModifyValue }
) => {
  const settings = settingsStore();
  const { action, viewOnly, updateMacroAction } = props;
  const levaConfig = getMacroActionOrConditionLevaConfig(action, settings);

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
      <AppSettingsDropDown
        onChange={(evt) => {
          updateMacroAction({
            ...action,
            field: evt.target.value.split("."),
            effect: MacroActionEffect.SetToDefault,
            value: undefined,
          });
        }}
        value={action.field.join(".")}
        disabled={viewOnly}
      />
      <ErrorBoundary message="Error with effects">
        <MacroActionEffectSelector {...props} />
      </ErrorBoundary>
      {viewOnly && action.effect === MacroActionEffect.Set && (
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

      {(action.effect === MacroActionEffect.Set ||
        action.effect === MacroActionEffect.Toggle) &&
        !viewOnly &&
        action.value !== undefined &&
        levaConfig !== undefined && (
          <ErrorBoundary message="Error with modifier">
            <MacroActionModifyValue {...props} config={levaConfig} />
          </ErrorBoundary>
        )}
    </div>
  );
};
