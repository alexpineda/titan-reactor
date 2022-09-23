import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
  MacroActionHostModifyValue,
  MacroActionPluginModifyValue,
  MutationInstruction,
} from "common/types";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { useSettingsStore } from "@stores";
import { getValidMutationInstructions } from "common/macros/get-macro-action-instructions";

export const MacroActionEffectSelector = ({
  action,
  updateMacroActionEffect,
  viewOnly,
}: MacroActionPanelProps & {
  action: MacroActionHostModifyValue | MacroActionPluginModifyValue;
}) => {
  const settings = useSettingsStore();
  const validEffects = getValidMutationInstructions(action, settings);

  return (
    <select
      onChange={(evt) => {
        updateMacroActionEffect(
          action,
          evt.target.value as MutationInstruction
        );
      }}
      value={action.instruction}
      disabled={viewOnly}
    >
      {validEffects.map((key) => (
        <option key={key} value={key}>
          {spaceOutCapitalLetters(key)}
        </option>
      ))}
    </select>
  );
};
