import { GameTimeApi } from "./game-time-api";
import { SettingsSessionStore } from "./settings-session-store";
import { borrow, mix } from "@utils/object-utils";
import { createMacrosComposer } from "./macros-composer";
import { WorldEvents } from "./world-events";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import { createPluginSession } from "./create-plugin-session";
import { settingsStore, useSettingsStore } from "@stores/settings-store";
import { OpenBW } from "common/types";
import { WorldEventTrigger } from "@macros/world-event-trigger";
import { Janitor } from "three-janitor";

export type PluginsAndMacroSession = Awaited<
    ReturnType<typeof createPluginsAndMacroSession>
>;

export const createPluginsAndMacroSession = async (
    _events: TypeEmitter<WorldEvents>,
    settings: SettingsSessionStore,
    openBW: OpenBW
) => {
    const macrosComposer = createMacrosComposer( _events, settings );

    const macrosProxy = new TypeEmitterProxy( _events );
    const eventsProxy = new TypeEmitterProxy( _events );

    const hookMacrosToWorldEvents = () => {
        macrosProxy.dispose();

        for ( const macro of macrosComposer.macros.meta.hookMacros ) {
            // only support 1 argument for context so as to not create array objects constantly
            macrosProxy.on(
                ( macro.trigger as WorldEventTrigger ).eventName as keyof WorldEvents,
                ( arg?: any ) => {
                    macrosComposer.macros.execMacroById( macro.id, arg );
                }
            );
        }
    };

    const create = async () => {
        const pluginSession = await createPluginSession( openBW );

        macrosComposer.macros.targets.setHandler( ":plugin", {
            action: ( action ) =>
                pluginSession.store.operate( action, ( path ) => path.slice( 1 ) ),
            getValue: ( path ) => pluginSession.store.getValue( path.slice( 1 ) ),
        } );

        hookMacrosToWorldEvents();

        eventsProxy.on( "selected-units-changed", ( units ) => {
            pluginSession.uiPlugins.onUnitsSelected( units );
        } );

        return {
            ...pluginSession,
            dispose() {
                pluginSession.dispose();
                eventsProxy.dispose();
                macrosProxy.dispose();
                pluginSession.dispose();
            },
        };
    };

    const janitor = new Janitor();
    janitor.add(
        useSettingsStore.subscribe( ( settings ) => {
            if ( settings.data.macros.revision !== macrosComposer.macros.revision ) {
                macrosComposer.macros.deserialize( settings.data.macros );

                hookMacrosToWorldEvents();
            }
        } )
    );

    _events.on( "dispose", () => {
        janitor.dispose();
        macrosComposer.dispose();
    } );

    return {
        session: janitor.mop( await create() ),
        async activate(
            gameTimeApi: GameTimeApi,
            sessionSettings: SettingsSessionStore,
            reload: boolean
        ) {
            if ( reload ) {
                await settingsStore().load();
                this.session.dispose();
                //TODO: implement forget()
                //janitor.forget(this.session);
                this.session = janitor.mop( await create() );
            }

            // macros unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            macrosComposer.setContainer(
                mix( {
                    api: borrow( gameTimeApi ),
                    plugins: borrow( this.session.store.vars ),
                    settings: borrow( sessionSettings.vars ),
                    events: eventsProxy,
                } )
            );

            janitor.mop(
                this.native.injectApi(
                    mix(
                        {
                            settings: sessionSettings.vars,
                            events: eventsProxy,
                        },
                        gameTimeApi
                    )
                ),
                "native.injectApi"
            );

            this.native.sessionInit();
        },
        get native() {
            return this.session.nativePlugins;
        },
        get ui() {
            return this.session.uiPlugins;
        },
    };
};
