import { MacroAction } from "../../macros";

export const MacroActionPanelGameTimeApi = ({
  action,
  viewOnly,
  updateMacroAction,
}: {
  action: MacroAction;
  viewOnly: boolean;
  updateMacroAction: (action: MacroAction) => void;
}) => {
  return (
    <p>
      <input
        value={action.value}
        onChange={(e) => {
          action.value = e.target.value;
        }}
        disabled={viewOnly}
      />
      <button onClick={() => updateMacroAction(action)}>Save</button>
    </p>
  );
};
