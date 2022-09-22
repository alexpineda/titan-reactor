import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
  MacroCondition,
  MacroConditionComparator,
  MacroConditionType,
  PluginMetaData,
} from "common/types";
import { useState } from "react";
import { generateUUID } from "three/src/math/MathUtils";

export const CreateMacroCondition = ({
  pluginsMetadata,
  onCreate,
}: {
  onCreate: (condition: MacroCondition) => void;
  pluginsMetadata: PluginMetaData[];
}) => {
  const [conditionType, setConditionType] = useState<MacroConditionType>(
    MacroConditionType.AppSettingsCondition
  );

  const defaultAppSettingsField = ["audio", "global"];

  const defaultPluginName = pluginsMetadata[0].name;
  const defaultPluginSettingsField = Object.keys(
    pluginsMetadata[0].config ?? {}
  ).filter((_, i) => i === 0);

  const createAction = () => {
    if (conditionType === MacroConditionType.AppSettingsCondition) {
      onCreate({
        id: generateUUID(),
        type: conditionType,
        path: defaultAppSettingsField,
        comparator: MacroConditionComparator.Equals,
      });
    } else if (conditionType === MacroConditionType.PluginSettingsCondition) {
      onCreate({
        id: generateUUID(),
        type: conditionType,
        path: [defaultPluginName, ...defaultPluginSettingsField],
        comparator: MacroConditionComparator.Equals,
      });
    } else if (conditionType === MacroConditionType.FunctionCondition) {
      onCreate({
        id: generateUUID(),
        type: conditionType,
        value: "",
        comparator: MacroConditionComparator.Equals,
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
          onChange={(e) =>
            setConditionType(e.target.value as MacroConditionType)
          }
          value={conditionType}
        >
          {Object.values(MacroConditionType).map((key) => (
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
          <i className="material-icons">add</i> Condition
        </button>
      </div>
    </>
  );
};
