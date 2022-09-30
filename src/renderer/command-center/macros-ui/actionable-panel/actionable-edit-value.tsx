import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { mapSingleConfigToLeva } from "@utils/leva-utils";
import { ActionablePanelProps } from "./actionable-pane-props";
import { FieldDefinition } from "common/types";
import { useMacroStore } from "../use-macros-store";
import { useContext } from "react";
import { PreviewContext } from "../PreviewContext";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";

export const ActionableEditValue = (
  props: ActionablePanelProps & { config: FieldDefinition }
) => {
  const { updateActionable } = useMacroStore();
  const activePreview = useContext(PreviewContext);
  const { action, config, macro } = props;
  const controls = {
    SetField: mapSingleConfigToLeva({ ...config, label: "" }, (value) => {
      const newAction = {
        ...action,
        value,
      };
      updateActionable(macro, newAction);
      if (activePreview && newAction.type === "action") {
        sendWindow(InvokeBrowserTarget.Game, {
          type: SendWindowActionType.ManualMacroActionTrigger,
          payload: {
            action: newAction,
            withReset: false,
          },
        });
      }
    }),
  };

  const store = useCreateStore();

  useControls(controls, { store }, [action]);

  return createLevaPanel(store);
};
