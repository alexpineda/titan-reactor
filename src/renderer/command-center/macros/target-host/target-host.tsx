import settingsStore from "@stores/settings-store";
import {
  getAppSettingsLevaConfig,
  getAppSettingsLevaConfigField,
} from "../../global-settings";
import { MacroActionEffect, MacroActionHostModifyValue } from "../../macros";
import { MacroActionEffectSelector } from "../macro-action-effect-selector";
import { MacroActionModifyValue } from "../macro-action-modify-value";
import { MacroActionPanelProps } from "../macro-action-panel-props";

export const MacroActionPanelHost = (
  props: MacroActionPanelProps & { action: MacroActionHostModifyValue }
) => {
  const settings = settingsStore();
  const { action, viewOnly, updateMacroAction, pluginsMetadata } = props;
  const config = getAppSettingsLevaConfig(settings);

  const _propConfig = getAppSettingsLevaConfigField(settings, action.field);
  const propConfig =
    action.field[1] === "cameraController"
      ? {
          ..._propConfig,
          options: pluginsMetadata
            .filter((p) => p.isCameraController)
            .map((p) => p.name),
        }
      : _propConfig;

  return (
    <div>
      <select
        onChange={(evt) => {
          action.field = evt.target.value.split(".");
          updateMacroAction(action);
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
      <MacroActionEffectSelector {...props} />
      {(action.effect === MacroActionEffect.Set ||
        action.effect === MacroActionEffect.Toggle) &&
        !viewOnly && <MacroActionModifyValue {...props} config={propConfig} />}
    </div>
  );
};
