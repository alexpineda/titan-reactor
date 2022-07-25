import { LevaPanel, useControls, useCreateStore } from "leva";
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
  return (
    <LevaPanel
      store={store}
      fill
      flat
      hideCopyButton
      titleBar={false}
      theme={{
        colors: {
          accent1: "blue",
          accent2: "orange",
          accent3: "red",
          elevation1: "red",
          elevation2: "#f5f5f5",
          elevation3: "#d9e0f0",
          highlight1: "black",
          highlight2: "#222",
          highlight3: "#333",
          vivid1: "red",
        },
        sizes: {
          controlWidth: "40vw",
        },
        fontSizes: {
          root: "14px",
        },
      }}
    />
  );
};
