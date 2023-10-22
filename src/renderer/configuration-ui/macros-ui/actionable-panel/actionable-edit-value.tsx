import { useControls, useCreateStore } from "leva";
import { createLevaPanel } from "../../create-leva-panel";
import { wrapFieldConfigWithChangeListener } from "../../leva-plugins/leva-utils";
import { ActionablePanelProps } from "./actionable-pane-props";
import { FieldDefinition } from "common/types";
import { useMacroStore } from "../use-macros-store";
import { useContext } from "react";
import { PreviewContext } from "../PreviewContext";
import { sendWindow, SendWindowActionType } from "../../ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { Schema } from "leva/plugin";

export const ActionableEditValue = (
    props: ActionablePanelProps & { config: FieldDefinition }
) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { updateActionable } = useMacroStore();
    const activePreview = useContext( PreviewContext );
    const { action, config, macro } = props;
    const controls = {
        SetField: wrapFieldConfigWithChangeListener(
            { ...config, label: "" },
            ( value ) => {
                const newAction = {
                    ...action,
                    value,
                };
                updateActionable( macro, newAction );
                if ( activePreview && newAction.type === "action" ) {
                    sendWindow( InvokeBrowserTarget.Game, {
                        type: SendWindowActionType.ManualMacroActionTrigger,
                        payload: {
                            action: newAction,
                            withReset: false,
                        },
                    } );
                }
            }
        ),
    };

    const store = useCreateStore();

    useControls( controls as Schema, { store }, [action] );

    return createLevaPanel( store );
};
