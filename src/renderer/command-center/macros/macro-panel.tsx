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
  iconCache,
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
  iconCache: Record<number, string>;
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

  const renameMacro = () => {
    const name = prompt("Enter a new name for this macro", macro.name);
    if (name !== null) {
      updateMacro({ ...macro, name });
    }
  };

  return (
    <div
      style={{
        padding: "var(--size-4)",
        margin: "var(--size-7)",
        borderRadius: "var(--size-4)",
        boxShadow: "2px 2px 10px -6px",
      }}
    >
      <span
        style={{
          display: "grid",
          gridGap: "var(--size-3)",
          padding: "var(--size-3)",
          gridTemplateColumns: "auto auto auto auto 1fr",
          alignItems: "center",
          justifyContent: "start",
          marginBottom: "var(--size-5)",
        }}
      >
        <h4
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            style={{
              width: "var(--size-6)",
              filter: "invert(100%) sepia(1) saturate(100%) hue-rotate(50deg)",
            }}
            src={iconCache[389]}
          />
          {macro.name}
        </h4>

        <button onClick={() => renameMacro()}>Rename</button>
        <span>
          <label>
            {capitalizeFirstLetters(macro.trigger.type)}
            <input
              value={macro.trigger.value}
              onKeyDown={ChangeHotkeyTriggerKey}
              readOnly={true}
            />
          </label>
        </span>
        <span>
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
        </span>
        <button
          style={{
            justifySelf: "end",
            color: "var(--red-6)",
            padding: "var(--size-2)",
          }}
          onClick={() => deleteMacro(macro.id)}
        >
          <i
            className="material-icons"
            style={{
              fontSize: "var(--font-size-4)",
            }}
          >
            delete
          </i>
        </button>
      </span>
      <CreateMacroAction
        onCreate={(action) => createAction(macro, action)}
        pluginsMetadata={pluginsMetadata}
      />
      <div>
        {macro.actions.map((action) => (
          <MacroActionPanel
            iconCache={iconCache}
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
    </div>
  );
};
