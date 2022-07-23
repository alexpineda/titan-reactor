import { spaceOutCapitalLetters } from "@utils/string-utils";
import { getMacroActionValidEffects, MacroActionEffect } from "../macros";
import { MacroActionPanelProps } from "./macro-action-panel-props";

export const MacroActionEffectSelector = ({
  action,
  updateMacroAction,
  pluginsMetadata,
  viewOnly,
}: MacroActionPanelProps) => {
  const validEffects = getMacroActionValidEffects(action, pluginsMetadata);

  return (
    <select
      onChange={(evt) => {
        action.effect =
          MacroActionEffect[evt.target.value as keyof typeof MacroActionEffect];
        updateMacroAction(action);
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
