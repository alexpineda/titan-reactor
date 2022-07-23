import { spaceOutCapitalLetters } from "@utils/string-utils";
import { MacroActionType } from "../macros";
import { MacroActionPanelProps } from "./macro-action-panel-props";
import { MacroActionPanelGameTimeApi } from "./target-game-time-api/target-game-time-api";
import { MacroActionPanelHost } from "./target-host/target-host";
import { MacroActionPanelPlugin } from "./target-plugin/target-plugin";

export const MacroActionPanel = (
  props: MacroActionPanelProps & {
    setActiveAction: (actionId: string) => void;
    deleteAction: (actionId: string) => void;
  }
) => {
  const { action, setActiveAction, deleteAction } = props;

  return (
    <div
      style={{
        margin: "var(--size-6)",
      }}
    >
      <h3>{spaceOutCapitalLetters(action.type)} </h3>
      <button onClick={() => setActiveAction(action.id)}>Edit</button>
      <button onClick={() => deleteAction(action.id)}>Delete</button>
      {action.type === MacroActionType.ModifyAppSettings && (
        <MacroActionPanelHost {...props} action={action} />
      )}
      {action.type === MacroActionType.CallGameTimeApi && (
        <MacroActionPanelGameTimeApi {...props} action={action} />
      )}
      {action.type === MacroActionType.ModifyPluginSettings && (
        <MacroActionPanelPlugin {...props} action={action} />
      )}
    </div>
  );
};
