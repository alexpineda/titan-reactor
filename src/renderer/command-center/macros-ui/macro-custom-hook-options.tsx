import { MacroDTO, PluginMetaData } from "common/types";
import { useState } from "react";
import { createDefaultHooks } from "../../plugins/hooks";
import { MacroHookTrigger } from "../../macros/macro-hook-trigger";

export const MacroCustomHookOptions = ({
  macro,
  pluginsMetadata,
  updateTriggerValue,
}: {
  macro: MacroDTO;
  pluginsMetadata: PluginMetaData[];
  updateTriggerValue: (value: any) => void;
}) => {
  const globalHooks = [
    ...Object.keys(createDefaultHooks()),
    "onEnterScene",
    "onExitScene",
  ].map((value) => ({ value, label: value }));
  const trigger = MacroHookTrigger.deserialize(macro.trigger.value);
  const [selectedPlugin, setSelectedPlugin] = useState<string>(
    trigger.pluginName ?? ""
  );
  const hooks = [
    ...pluginsMetadata
      .filter((p) => p.name !== selectedPlugin)
      .map((p) =>
        p.hooks.map((value) => ({ value, label: `${p.description}: ${value}` }))
      )
      .flat(),
    ...globalHooks,
  ];

  return (
    <div>
      <select
        onChange={(evt) => {
          setSelectedPlugin(evt.target.value);
          trigger.pluginName =
            evt.target.value === "" ? undefined : evt.target.value;
          updateTriggerValue(trigger.toString());
        }}
        value={selectedPlugin}
      >
        <option key={""} value={""}>
          Global
        </option>
        {pluginsMetadata.map((plugin) => (
          <option key={plugin.name} value={plugin.name}>
            {plugin.description}
          </option>
        ))}
      </select>
      <select
        onChange={(evt) => {
          trigger.hookName = evt.target.value;
          updateTriggerValue(trigger.toString());
        }}
        value={trigger.hookName}
      >
        <option key={""} value={""}></option>
        {hooks.map((hook) => (
          <option key={hook.value} value={hook.value}>
            {hook.label}
          </option>
        ))}
      </select>
    </div>
  );
};
