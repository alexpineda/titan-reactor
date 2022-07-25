import { KeyboardEvent } from "react";
import {
  capitalizeFirstLetters,
  spaceOutCapitalLetters,
} from "@utils/string-utils";
import {
  PluginMetaData,
  MacroAction,
  MacroActionSequence,
  MacroDTO,
} from "common/types";
import { MacroActionPanel } from "./macro-action-panel";
import debounce from "lodash.debounce";
import { CreateMacroAction } from "./create-macro-action";

export const MacroPanel = ({
  macro,
  pluginsMetadata,
  updateMacro,
  updateMacroAction,
  activeAction,
  setActiveAction,
  deleteAction,
  deleteMacro,
  createAction,
}: {
  macro: MacroDTO;
  pluginsMetadata: PluginMetaData[];
  updateMacro: (macro: MacroDTO) => void;
  updateMacroAction: (action: MacroAction) => void;
  activeAction: string | null;
  setActiveAction: (id: string | null) => void;
  deleteAction: (id: string) => void;
  deleteMacro: (id: string) => void;
  createAction: (macro: MacroDTO, action: MacroAction) => void;
}) => {
  const ChangeHotkeyTriggerKey = debounce(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (
        e.code.includes("Shift") ||
        e.code.includes("Control") ||
        e.code.includes("Alt") ||
        e.code.includes("Escape")
      ) {
        return;
      }
      const shiftKey = e.shiftKey ? ["Shift"] : [];
      const ctrlKey = e.ctrlKey ? ["Ctrl"] : [];
      const altKey = e.altKey ? ["Alt"] : [];
      const key = [...shiftKey, ...ctrlKey, ...altKey, e.code].join("+");
      updateMacro({
        ...macro,
        trigger: {
          ...macro.trigger,
          value: key,
        },
      });
    },
    100,
    { leading: true, trailing: false }
  );

  return (
    <div
      style={{
        margin: "var(--size-6)",
      }}
    >
      <h2>{macro.name}</h2>
      <button onClick={() => deleteMacro(macro.id)}>Delete Macro</button>
      <p>
        <label>
          {capitalizeFirstLetters(macro.trigger.type)}
          <input
            value={macro.trigger.value}
            onKeyDown={ChangeHotkeyTriggerKey}
            readOnly={true}
          />
        </label>
      </p>
      <div>
        <label>
          Sequence{" "}
          <select
            onChange={(evt) => {
              updateMacro({
                ...macro,
                actionSequence:
                  MacroActionSequence[
                    evt.target.value as keyof typeof MacroActionSequence
                  ],
              });
            }}
            value={macro.actionSequence}
          >
            {Object.keys(MacroActionSequence).map((key) => (
              <option key={key} value={key}>
                {spaceOutCapitalLetters(key)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CreateMacroAction
        onCreate={(action) => createAction(macro, action)}
        pluginsMetadata={pluginsMetadata}
      />
      {macro.actions.map((action) => (
        <MacroActionPanel
          key={action.id}
          action={action}
          pluginsMetadata={pluginsMetadata}
          updateMacroAction={updateMacroAction}
          viewOnly={activeAction !== action.id}
          setActiveAction={setActiveAction}
          deleteAction={deleteAction}
        />
      ))}
    </div>
  );
};
