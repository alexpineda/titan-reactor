import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
  ConditionComparator,
  MacroAction,
  MacroCondition,
  Operator,
} from "common/types";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { SettingsStore, useSettingsStore } from "@stores";
import {
  getAvailableMutationInstructionsForAction,
  getMacroConditionValidComparators,
} from "common/macros/sanitize-macros";
import { useMacroStore } from "../macros-store";

const getValidOps = (
  action: MacroAction | MacroCondition,
  settings: SettingsStore
) => {
  return action.type === "action"
    ? getAvailableMutationInstructionsForAction(action, settings)
    : getMacroConditionValidComparators(action, settings);
};

export const MacroActionEffectSelector = ({
  action,
  viewOnly,
  macro,
}: MacroActionPanelProps) => {
  const { updateActionable } = useMacroStore();
  const settings = useSettingsStore();
  const validInstructions = getValidOps(action, settings);

  return (
    <select
      onChange={(evt) => {
        if (action.type === "action") {
          updateActionable(macro, {
            ...action,
            operator: evt.target.value as Operator,
          });
        } else {
          updateActionable(macro, {
            ...action,
            comparator:
              ConditionComparator[
                evt.target.value as keyof typeof ConditionComparator
              ],
          });
        }
      }}
      value={action.type === "action" ? action.operator : action.comparator}
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
