import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { MacroConditionPanelProps } from "./macro-condition-panel";
import { FieldDefinition } from "common/types";

export const MacroConditionModifyValue = (
  props: MacroConditionPanelProps & { config: FieldDefinition }
) => {
  const { condition, config, updateMacroCondition } = props;
  const controls = {
    SetField: mapSingleConfigToLeva({ ...config, label: "" }, (value) => {
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
