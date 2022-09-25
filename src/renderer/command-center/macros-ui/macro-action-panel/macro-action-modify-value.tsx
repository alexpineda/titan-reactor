import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { FieldDefinition } from "common/types";
import { useMacroStore } from "../macros-store";

export const MacroActionModifyValue = (
  props: MacroActionPanelProps & { config: FieldDefinition }
) => {
  const { updateActionable } = useMacroStore();
  const { action, config, macro } = props;
  const controls = {
    SetField: mapSingleConfigToLeva({ ...config, label: "" }, (value) => {
      updateActionable(macro, {
        ...action,
        value,
      });
    }),
  };

  const store = useCreateStore();

  useControls(controls, { store }, [action]);
  return createLevaPanel(store);
};
