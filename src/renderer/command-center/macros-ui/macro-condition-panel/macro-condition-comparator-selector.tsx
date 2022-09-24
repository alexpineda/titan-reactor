import { spaceOutCapitalLetters } from "@utils/string-utils";
import { ConditionComparator } from "common/types";
import { getMacroConditionValidComparators } from "common/macros/field-utilities";
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
            ConditionComparator[
              evt.target.value as keyof typeof ConditionComparator
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
