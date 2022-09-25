import create from "zustand";
import { settingsStore } from "@stores/settings-store";
import { Actionable, MacroAction, MacroActionSequence, MacroCondition, MacroDTO, MacrosDTO, SettingsMeta } from "common/types";
import { immer } from "zustand/middleware/immer";
import { MathUtils } from "three";
import { ManualTrigger } from "@macros/manual-trigger";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { MouseTrigger } from "@macros/mouse-trigger";
import { MacroHookTrigger } from "@macros/macro-hook-trigger";
import { saneDefaultsForNewMacroActionOrCondition } from "common/macros/sanitize-macros";
import { withErrorMessage } from "common/utils/with-error-message";
import { log } from "@ipc/log";

type State = { macros: MacrosDTO };

type Actions = {

    persist(): void;
    busy: boolean;

    createMacro(
        name: string,
        trigger: ManualTrigger | HotkeyTrigger | MouseTrigger | MacroHookTrigger
    ): void;
    updateMacro(macro: MacroDTO): void;
    deleteMacro(macroId: string): void;

    createActionable(macro: MacroDTO, action: Actionable): void;
    updateActionable(macro: MacroDTO, action: Actionable): void;
    deleteActionable(macro: MacroDTO, action: Actionable): void;

};

export const createMacroStore = (onSave?: (settings: SettingsMeta) => void) => create(

    immer<State & Actions>((set, get) => ({
        macros: settingsStore().data.macros,
        busy: false,

        persist() {
            if (get().busy) {
                return;
            }
            set(state => {
                state.busy = true
            });
            settingsStore()
                .save({
                    macros: {
                        macros: get().macros.macros,
                        revision: get().macros.revision + 1,
                    },
                })
                .then((payload) => {

                    set((state) => {
                        state.macros = payload.data.macros;
                        state.busy = false;
                    });

                    onSave && onSave(payload);


                }).catch((e) => {
                    log.error(withErrorMessage(e, "failed to save macros"));
                    set((state) => {
                        state.busy = false
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

        createActionable({ id }: MacroDTO, action: MacroAction | MacroCondition) {

            const saneActionable = saneDefaultsForNewMacroActionOrCondition(action, settingsStore());

            set((state) => {

                const macro = state.macros.macros.find((m) => m.id === id);

                if (!macro) return;

                if (saneActionable.type === "condition") {
                    macro.conditions.push(saneActionable);
                } else {
                    macro.actions.push(saneActionable);
                }

            });

            get().persist();

        },

        updateActionable({ id }: MacroDTO, actionable: Actionable) {

            set(state => {

                const macro = state.macros.macros.find((m) => m.id === id);

                if (macro) {

                    if (actionable.type === "action") {

                        const actionIdx = macro.actions.findIndex(
                            (a: MacroAction) => a.id === actionable.id
                        );

                        if (actionIdx !== -1) {
                            macro.actions[actionIdx] = actionable;
                        }

                    } else {

                        const conditionIdx = macro.conditions.findIndex(
                            (c: MacroCondition) => c.id === actionable.id
                        );

                        if (conditionIdx !== -1) {
                            macro.conditions[conditionIdx] = actionable;
                        }

                    }

                }

            });

            get().persist();

        },

        deleteActionable({ id }: MacroDTO, actionable: Actionable) {

            set(state => {

                const macro = state.macros.macros.find((m) => m.id === id);

                if (macro) {

                    if (actionable.type === "action") {
                        macro.actions = macro.actions.filter((a) => a.id !== actionable.id);
                    } else {
                        macro.conditions = macro.conditions.filter((a) => a.id !== actionable.id);
                    }

                }

            });

            get().persist();

        },

    }))
);






