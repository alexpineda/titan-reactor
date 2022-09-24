import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroAction, Operator } from "common/types";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { useSettingsStore } from "@stores";
import { getAvailableMutationInstructionsForAction } from "common/macros/sanitize-macros";
import { useMacroStore } from "../macros-store";

export const MacroActionEffectSelector = ({
  action,
  viewOnly,
}: MacroActionPanelProps & {
  action: MacroAction;
}) => {
  const { updateMacroAction } = useMacroStore();
  const settings = useSettingsStore();
  const validInstructions = getAvailableMutationInstructionsForAction(
    action,
    settings
  );

  return (
    <select
      onChange={(evt) => {
        updateMacroAction({
          ...action,
          operator: evt.target.value as Operator,
        });
      }}
      value={action.operator}
      disabled={viewOnly}
    >
      {validInstructions.map((key) => (
        <option key={key} value={key}>
          {spaceOutCapitalLetters(key)}
        </option>
      ))}
    </select>
  );
};
