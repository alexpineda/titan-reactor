import { spaceOutCapitalLetters } from "@utils/string-utils";
import {
  MacroActionHostModifyValue,
  MacroActionPluginModifyValue,
  MutationInstruction,
} from "common/types";
import { getMacroActionValidEffects } from "common/sanitize-macros";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { useSettingsStore } from "@stores";

export const MacroActionEffectSelector = ({
  action,
  updateMacroActionEffect,
  viewOnly,
}: MacroActionPanelProps & {
  action: MacroActionHostModifyValue | MacroActionPluginModifyValue;
}) => {
  const settings = useSettingsStore();
  const validEffects = getMacroActionValidEffects(action, settings);

  return (
    <select
      onChange={(evt) => {
        updateMacroActionEffect(
          action,
          evt.target.value as MutationInstruction
        );
      }}
      value={action.effect}
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
