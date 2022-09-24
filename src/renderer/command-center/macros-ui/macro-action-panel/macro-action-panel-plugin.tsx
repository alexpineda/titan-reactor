import { MacroAction, Operator } from "common/types";
import { MacroActionEffectSelector } from "./macro-action-effect-selector";
import { MacroActionModifyValue } from "./macro-action-modify-value";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import ErrorBoundary from "../../error-boundary";
import { useMacroStore } from "../macros-store";

export const MacroActionPanelPlugin = (
  props: MacroActionPanelProps & {
    action: MacroAction;
  }
) => {
  const { updateMacroAction } = useMacroStore();
  const { action, pluginsMetadata, viewOnly } = props;

  const plugin = pluginsMetadata.find((p) => p.name === action.path[0]);

  if (!plugin) {
    throw new Error(`This action has either no plugin configuration or an invalid plugin
              configuration. It could be that the plugin is
              disabled.`);
  }

  const field = plugin.config?.[action.path[1] as keyof typeof plugin.config];

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
                path: [":plugin", plugin.name, evt.target.value],
                value: undefined,
                operator: Operator.SetToDefault,
              });
            }}
            value={action.path[0]}
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
                path: [action.path[0], evt.target.value],
                value: undefined,
                operator: Operator.SetToDefault,
              });
            }}
            value={action.path[1]}
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
          </select>
        </label>
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
            {action.value}
          </p>
        )}
      </div>
      {action.operator === Operator.Set &&
        !viewOnly &&
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
