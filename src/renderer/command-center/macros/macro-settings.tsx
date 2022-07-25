import { useEffect, useRef, useState } from "react";
import ErrorBoundary from "../error-boundary";
import {
  MacroAction,
  MacroActionSequence,
  MacroDTO,
  MacrosDTO,
  MacroTriggerDTO,
} from "common/types";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { generateUUID } from "three/src/math/MathUtils";
import { useSettingsStore } from "@stores/settings-store";

export const MacrosPanel = () => {
  const settings = useSettingsStore();
  const state = settings.data.macros;

  const save = (newMacros: MacrosDTO) => {
    if (state.revision !== newMacros.revision) {
      settings.save({
        macros: newMacros,
      });
    }
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
    console.log(action);
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

  const createMacro = (name: string, trigger: MacroTriggerDTO) => {
    const newMacro = {
      id: generateUUID(),
      name,
      trigger,
      actions: [],
      enabled: true,
      actionSequence: MacroActionSequence.AllSync,
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

  return (
    <div>
      <h1>Macros</h1>
      <ErrorBoundary message="There was an error with this page">
        <CreateMacro onCreate={createMacro} />
        <div>
          {state.macros.map((macro) => (
            <MacroPanel
              macro={macro}
              pluginsMetadata={settings.pluginsMetadata}
              updateMacro={updateMacro}
              updateMacroAction={updateMacroAction}
              activeAction={activeAction}
              setActiveAction={setActiveAction}
              deleteAction={deleteAction}
              deleteMacro={deleteMacro}
              createAction={createAction}
            />
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
};
