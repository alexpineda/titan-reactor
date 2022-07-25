import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroActionEffect } from "common/types";
import { getMacroActionValidEffects } from "common/sanitize-macros";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { useSettingsStore } from "@stores";

export const MacroActionEffectSelector = ({
  action,
  updateMacroAction,
  viewOnly,
}: MacroActionPanelProps) => {
  const settings = useSettingsStore();
  const validEffects = getMacroActionValidEffects(action, settings);

  return (
    <select
      onChange={(evt) => {
        updateMacroAction({
          ...action,
          effect:
            MacroActionEffect[
              evt.target.value as keyof typeof MacroActionEffect
            ],
        });
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
