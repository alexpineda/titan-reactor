import { Macros } from "@macros";
import { settingsStore } from "@stores/settings-store";
import { SettingsSessionStore } from "./settings-session-store";
import { Janitor } from "three-janitor";
import { createCompartment } from "@utils/ses-util";
import { globalEvents } from "../global-events";
import { TargetComposer } from "./target-composer";
import { log } from "@ipc/log";
import debounce from "lodash.debounce";
import { MacroAction, Operator } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";

export type MacrosComposer = ReturnType<typeof createMacrosComposer>;

export const createMacrosComposer = ( settings: SettingsSessionStore ) => {
    const janitor = new Janitor( "MacrosComposer" );

    const targets = new TargetComposer();

    targets.setHandler( ":app", {
        action: ( path ) => settings.operate( path, ( path ) => path.slice( 1 ) ),
        getValue: ( path ) => settings.getValue( path.slice( 1 ) ),
    } );

    const macros = new Macros( targets, settingsStore().data.macros );

    janitor.mop( macros.listenForKeyCombos(), "listenForKeyCombos" );

    janitor.mop(
        globalEvents.on( "exec-macro", ( macroId ) => {
            macros.execMacroById( macroId );
        } ),
        "exec-macro"
    );

    janitor.mop(
        globalEvents.on( "reset-macro-actions", ( macroId ) => {
            macros.resetAllActions( macroId );
        } ),
        "exec-macro"
    );

    const debouncedExec = debounce(
        ( action: MacroAction ) => macros.execAction( action ),
        1000
    );

    janitor.mop(
        globalEvents.on( "exec-macro-action", ( { action, withReset } ) => {
            macros.execAction( action );
            if ( withReset ) {
                debouncedExec( { ...action, operator: Operator.SetToDefault } );
            }
        } ),
        "exec-macro"
    );

    return {
        macros,
        setContainer( api: object ) {
            const container = createCompartment( api );

            const actions = new WeakMap<MacroAction, () => void>();

            targets.setHandler( ":function", {
                action: ( action, context ) => {
                    // @ts-expect-error
                    container.globalThis.context = context;

                    try {
                        if ( actions.has( action ) ) {
                            actions.get( action )!();
                        } else {
                            const fn = container.globalThis.Function(
                                action.value as string
                            ) as () => void;
                            actions.set( action, fn );
                            fn();
                        }
                    } catch ( e ) {
                        log.error( withErrorMessage( e, "Error executing macro action" ) );
                    }
                },
                getValue: ( _, value, context ) => {
                    // @ts-expect-error
                    container.globalThis.context = context;
                    try {
                        return container.globalThis.Function( value as string )() as unknown;
                    } catch ( e ) {
                        log.error(
                            withErrorMessage( e, "Error executing macro condition" )
                        );
                        return;
                    }
                },
            } );
        },
        dispose() {
            janitor.dispose();
        },
    };
};
