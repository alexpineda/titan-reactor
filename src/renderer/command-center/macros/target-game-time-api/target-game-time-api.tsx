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
    <p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={viewOnly}
      />
      <button onClick={() => updateMacroAction({ ...action, value })}>
        Save
      </button>
    </p>
  );
};
