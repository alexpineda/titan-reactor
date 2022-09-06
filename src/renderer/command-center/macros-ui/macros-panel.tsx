import { useState } from "react";
import ErrorBoundary from "../error-boundary";
import {
  MacroAction,
  MacroActionSequence,
  MacroCondition,
  MacroDTO,
  MacrosDTO,
} from "common/types";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { generateUUID } from "three/src/math/MathUtils";
import { useSettingsStore } from "@stores/settings-store";
import { createDefaultMacros } from "./default-macros";
import groupBy from "lodash.groupby";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { ManualTrigger } from "@macros/manual-trigger";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { MacroHookTrigger } from "@macros/macro-hook-trigger";

export const MacrosPanel = () => {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const settings = useSettingsStore();
  const state = settings.data.macros;

  const save = (newMacros: MacrosDTO) => {
    settings
      .save({
        macros: newMacros,
      })
      .then((payload) => {
        sendWindow(InvokeBrowserTarget.Game, {
          type: SendWindowActionType.CommitSettings,
          payload,
        });
      });
  };

  const [activeAction, setActiveAction] = useState<string | null>(null);

  const updateMacro = (macro: MacroDTO) => {
    const idx = state.macros.findIndex((m) => m.id === macro.id);
    if (macro === state.macros[idx]) {
      throw new Error("Trying to update the same macro reference");
    }
    const newMacros = [...state.macros];
    newMacros.splice(idx, 1, macro);

    save({ ...state, macros: newMacros, revision: state.revision + 1 });
  };

  const updateMacroAction = (action: MacroAction) => {
    const idx = state.macros.findIndex((m) =>
      m.actions.find((a) => a.id === action.id)
    );
    const macro = state.macros[idx];
    const newMacro = { ...macro };

    const actionIdx = macro.actions.findIndex(
      (a: MacroAction) => a.id === action.id
    );
    if (action === macro.actions[actionIdx]) {
      throw new Error("Trying to update the same action reference");
    }

    newMacro.actions.splice(actionIdx, 1, action);
    const newMacros = [...state.macros];
    newMacros.splice(idx, 1, newMacro);
    save({ ...state, macros: newMacros, revision: state.revision + 1 });
  };

  const updateMacroCondition = (condition: MacroCondition) => {
    const idx = state.macros.findIndex((m) =>
      m.conditions.find((a) => a.id === condition.id)
    );
    const macro = state.macros[idx];
    const newMacro = { ...macro };

    const conditionIdx = macro.conditions.findIndex(
      (a: MacroCondition) => a.id === condition.id
    );
    if (condition === macro.conditions[conditionIdx]) {
      throw new Error("Trying to update the same condition reference");
    }

    newMacro.conditions.splice(conditionIdx, 1, condition);
    const newMacros = [...state.macros];
    newMacros.splice(idx, 1, newMacro);
    save({ ...state, macros: newMacros, revision: state.revision + 1 });
  };

  const deleteMacro = (macroId: string) => {
    save({
      ...state,
      macros: state.macros.filter((m) => m.id !== macroId),
      revision: state.revision + 1,
    });
  };

  const deleteAction = (actionId: string) => {
    const idx = state.macros.findIndex((m) =>
      m.actions.find((a) => a.id === actionId)
    );
    const macro = state.macros[idx];
    if (!macro) {
      throw new Error(
        "Trying to delete an action from a macro that doesn't exist"
      );
    }
    macro.actions = macro.actions.filter((a) => a.id !== actionId);

    save({
      ...state,
      macros: [...state.macros],
      revision: state.revision + 1,
    });
  };

  const deleteCondition = (conditionId: string) => {
    const idx = state.macros.findIndex((m) =>
      m.conditions.find((a) => a.id === conditionId)
    );
    const macro = state.macros[idx];
    if (!macro) {
      throw new Error(
        "Trying to delete an action from a macro that doesn't exist"
      );
    }
    macro.conditions = macro.conditions.filter((a) => a.id !== conditionId);

    save({
      ...state,
      macros: [...state.macros],
      revision: state.revision + 1,
    });
  };

  const createMacro = (
    name: string,
    trigger: ManualTrigger | HotkeyTrigger | MouseTrigger | MacroHookTrigger
  ) => {
    const newMacro = {
      id: generateUUID(),
      name,
      trigger: {
        type: trigger.type,
        value: trigger.serialize(),
      },
      actions: [],
      enabled: true,
      actionSequence: MacroActionSequence.AllSync,
      conditions: [],
    };
    save({
      ...state,
      macros: [newMacro, ...state.macros],
      revision: state.revision + 1,
    });
  };

  const createAction = (macro: MacroDTO, action: MacroAction) => {
    macro.actions.push(action);
    save({ ...state, revision: state.revision + 1 });
  };

  const createCondition = (macro: MacroDTO, action: MacroCondition) => {
    macro.conditions.push(action);
    save({ ...state, revision: state.revision + 1 });
  };

  return (
    <div>
      <ErrorBoundary message="There was an error with this page">
        {state.macros.length === 0 && (
          <div
            style={{
              padding: "var(--size-3)",
              background: "var(--yellow-1)",
              color: "var(--orange-7)",
              display: "grid",
              gridTemplateColumns: "auto auto",
              justifyContent: "start",
              gridGap: "1rem",
              alignItems: "center",
            }}
          >
            You don't have any macros. Configure a default set?{" "}
            <button
              onClick={() => {
                save(createDefaultMacros());
              }}
            >
              Create default macros
            </button>
          </div>
        )}
        <CreateMacro onCreate={createMacro} />
        <div>
          {Object.entries(
            groupBy(state.macros, (m) => {
              const s = m.name.split(":");
              return s.length === 1 ? "General" : s[0].trim();
            })
          ).map(([groupName, macros]) => (
            <div
              style={{
                margin: "var(--size-7)",
              }}
            >
              {groupName && (
                <div
                  onClick={() => {
                    if (collapsedGroups.includes(groupName)) {
                      setCollapsedGroups(
                        collapsedGroups.filter((g) => g !== groupName)
                      );
                    } else {
                      setCollapsedGroups([...collapsedGroups, groupName]);
                    }
                  }}
                  style={{
                    color: "var(--gray-6)",
                    display: "flex",
                    alignItems: "center",
                    position: "sticky",
                  }}
                >
                  <i
                    className="material-icons"
                    style={{
                      fontSize: "var(--font-size-3)",
                      marginRight: "var(--size-2)",
                    }}
                  >
                    folder
                  </i>
                  <span>{groupName}</span>
                  {collapsedGroups.includes(groupName) && (
                    <ul>
                      {macros.map((macro) => (
                        <li>{macro.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {!collapsedGroups.includes(groupName) &&
                macros.map((macro) => (
                  <MacroPanel
                    key={macro.id}
                    macro={macro}
                    pluginsMetadata={settings.enabledPlugins}
                    updateMacro={updateMacro}
                    updateMacroAction={updateMacroAction}
                    updateMacroCondition={updateMacroCondition}
                    activeAction={activeAction}
                    setActiveAction={setActiveAction}
                    deleteAction={deleteAction}
                    deleteCondition={deleteCondition}
                    deleteMacro={deleteMacro}
                    createAction={createAction}
                    createCondition={createCondition}
                  />
                ))}
            </div>
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
};
