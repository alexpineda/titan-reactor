import {
  MacroCondition,
  ConditionComparator,
  PluginMetaData,
} from "common/types";
import { generateUUID } from "three/src/math/MathUtils";

export const CreateMacroCondition = ({
  onCreate,
}: {
  onCreate: (condition: MacroCondition) => void;
  pluginsMetadata: PluginMetaData[];
}) => {
  const createCondition = () => {
    onCreate({
      id: generateUUID(),
      path: [":app"],
      comparator: ConditionComparator.Equals,
    });
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
        <button
          onClick={createCondition}
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
