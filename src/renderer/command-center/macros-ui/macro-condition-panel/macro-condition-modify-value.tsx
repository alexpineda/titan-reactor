import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { MacroConditionPanelProps } from "./macro-condition-panel";

export const MacroConditionModifyValue = (
  props: MacroConditionPanelProps & { config: any }
) => {
  const { condition, config, updateMacroCondition } = props;
  const controls = {
    SetField: mapSingleConfigToLeva(config, (value) => {
      updateMacroCondition({
        ...condition,
        value,
      });
    }),
  };

  const store = useCreateStore();

  useControls(controls, { store }, [condition]);
  return createLevaPanel(store);
};
