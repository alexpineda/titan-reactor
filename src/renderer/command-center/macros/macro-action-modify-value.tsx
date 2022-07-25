import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../create-leva-panel";
import { mapSingleConfigToLeva } from "../map-config-to-leva";
import { MacroActionPanelProps } from "./macro-action-panel-props";

export const MacroActionModifyValue = (
  props: MacroActionPanelProps & { config: any }
) => {
  const { action, config, updateMacroAction } = props;
  const controls = {
    SetField: mapSingleConfigToLeva(config, (value) => {
      updateMacroAction({
        ...action,
        value,
      });
    }),
  };

  const store = useCreateStore();

  useControls(controls, { store }, [action.id]);
  return createLevaPanel(store);
};
