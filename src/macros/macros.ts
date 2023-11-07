import { log } from "@ipc/log";
import {
    MacrosDTO,
    MacroTrigger,
    TriggerType,
    ConditionComparator,
    MacroAction,
    Operator,
} from "common/types";
import { Macro } from "./macro";
import { ManualTrigger } from "./manual-trigger";
import { HotkeyTrigger, HotkeyTriggerDTO } from "./hotkey-trigger";
import { KeyCombo } from "./key-combo";
import { WorldEventTrigger, WorldEventTriggerDTO } from "@macros/world-event-trigger";
import { Janitor } from "three-janitor";
import { TargetComposer } from "@core/world/target-composer";
import { fieldOperation } from "@stores/field-operation";

export class Macros {
    targets: TargetComposer;
    revision = 0;
    macros: Macro[] = [];
    #macroAlreadyExecuted = new Set<Macro>();
    #macroDefaultEnabled: WeakMap<Macro, boolean> = new Map();

    // keep these references for performance reasons
    // so that we are not filtering and sorting the array every time
    meta: {
        hotkeyMacros: Macro[];
        hookMacros: Macro[];
    } = {
        hotkeyMacros: [],
        hookMacros: [],
    };

    constructor( targets: TargetComposer, macros?: MacrosDTO ) {
        if ( macros ) {
            this.deserialize( macros );
        }
        this.targets = targets;

        //todo: move this to session store
        targets.setHandler( ":macro", {
            getValue: ( path ) => {
                if ( path[2] !== "enabled" ) {
                    log.warn( `Macro target does not support path ${path.join( "." )}` );
                    return;
                }

                const macro = this.macros.find( ( m ) => m.id === path[1] );

                if ( macro ) {
                    return macro.enabled;
                } else {
                    log.warn( `Macro ${path[1]} not found.` );
                }
            },
            action: ( action, context? ) => {
                const macro = this.macros.find( ( m ) => m.id === action.path[1] );

                if ( !macro ) {
                    log.warn( `Macro ${action.path[1]} not found.` );
                    return;
                }

                if ( action.path[2] === "enabled" ) {
                    macro.enabled = fieldOperation(
                        action.operator,
                        { value: action.value },
                        action.value,
                        this.#macroDefaultEnabled.get( macro )
                    ) as boolean;
                    return;
                } else if ( action.path[2] === "program" ) {
                    if ( action.operator === Operator.Execute ) {
                        this.#execMacro( macro, context );
                    } else if ( action.operator === Operator.SetToDefault ) {
                        this.resetAllActions( macro.id );
                    }
                } else {
                    log.warn(
                        `Macro target does not support path ${action.path.join( "." )}`
                    );
                }
            },
        } );
    }

    add( macro: Macro ) {
        this.macros.push( macro );
    }

    #listenForKeyCombos( type: "keydown" | "keyup" ) {
        const testCombo = new KeyCombo();

        const _keyListener = ( e: KeyboardEvent ) => {
            if ( e.code !== "AltLeft" && e.code !== "F10" ) {
                e.preventDefault();
            }

            if ( testCombo.isIllegal( e ) ) {
                return;
            }
            if ( type == "keyup" ) {
                this.#macroAlreadyExecuted.clear();
            }

            const candidates: Macro[] = [];
            testCombo.set( e );

            for ( const macro of this.meta.hotkeyMacros ) {
                if ( this.#macroAlreadyExecuted.has( macro ) ) {
                    continue;
                }
                const trigger = macro.trigger as HotkeyTrigger;
                if ( trigger.onKeyUp === ( type !== "keyup" ) ) {
                    continue;
                }
                if (
                    trigger.value.test( testCombo ) &&
                    this.#testMacroConditions( macro, e )
                ) {
                    if ( type === "keydown" ) this.#macroAlreadyExecuted.add( macro );
                    candidates.push( macro );
                }
            }

            for ( const macro of candidates ) {
                this.#execMacro( macro );
            }
        };

        window.addEventListener( type, _keyListener );
        return () => window.removeEventListener( type, _keyListener );
    }
    /**
     * Manages listening to hotkey triggers and executing macros.
     * @returns disposable
     */
    listenForKeyCombos() {
        const janitor = new Janitor( "Macros.listenForKeyCombos" );
        janitor.mop( this.#listenForKeyCombos( "keydown" ), "keydown" );
        janitor.mop( this.#listenForKeyCombos( "keyup" ), "keyup" );

        return janitor;
    }

    *[Symbol.iterator]() {
        for ( const macro of this.macros ) {
            yield macro;
        }
    }

    #testCondition( comparator: ConditionComparator, a: any, b: any ) {
        if ( comparator === ConditionComparator.Equals ) {
            return a === b;
        } else if ( comparator === ConditionComparator.NotEquals ) {
            return a !== b;
        } else if ( comparator === ConditionComparator.GreaterThan ) {
            return a > b;
        } else if ( comparator === ConditionComparator.GreaterThanOrEquals ) {
            return a >= b;
        } else if ( comparator === ConditionComparator.LessThan ) {
            return a < b;
        } else if ( comparator === ConditionComparator.LessThanOrEquals ) {
            return a <= b;
        }
        return false;
    }

    #testMacroConditions( macro: Macro, context?: unknown ) {
        for ( const condition of macro.conditions ) {
            const value = this.targets
                .getHandler( condition.path[0] )!
                .getValue( condition.path, condition.value, context );

            //TODO: generalize this
            if ( condition.comparator === ConditionComparator.Execute ) {
                return value;
            }

            if ( !this.#testCondition( condition.comparator, value, condition.value ) ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Executes a macro.
     * @param macro
     * @param context Additional context provided to environment of caller. Usually provided from plugin hook results.
     */
    #execMacro( macro: Macro, context?: unknown ): boolean | undefined {
        if ( !this.#testMacroConditions( macro, context ) ) {
            return false;
        }

        const actions = macro.getActionSequence();
        for ( const action of actions ) {
            if ( action.error ) {
                log.error( action.error.message );
                continue;
            }

            // supports shortcuting (for eg. mouse trigger)
            if ( this.execAction( action, context ) === false ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Executes a macro by Id.
     * @param id
     */
    execMacroById( id: string, context?: unknown ) {
        const macro = this.macros.find( ( m ) => m.id === id );
        if ( macro ) {
            this.#execMacro( macro, context );
        } else {
            log.error( `Macro with id ${id} not found` );
        }
    }

    execAction( action: MacroAction, context?: unknown ): unknown {
        return this.targets.getHandler( action.path[0] )!.action( action, context );
    }

    resetAllActions( macroId: string ) {
        const macro = this.macros.find( ( m ) => m.id === macroId );
        if ( macro ) {
            for ( const action of macro.actions ) {
                this.execAction( { ...action, operator: Operator.SetToDefault } );
            }
        }
    }

    serialize(): MacrosDTO {
        return {
            revision: this.revision,
            macros: this.macros.map( ( macro ) => ( {
                id: macro.id,
                name: macro.name,
                description: macro.description,
                enabled: macro.enabled,
                trigger: {
                    type: macro.trigger.type,
                    value: macro.trigger.serialize(),
                },
                actionSequence: macro.actionSequence,
                actions: macro.actions,
                conditions: macro.conditions,
            } ) ),
        };
    }

    deserialize( macrosDTO: MacrosDTO ) {
        this.revision = macrosDTO.revision;
        this.macros = macrosDTO.macros.map( ( macro ) => {
            let trigger: MacroTrigger = new ManualTrigger();
            if ( macro.trigger.type === TriggerType.Hotkey ) {
                trigger = HotkeyTrigger.deserialize(
                    macro.trigger.value as HotkeyTriggerDTO
                );
            } else if ( macro.trigger.type === TriggerType.WorldEvent ) {
                trigger = WorldEventTrigger.deserialize(
                    macro.trigger.value as WorldEventTriggerDTO
                );
            }
            const newMacro = new Macro(
                macro.id,
                macro.name,
                trigger,
                macro.actions,
                macro.actionSequence,
                macro.conditions
            );
            newMacro.description = macro.description ?? "";
            newMacro.enabled = macro.enabled;
            this.#macroDefaultEnabled.set( newMacro, newMacro.enabled );

            return newMacro;
        } );

        this.meta.hookMacros = this.macros
            .filter( ( m ) => m.trigger instanceof WorldEventTrigger )
            .sort( ( a, b ) => {
                return a.trigger.weight - b.trigger.weight;
            } );

        this.meta.hotkeyMacros = this.macros
            .filter( ( m ) => m.trigger instanceof HotkeyTrigger )
            .sort(
                ( a, b ) =>
                    ( a.trigger as HotkeyTrigger ).weight -
                    ( b.trigger as HotkeyTrigger ).weight
            );
    }
}
