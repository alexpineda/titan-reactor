import { useEffect, useRef, useState } from "react";
import ErrorBoundary from "../error-boundary";
import {
  MacroAction,
  MacroActionSequence,
  MacroDTO,
  MacrosDTO,
  MacroTriggerDTO,
  validateMacroAction,
} from "../macros";
import { MacroPanel } from "./macro-panel";
import { CreateMacro } from "./create-macro";
import { generateUUID } from "three/src/math/MathUtils";
import { useSettingsStore } from "@stores/settings-store";

export const MacrosPanel = () => {
  const settings = useSettingsStore();
  const [state, setState] = useState<MacrosDTO>(settings.data.macros);
  const prevRevision = useRef(state.revision);

  useEffect(() => {
    if (state.revision !== prevRevision.current) {
      settings.save({
        macros: state,
      });
    }
  }, [state]);

  const [activeAction, setActiveAction] = useState<string | null>(null);

  // psuedo flux with mutable state but pretending its immutable weehoo!
  const updateMacro = (macro: MacroDTO) => {
    const newMacro = { ...macro };
    const idx = state.macros.findIndex((m) => m.id === macro.id);
    state.macros.splice(idx, 1, newMacro);

    setState({ ...state, revision: state.revision + 1 });
  };

  const updateMacroAction = (action: MacroAction) => {
    const idx = state.macros.findIndex((m) =>
      m.actions.find((a) => a.id === action.id)
    );
    const macro = state.macros[idx];
    const newMacro = { ...macro };

    const actionIdx = macro.actions.findIndex((a) => a.id === action.id);
    const newAction = { ...action };

    validateMacroAction(newAction, settings.pluginsMetadata);

    newMacro.actions.splice(actionIdx, 1, newAction);

    state.macros.splice(idx, 1, newMacro);
    setState({ ...state, revision: state.revision + 1 });
    console.log(newAction);
  };

  const deleteMacro = (macroId: string) => {
    setState({
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
    macro.actions = macro.actions.filter((a) => a.id !== actionId);

    setState({
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
    setState({
      ...state,
      macros: [newMacro, ...state.macros],
      revision: state.revision + 1,
    });
  };

  const createAction = (macro: MacroDTO, action: MacroAction) => {
    macro.actions.push(action);
    setState({ ...state, revision: state.revision + 1 });
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
