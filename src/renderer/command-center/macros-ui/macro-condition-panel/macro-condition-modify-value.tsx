import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { MacroConditionPanelProps } from "./macro-condition-panel";
import { DisplayFieldDefinition } from "common/macros/get-macro-action-condition-field-definition";

export const MacroConditionModifyValue = (
  props: MacroConditionPanelProps & { config: DisplayFieldDefinition }
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
