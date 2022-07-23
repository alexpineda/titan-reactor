import {
  MacroActionEffect,
  MacroActionPluginModifyValue,
} from "../../../command-center/macros";
import { MacroActionEffectSelector } from "../macro-action-effect-selector";
import { MacroActionModifyValue } from "../macro-action-modify-value";
import { MacroActionPanelProps } from "../macro-action-panel-props";

export const MacroActionPanelPlugin = (
  props: MacroActionPanelProps & {
    action: MacroActionPluginModifyValue;
  }
) => {
  const { action, pluginsMetadata, updateMacroAction, viewOnly } = props;

  const plugin = pluginsMetadata.find((p) => p.name === action.pluginName);

  if (!plugin) {
    throw new Error(`This action has either no plugin configuration or an invalid plugin
              configuration. It could be that the plugin ${action.pluginName} is
              disabled.`);
  }

  return (
    <>
      <label>
        Plugin{" "}
        <select
          onChange={(evt) => {
            action.pluginName = evt.target.value;
            updateMacroAction(action);
          }}
          value={action.pluginName}
          disabled={viewOnly}
        >
          {pluginsMetadata.map((pluginMetadata) => (
            <option key={pluginMetadata.name} value={pluginMetadata.name}>
              {pluginMetadata.description ?? pluginMetadata.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Field{" "}
        <select
          onChange={(evt) => {
            action.field = [evt.target.value];
            updateMacroAction(action);
          }}
          value={action.field[0]}
          disabled={viewOnly}
        >
          {plugin.config &&
            Object.keys(plugin.config)
              .filter((k) => k !== "system")
              .map((key) => {
                const field = plugin.config![key as keyof typeof plugin];
                return (
                  <option key={key} value={key}>
                    {field.label ?? key}
                  </option>
                );
              })}
          {plugin.methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
      </label>
      <MacroActionEffectSelector {...props} />

      {action.effect === MacroActionEffect.Set && !viewOnly && (
        <MacroActionModifyValue {...props} config={plugin} action={action} />
      )}
    </>
  );
};
