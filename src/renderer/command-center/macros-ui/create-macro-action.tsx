import { MacroAction, Operator, PluginMetaData } from "common/types";
import { generateUUID } from "three/src/math/MathUtils";

export const CreateMacroAction = ({
  onCreate,
}: {
  onCreate: (action: MacroAction) => void;
  pluginsMetadata: PluginMetaData[];
}) => {
  const createAction = () => {
    onCreate({
      id: generateUUID(),
      path: [":app"],
      operator: Operator.Set,
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
