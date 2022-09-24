import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { FieldDefinition } from "common/types";

export const MacroActionModifyValue = (
  props: MacroActionPanelProps & { config: FieldDefinition }
) => {
  const { action, config, updateMacroAction } = props;
  const controls = {
    SetField: mapSingleConfigToLeva({ ...config, label: "" }, (value) => {
      updateMacroAction({
        ...action,
        value,
      });
    }),
  };

  const store = useCreateStore();

  useControls(controls, { store }, [action]);
  return createLevaPanel(store);
};
