import settingsStore from "@stores/settings-store";
import {
  getAppSettingsLevaConfig,
  getAppSettingsLevaConfigField,
} from "common/get-app-settings-leva-config";
import { MacroActionEffect, MacroActionHostModifyValue } from "common/types";
import ErrorBoundary from "../../error-boundary";
import { MacroActionEffectSelector } from "../macro-action-effect-selector";
import { MacroActionModifyValue } from "../macro-action-modify-value";
import { MacroActionPanelProps } from "../macro-action-panel-props";

export const MacroActionPanelHost = (
  props: MacroActionPanelProps & { action: MacroActionHostModifyValue }
) => {
  const settings = settingsStore();
  const { action, viewOnly, updateMacroAction } = props;
  const config = getAppSettingsLevaConfig(settings);
  const propConfig = {
    ...getAppSettingsLevaConfigField(settings, action.field),
    value: action.value,
  };

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
      <select
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
      >
        {Object.keys(config).map((key) => {
          const field = config[key as keyof typeof config];
          const val = [field.path, key].join(".");
          return (
            <option key={val} value={val}>
              {field.folder} &gt; {field.label}
            </option>
          );
        })}
      </select>
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
          {action.value}
        </p>
      )}

      {(action.effect === MacroActionEffect.Set ||
        action.effect === MacroActionEffect.Toggle) &&
        !viewOnly &&
        action.value !== undefined &&
        propConfig !== undefined && (
          <ErrorBoundary message="Error with modifier">
            <MacroActionModifyValue {...props} config={propConfig} />
          </ErrorBoundary>
        )}
    </div>
  );
};
