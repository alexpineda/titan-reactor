import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
  PluginMetaData,
  MacroAction,
  MacroActionEffect,
  MacroActionType,
} from "common/types";
import { useState } from "react";
import { generateUUID } from "three/src/math/MathUtils";

export const CreateMacroAction = ({
  pluginsMetadata,
  onCreate,
}: {
  onCreate: (action: MacroAction) => void;
  pluginsMetadata: PluginMetaData[];
}) => {
  const [actionType, setActionType] = useState<MacroActionType>(
    MacroActionType.ModifyAppSettings
  );

  const defaultAppSettingsField = ["audio", "global"];

  const defaultPluginName = pluginsMetadata[0].name;
  const defaultPluginSettingsField = Object.keys(
    pluginsMetadata[0].config ?? {}
  ).filter((_, i) => i === 0);

  const createAction = () => {
    if (actionType === MacroActionType.ModifyAppSettings) {
      onCreate({
        id: generateUUID(),
        type: actionType,
        field: defaultAppSettingsField,
        effect: MacroActionEffect.SetToDefault,
      });
    } else if (actionType === MacroActionType.ModifyPluginSettings) {
      onCreate({
        id: generateUUID(),
        type: actionType,
        field: defaultPluginSettingsField,
        effect: MacroActionEffect.SetToDefault,
        pluginName: defaultPluginName,
      });
    } else if (actionType === MacroActionType.CallGameTimeApi) {
      onCreate({
        id: generateUUID(),
        type: actionType,
        effect: MacroActionEffect.CallMethod,
        value: "",
      });
    }
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          gridGap: "var(--size-3)",
          alignItems: "center",
          justifyContent: "start",
          maxWidth: "var(--size-md)",
          marginInline: "var(--size-6)",
          marginBottom: "var(--size-9)",
        }}
      >
        <select
          onChange={(e) => setActionType(e.target.value as MacroActionType)}
          value={actionType}
        >
          {Object.values(MacroActionType).map((key) => (
            <option key={key} value={key}>
              {spaceOutCapitalLetters(key)}
            </option>
          ))}
        </select>
        <button
          onClick={createAction}
          style={{
            display: "flex",
            alignItems: "center",

            paddingBlock: "var(--size-1)",
            paddingInline: "var(--size-3)",
          }}
        >
          <i className="material-icons">add</i> Action
        </button>
      </div>
    </>
  );
};
