import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroAction, Operator } from "common/types";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { useSettingsStore } from "@stores";
import { getAvailableMutationInstructionsForAction } from "common/macros/sanitize-macros";

export const MacroActionEffectSelector = ({
  action,
  updateMacroActionEffect,
  viewOnly,
}: MacroActionPanelProps & {
  action: MacroAction;
}) => {
  const settings = useSettingsStore();
  const validInstructions = getAvailableMutationInstructionsForAction(
    action,
    settings
  );

  return (
    <select
      onChange={(evt) => {
        updateMacroActionEffect(action, evt.target.value as Operator);
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
