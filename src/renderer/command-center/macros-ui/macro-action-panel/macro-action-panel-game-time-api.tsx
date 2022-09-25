import { useState } from "react";
import { Actionable, MacroDTO } from "common/types";
import { useMacroStore } from "../macros-store";

export const MacroActionPanelGameTimeApi = ({
  macro,
  action,
  viewOnly,
}: {
  macro: MacroDTO;
  action: Actionable;
  viewOnly: boolean;
}) => {
  const { updateActionable } = useMacroStore();
  const [value, setValue] = useState(action.value);

  return (
    <p
      style={{
        display: "grid",
        gridGap: "var(--size-1)",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={viewOnly}
      />
      {!viewOnly && (
        <button
          onClick={() => {
            updateActionable(macro, { ...action, value });
          }}
        >
          Save
        </button>
      )}
    </p>
  );
};
