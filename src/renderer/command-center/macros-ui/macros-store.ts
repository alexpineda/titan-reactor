import create from "zustand";
import { sendWindow, SendWindowActionType } from "@ipc/relay";
import { useSettingsStore } from "@stores/settings-store";
import { InvokeBrowserTarget } from "common/ipc-handle-names";
import { MacroAction, MacroActionSequence, MacroCondition, MacroDTO, MacrosDTO } from "common/types";
import { immer } from "zustand/middleware/immer";
import { MathUtils } from "three";
import { ManualTrigger } from "@macros/manual-trigger";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { MacroHookTrigger } from "@macros/macro-hook-trigger";

type State = { macros: MacrosDTO };

type Actions = {

    persist(): void;

    createMacro(
        name: string,
        trigger: ManualTrigger | HotkeyTrigger | MouseTrigger | MacroHookTrigger
    ): void;
    updateMacro(macro: MacroDTO): void;
    deleteMacro(macroId: string): void;

    createAction(macro: MacroDTO, action: MacroAction): void;
    updateMacroAction(action: MacroAction): void;
    deleteAction(actionId: string): void;

    createCondition(macro: MacroDTO, action: MacroCondition): void;
    updateMacroCondition(condition: MacroCondition): void;
    deleteCondition(conditionId: string): void;

};

export const useMacroStore = create(

    immer<State & Actions>((set, get) => ({
        macros: useSettingsStore.getState().data.macros,

        persist() {
            useSettingsStore
                .getState()
                .save({
                    macros: {
                        macros: get().macros.macros,
                        revision: get().macros.revision + 1,
                    },
                })
                .then((payload) => {
                    sendWindow(InvokeBrowserTarget.Game, {
                        type: SendWindowActionType.CommitSettings,
                        payload,
                    });
                    set((state) => {
                        state.macros = payload.data.macros;
                    });
                });
        },


        createMacro(
            name: string,
            trigger: ManualTrigger | HotkeyTrigger | MouseTrigger | MacroHookTrigger
        ) {
            set((state) => {

                state.macros.macros.push({
                    id: MathUtils.generateUUID(),
                    name,
                    trigger: {
                        type: trigger.type,
                        value: trigger.serialize(),
                    },
                    actions: [],
                    enabled: true,
                    actionSequence: MacroActionSequence.AllSync,
                    conditions: [],
                });

            });

            get().persist();

        },


        updateMacro(macro: MacroDTO) {

            set((state) => {
                const idx = state.macros.macros.findIndex((m) => m.id === macro.id);

                if (idx !== -1) {
                    state.macros.macros[idx] = macro;
                }
            });

            get().persist();

        },

        deleteMacro(macroId: string) {

            set((state) => {

                state.macros.macros = state.macros.macros.filter(
                    (m) => m.id !== macroId
                );

            });

            get().persist();
        },

        createAction({ id }: MacroDTO, action: MacroAction) {

            set((state) => {

                const macro = state.macros.macros.find((m) => m.id === id);

                if (macro) {
                    macro.actions.push(action);
                }

            });

            get().persist();

        },

        updateMacroAction(action: MacroAction) {

            set(state => {
                const macro = state.macros.macros.find((m) =>
                    m.actions.find((a) => a.id === action.id)
                );

                if (macro) {

                    const actionIdx = macro.actions.findIndex(
                        (a: MacroAction) => a.id === action.id
                    );

                    if (actionIdx !== -1) {
                        macro.actions[actionIdx] = action;
                    }

                }

            });

            get().persist();

        },

        deleteAction(actionId: string) {

            set(state => {

                const macro = state.macros.macros.find((m) =>
                    m.actions.find((a) => a.id === actionId)
                );

                if (macro) {

                    macro.actions = macro.actions.filter((a) => a.id !== actionId);

                }

            });

            get().persist();

        },

        createCondition({ id }: MacroDTO, condition: MacroCondition) {

            set((state) => {
                const macro = state.macros.macros.find((m) => m.id === id);

                if (macro) {
                    macro.conditions.push(condition);
                }

            });

            get().persist();

        },

        updateMacroCondition(condition: MacroCondition) {

            set((state) => {
                const macro = state.macros.macros.find((m) =>
                    m.conditions.find((a) => a.id === condition.id)
                );

                if (macro) {

                    const conditionIdx = macro.conditions.findIndex(
                        (a: MacroCondition) => a.id === condition.id
                    );

                    if (conditionIdx !== -1) {

                        macro.conditions[conditionIdx] = condition;

                    }

                }
            });

            get().persist();
        },

        deleteCondition(conditionId: string) {

            set(state => {

                const macro = state.macros.macros.find((m) =>
                    m.conditions.find((a) => a.id === conditionId)
                );

                if (macro) {
                    macro.conditions = macro.conditions.filter((a) => a.id !== conditionId);
                }

            });

            get().persist();

        }
    }))
);






