import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroConditionComparator } from "common/types";
import { getMacroConditionValidComparators } from "common/sanitize-macros";
import { useSettingsStore } from "@stores";
import { MacroConditionPanelProps } from "./macro-condition-panel";

export const MacroConditionComparatorSelector = ({
  condition,
  updateMacroCondition,
  viewOnly,
}: MacroConditionPanelProps) => {
  const settings = useSettingsStore();
  const validComparators = getMacroConditionValidComparators(
    condition,
    settings
  );

  return (
    <select
      onChange={(evt) => {
        updateMacroCondition({
          ...condition,
          comparator:
            MacroConditionComparator[
              evt.target.value as keyof typeof MacroConditionComparator
            ],
        });
      }}
      value={condition.comparator}
      disabled={viewOnly}
    >
      {validComparators.map((key) => (
        <option key={key} value={key}>
          {spaceOutCapitalLetters(key)}
        </option>
      ))}
    </select>
  );
};
