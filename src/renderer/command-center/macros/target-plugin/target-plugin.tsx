import { MacroActionEffect, MacroActionPluginModifyValue } from "common/types";
import { MacroActionEffectSelector } from "../macro-action-effect-selector";
import { MacroActionModifyValue } from "../macro-action-modify-value";
import { MacroActionPanelProps } from "../macro-action-panel-props";
import ErrorBoundary from "../../error-boundary";

export const MacroActionPanelPlugin = (
  props: MacroActionPanelProps & {
    action: MacroActionPluginModifyValue;
  }
) => {
  const { action, pluginsMetadata, updateMacroAction, viewOnly } = props;

  const plugin = pluginsMetadata.find((p) => p.name === action.pluginName);

  if (!plugin) {
    throw new Error(`This action has either no plugin configuration or an invalid plugin
              configuration. It could be that the plugin is
              disabled.`);
  }

  const method = plugin.methods.find((m) => m === action.field[0]);
  const field = plugin.config?.[action.field[0] as keyof typeof plugin.config];

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridGap: "var(--size-3)",
          alignItems: "center",
          justifyContent: "start",
        }}
      >
        <label>
          Plugin{" "}
          <select
            onChange={(evt) => {
              updateMacroAction({
                ...action,
                pluginName: evt.target.value,
                field: [],
                value: undefined,
                effect: MacroActionEffect.SetToDefault,
              });
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
              updateMacroAction({
                ...action,
                field: [evt.target.value],
                value: undefined,
                effect: MacroActionEffect.SetToDefault,
              });
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
        <ErrorBoundary message="Error with effects">
          <MacroActionEffectSelector {...props} />
        </ErrorBoundary>

        {viewOnly && action.effect === MacroActionEffect.Set && (
          <p>{action.value}</p>
        )}
      </div>
      {action.effect === MacroActionEffect.Set &&
        !viewOnly &&
        !method &&
        action.value !== undefined && (
          <div style={{ margin: "var(--size-2)" }}>
            <ErrorBoundary message="Error with modifier">
              <MacroActionModifyValue
                {...props}
                config={field}
                action={action}
              />
            </ErrorBoundary>
          </div>
        )}
    </>
  );
};
