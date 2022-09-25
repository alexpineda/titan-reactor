import { ConditionComparator, Operator } from "common/types";
import { ActionableOpsSelector } from "./actionable-ops-selector";
import { ActionableEditValue } from "./actionable-edit-value";
import { ActionablePanelProps } from "./actionable-pane-props";
import ErrorBoundary from "../../error-boundary";
import { useMacroStore } from "../use-macros-store";

export const ActionableTargetPlugin = (props: ActionablePanelProps) => {
  const { updateActionable } = useMacroStore();
  const { action, pluginsMetadata, viewOnly, macro } = props;

  const pluginName = action.path[1];
  const fieldKey = action.path.slice(2)[0];

  const plugin = pluginsMetadata.find((p) => p.name === pluginName);

  if (!plugin) {
    throw new Error(`This action has either no plugin configuration or an invalid plugin
              configuration. It could be that the plugin is
              disabled.`);
  }

  const field = plugin.config?.[fieldKey as keyof typeof plugin.config];

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
              if (action.type === "action") {
                updateActionable(macro, {
                  ...action,
                  path: [":plugin", evt.target.value],
                  value: undefined,
                  operator: Operator.SetToDefault,
                });
              } else {
                updateActionable(macro, {
                  ...action,
                  path: [":plugin", evt.target.value],
                  value: undefined,
                  comparator: ConditionComparator.Equals,
                });
              }
            }}
            value={pluginName}
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
              if (action.type === "action") {
                updateActionable(macro, {
                  ...action,
                  path: [":plugin", pluginName, evt.target.value],
                  value: undefined,
                  operator: Operator.SetToDefault,
                });
              } else {
                updateActionable(macro, {
                  ...action,
                  path: [":plugin", pluginName, evt.target.value],
                  value: undefined,
                  comparator: ConditionComparator.Equals,
                });
              }
            }}
            value={fieldKey}
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
          <ActionableOpsSelector {...props} />
        </ErrorBoundary>

        {viewOnly &&
          (action.type === "condition" || action.operator === Operator.Set) && (
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
      {(action.type === "condition" || action.operator === Operator.Set) &&
        !viewOnly &&
        action.value !== undefined && (
          <div style={{ margin: "var(--size-2)" }}>
            <ErrorBoundary message="Error with modifier">
              <ActionableEditValue
                {...props}
                config={field}
                action={action}
                key={action.path.join(".")}
              />
            </ErrorBoundary>
          </div>
        )}
    </>
  );
};
