import create from "zustand";
import { settingsStore } from "@stores/settings-store";
import {
    Actionable,
    MacroAction,
    MacroActionSequence,
    MacroCondition,
    MacroDTO,
    MacrosDTO,
    SettingsMeta,
} from "common/types";
import { immer } from "zustand/middleware/immer";
import { MathUtils } from "three";
import { ManualTrigger } from "@macros/manual-trigger";
import { HotkeyTrigger } from "@macros/hotkey-trigger";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { sanitizeActionable } from "common/macros/sanitize-macros";
import { withErrorMessage } from "common/utils/with-error-message";
import { log } from "@ipc/log";
import { WritableDraft } from "immer/dist/internal";

interface State {
    macros: MacrosDTO;
}

interface Actions {
    persist(): Promise<SettingsMeta | undefined>;
    busy: boolean;

    createMacro(
        name: string,
        trigger: ManualTrigger | HotkeyTrigger | WorldEventTrigger
    ): Promise<string>;
    updateMacro( macro: MacroDTO ): void;
    deleteMacro( macroId: string ): void;

    createActionable( macro: MacroDTO, action: Actionable ): void;
    updateActionable( macro: MacroDTO, action: Actionable ): void;
    deleteActionable( macro: MacroDTO, action: Actionable ): void;
    reOrderAction(
        macroId: string,
        actionId: string,
        group: number,
        order: 1 | -1
    ): void;
}

const insertAction = (
    actionId: string,
    insertLocationId: string,
    actions: WritableDraft<MacroAction[]>,
    offset = 0
) => {
    const idx1 = actions.findIndex( ( a ) => a.id === actionId );
    const action = actions.splice( idx1, 1 )[0];
    const idx2 = actions.findIndex( ( a ) => a.id === insertLocationId );
    actions.splice( idx2 + offset, 0, action );
};

export const createMacroStore = ( onSave?: ( settings: SettingsMeta ) => void ) =>
    create(
        immer<State & Actions>( ( set, get ) => ( {
            macros: settingsStore().data.macros,
            busy: false,

            async persist() {
                if ( get().busy ) {
                    return;
                }
                set( ( state ) => {
                    state.busy = true;
                } );

                try {
                    const settings = await settingsStore().save( {
                        macros: {
                            macros: get().macros.macros,
                            revision: get().macros.revision + 1,
                        },
                    } );

                    set( ( state ) => {
                        state.macros = settings.data.macros;
                    } );

                    onSave && onSave( settings );

                    return settings;
                } catch ( e ) {
                    log.error( withErrorMessage( e, "failed to save macros" ) );
                } finally {
                    set( ( state ) => {
                        state.busy = false;
                    } );
                }
            },

            async createMacro(
                name: string,
                trigger: ManualTrigger | HotkeyTrigger | WorldEventTrigger
            ) {
                const id = MathUtils.generateUUID();

                set( ( state ) => {
                    state.macros.macros.push( {
                        id,
                        name,
                        trigger: {
                            type: trigger.type,
                            value: trigger.serialize(),
                        },
                        actions: [],
                        enabled: true,
                        actionSequence: MacroActionSequence.AllSync,
                        conditions: [],
                    } );
                } );

                await get().persist();

                return id;
            },

            updateMacro( macro: MacroDTO ) {
                set( ( state ) => {
                    const idx = state.macros.macros.findIndex( ( m ) => m.id === macro.id );

                    if ( idx !== -1 ) {
                        state.macros.macros[idx] = macro;
                    }
                } );

                get().persist();
            },

            deleteMacro( macroId: string ) {
                set( ( state ) => {
                    state.macros.macros = state.macros.macros.filter(
                        ( m ) => m.id !== macroId
                    );
                } );

                get().persist();
            },

            createActionable( { id }: MacroDTO, action: MacroAction | MacroCondition ) {
                const saneActionable = sanitizeActionable( action, settingsStore() );

                set( ( state ) => {
                    const macro = state.macros.macros.find( ( m ) => m.id === id );

                    if ( !macro ) return;

                    if ( saneActionable.type === "condition" ) {
                        macro.conditions.push( saneActionable );
                    } else {
                        const maxGroup = Math.max(
                            ...macro.actions.map( ( a ) => a.group ?? 0 )
                        );
                        saneActionable.group = maxGroup + 1;
                        macro.actions.push( saneActionable );
                    }
                } );

                get().persist();
            },

            updateActionable( { id }: MacroDTO, _actionable: Actionable ) {
                const actionable = sanitizeActionable( _actionable, settingsStore() );

                set( ( state ) => {
                    const macro = state.macros.macros.find( ( m ) => m.id === id );

                    if ( macro ) {
                        if ( actionable.type === "action" ) {
                            const actionIdx = macro.actions.findIndex(
                                ( a: MacroAction ) => a.id === actionable.id
                            );

                            if ( actionIdx !== -1 ) {
                                macro.actions[actionIdx] = actionable;
                            }
                        } else {
                            const conditionIdx = macro.conditions.findIndex(
                                ( c: MacroCondition ) => c.id === actionable.id
                            );

                            if ( conditionIdx !== -1 ) {
                                macro.conditions[conditionIdx] = actionable;
                            }
                        }
                    }
                } );

                get().persist();
            },

            deleteActionable( { id }: MacroDTO, actionable: Actionable ) {
                set( ( state ) => {
                    const macro = state.macros.macros.find( ( m ) => m.id === id );

                    if ( macro ) {
                        if ( actionable.type === "action" ) {
                            macro.actions = macro.actions.filter(
                                ( a ) => a.id !== actionable.id
                            );
                        } else {
                            macro.conditions = macro.conditions.filter(
                                ( a ) => a.id !== actionable.id
                            );
                        }
                    }
                } );

                get().persist();
            },

            reOrderAction(
                macroId: string,
                actionId: string,
                group: number,
                order: 1 | -1
            ) {
                set( ( state ) => {
                    const macro = state.macros.macros.find( ( m ) => m.id === macroId );

                    if ( macro ) {
                        const grouped = macro.actions.filter( ( a ) => a.group === group );

                        const gIdx = grouped.findIndex( ( a ) => a.id === actionId );

                        if ( gIdx === -1 ) {
                            return;
                        }

                        // move to top of previous group
                        if ( gIdx === 0 && order === -1 ) {
                            const prevGroup = macro.actions.filter(
                                ( a ) => a.group === group - 1
                            );
                            if ( prevGroup.length ) {
                                insertAction(
                                    actionId,
                                    prevGroup[prevGroup.length - 1].id,
                                    macro.actions,
                                    1
                                );
                            }
                            const action = macro.actions.find(
                                ( a ) => a.id === actionId
                            )!;
                            action.group = group - 1;

                            // move to beginning of next group
                        } else if ( order === 1 && gIdx === grouped.length - 1 ) {
                            const nextGroup = macro.actions.filter(
                                ( a ) => a.group === group + 1
                            );
                            if ( nextGroup.length ) {
                                insertAction( actionId, nextGroup[0].id, macro.actions );
                            }
                            const action = macro.actions.find(
                                ( a ) => a.id === actionId
                            )!;
                            action.group = group + 1;
                            return;
                            // move up or down
                        } else if ( order === -1 ) {
                            const prev = grouped[gIdx - 1];

                            insertAction( actionId, prev.id, macro.actions );
                        } else {
                            const next = grouped[gIdx + 1];
                            insertAction( actionId, next.id, macro.actions, 1 );
                        }
                    }
                } );

                get().persist();
            },
        } ) )
    );
