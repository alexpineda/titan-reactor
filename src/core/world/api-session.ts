import { GameTimeApi } from "./game-time-api";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer, MacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world-events";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import { createPluginSession, PluginSession } from "./create-plugin-session";
import { useMacroStore, useSettingsStore } from "@stores/settings-store";

import { WorldEventTrigger } from "@macros/world-event-trigger";
import { Janitor } from "three-janitor";
import { World } from "./world";

/**
 * A container for plugin and macro session which can be easily disposed of.
 */
export class ApiSession {
    #macrosProxy?: TypeEmitterProxy<WorldEvents>;

    #plugins!: PluginSession;
    #macros!: MacrosComposer;

    #events!: WeakRef<TypeEmitter<WorldEvents>>;

    #janitor!: Janitor;

    async activate(
        { events, openBW, settings }: World,
        gameTimeApi: GameTimeApi
    ) {
        this.#janitor = new Janitor();

        this.#events = new WeakRef( events );
        const eventsProxy = this.#janitor.mop( new TypeEmitterProxy( events ) );
        const customEvents = this.#janitor.mop( new TypeEmitter() );

        this.#plugins = this.#janitor.mop( await createPluginSession( openBW, events, {
            settings: settings.vars,
            events: eventsProxy,
            customEvents,
            game: gameTimeApi
        } ) );

        this.#macros = this.#janitor.mop( createMacrosComposer( settings ) );
        

        this.#macros.macros.targets.setHandler( ":plugin", {
            action: ( action ) =>
                this.#plugins.store.operate( action, ( path ) => path.slice( 1 ) ),
            getValue: ( path ) => this.#plugins.store.getValue( path.slice( 1 ) ),
        } );

        this.#hookMacrosToWorldEvents();

        this.#janitor.add(
            useMacroStore.subscribe( ( store ) => {
                if ( store.macros.revision !== this.#macros.macros.revision ) {
                    this.#macros.macros.deserialize( store.macros );

                    this.#hookMacrosToWorldEvents();
                }
            } )
        );

        // macros unsafe api additionally allows access to plugin configurations
        // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
        this.#macros.setContainer(
            mix( {
                api: gameTimeApi,
                plugins: borrow( this.#plugins.store.vars ),
                settings: borrow( settings.vars ),
                events: eventsProxy,
                customEvents,
            } )
        );

        this.native.useTryCatchOnHooks =
            useSettingsStore.getState().data.utilities.debugMode;
        this.#janitor.mop(
            useSettingsStore.subscribe( ( settings ) => {
                this.native.useTryCatchOnHooks = settings.data.utilities.debugMode;
            } )
        );

        this.native.sessionInit();
    }

    /**
     * Native plugins
     */
    get native() {
        return this.#plugins.nativePlugins;
    }

    /**
     * UI plugins
     */
    get ui() {
        return this.#plugins.uiPlugins;
    }

    dispose() {
        this.#janitor.dispose();
        if ( this.#macrosProxy ) {
            this.#macrosProxy.dispose();
        }
    }

    /**
     * All macros that have world event triggers are registered here.
     */
    #hookMacrosToWorldEvents() {
        if ( this.#macrosProxy ) {
            this.#macrosProxy.dispose();
        }
        this.#macrosProxy = new TypeEmitterProxy( this.#events.deref()! );

        for ( const macro of this.#macros.macros.meta.hookMacros ) {
            // only support 1 argument for context so as to not create array objects constantly
            this.#macrosProxy.on(
                ( macro.trigger as WorldEventTrigger ).eventName as keyof WorldEvents,
                ( arg?: any ) => {
                    this.#macros.macros.execMacroById( macro.id, arg );
                }
            );
        }
    }
}
