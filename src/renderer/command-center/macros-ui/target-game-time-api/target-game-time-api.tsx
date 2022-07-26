import { useState } from "react";
import { MacroAction } from "common/types";

export const MacroActionPanelGameTimeApi = ({
  action,
  viewOnly,
  updateMacroAction,
}: {
  action: MacroAction;
  viewOnly: boolean;
  updateMacroAction: (action: MacroAction) => void;
}) => {
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
        <button onClick={() => updateMacroAction({ ...action, value })}>
          Save
        </button>
      )}
    </p>
  );
};
