import { log } from "@ipc/log";
import { PluginSystemNative } from "@plugins/plugin-system-native";
import { settingsStore } from "@stores/settings-store";
import { Janitor } from "three-janitor";
import lGet from "lodash.get";
import lSet from "lodash.set";
import { createDeepStore } from "@stores/deep-store";
import { createOperatableStore, MutationVariable } from "@stores/operatable-store";
import { PluginSystemUI } from "@plugins/plugin-system-ui";
import { UI_SYSTEM_PLUGIN_CONFIG_CHANGED } from "@plugins/events";
import { PluginBase } from "@plugins/plugin-base";
import { SourceOfTruth } from "@stores/source-of-truth";
import { FieldDefinition } from "common/types";

export type PluginVariables = Record<
    string,
    Record<string, MutationVariable | ( ( ...args: any[] ) => any )>
>;

/**
 * An api that allows the consumer to modify plugin values and have the system respond.
 */
export const createPluginSessionStore = (
    plugins: PluginSystemNative,
    uiPlugins: PluginSystemUI
) => {
    const janitor = new Janitor( "ReactivePluginApi" );

    const sourceOfTruth = new SourceOfTruth( plugins.getConfigSnapshot() );
    const sessionStore = createDeepStore( {
        initialState: sourceOfTruth.clone(),
        validateMerge: ( _, __, path ) => {
            // merged from source of truth
            if ( path === undefined ) {
                return true;
            }
            const plugin = plugins.getByName( path[0] );

            if ( !plugin ) {
                log.error( `@validate-merge: Plugin ${path[0]} not found` );
                return false;
            }

            if ( !plugins.isRegularPluginOrActiveSceneController( plugin ) ) {
                return false;
            }

            if ( !plugin.configExists ) {
                return false;
            }

            const field = plugin.getFieldDefinition( path[1] );

            if ( field === undefined ) {
                return false;
            }

            return true;
        },
        onUpdate: ( _, __, path, value ) => {
            // merged from source of truth
            if ( path === undefined ) {
                return;
            }

            const plugin = plugins.getByName( path[0] )!;

            plugins.hook_onConfigChanged(
                plugin.id,
                lSet( plugin.rawConfig!, [path[1], "value"], value )
            );

            uiPlugins.sendMessage( {
                type: UI_SYSTEM_PLUGIN_CONFIG_CHANGED,
                payload: {
                    pluginId: plugin.id,
                    config: plugin.config,
                },
            } );
        },
    } );

    const getValue = ( path: string[] ) =>
        lGet( plugins.getByName( path[0] )?.rawConfig ?? {}, path[1] ) as
            | FieldDefinition
            | undefined;

    const store = createOperatableStore( sessionStore, sourceOfTruth, getValue );

    const vars = plugins.reduce( ( acc, plugin ) => {
        Object.keys( plugin.rawConfig ?? {} ).forEach( ( key ) => {
            if ( key !== "system" ) {
                const compKey = [plugin.name, key];
                lSet( acc, compKey, store.createVariable( compKey ) );
            }
        } );

        // callables
        (
            settingsStore().enabledPlugins.find( ( p ) => p.id === plugin.id )
                ?.externMethods ?? []
        ).map( ( method ) => {
            lSet( acc, [plugin.name, method], ( ...args: any[] ) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                plugin[method as keyof PluginBase]( ...args )
            );
        } );

        return acc;
    }, {} );

    return {
        ...store,
        vars,
        dispose: () => janitor.dispose(),
    };
};
