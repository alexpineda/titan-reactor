import {
    PluginMetaData,
    FieldDefinition,
    PluginPackage,
    PluginConfig,
} from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { UI_SYSTEM_CUSTOM_MESSAGE } from "./events";
import { PERMISSION_REPLAY_COMMANDS } from "./permissions";
import throttle from "lodash.throttle";
import { Janitor } from "three-janitor";
import { mix } from "@utils/object-utils";
import { log } from "@ipc/log";
import { PluginBase } from "./plugin-base";
import { SceneController } from "./scene-controller";
import lSet from "lodash.set";

type PluginsConfigSnapshot = Record<
    string,
    Record<string, number | boolean | string | number[]>
>;

export class PluginSystemNative {
    #plugins: PluginBase[] = [];
    #janitor = new Janitor( "PluginSystemNative" );
    #sceneController?: SceneController;

    #permissions = new Map<string, Record<string, boolean>>();
    #sendCustomUIMessage: ( pluginId: string, message: any ) => void;

    [Symbol.iterator]() {
        return this.#plugins[Symbol.iterator]();
    }

    get reduce() {
        return this.#plugins.reduce.bind( this.#plugins );
    }

    loadPlugin(
        pluginPackage: PluginMetaData,
        createCompartment: ( env: unknown ) => {
            globalThis: {
                Function: ( ...args: any[] ) => () => object | PluginBase;
            };
        }
    ) {
        const compartment = createCompartment( {
            PluginBase,
            SceneController,
        } );

        try {
            // temporary object container returned from the plugin
            let plugin = new PluginBase( pluginPackage );

            if ( pluginPackage.nativeSource ) {
                if ( pluginPackage.nativeSource.includes( "export default" ) ) {
                    const Constructor = compartment.globalThis.Function(
                        pluginPackage.nativeSource.replace( "export default", "return" )
                    )();
                    if (
                        typeof Constructor === "function" &&
                        Constructor.prototype instanceof PluginBase
                    ) {
                        plugin = new ( Constructor as new (
                            p: PluginPackage
                        ) => PluginBase )( pluginPackage );
                    } else {
                        throw new Error( "Plugin constructor must extend PluginBase" );
                    }
                } else {
                    plugin = Object.assign(
                        plugin,
                        compartment.globalThis.Function( pluginPackage.nativeSource )()
                    ) as PluginBase;
                }
            }

            plugin.isSceneController = pluginPackage.isSceneController;

            // const permissions = ( pluginPackage.config?.system.permissions ?? [] ).reduce(
            //     ( acc: Record<string, boolean>, permission: string ) => {
            //         if ( VALID_PERMISSIONS.includes( permission ) ) {
            //             acc[permission] = true;
            //         } else {
            //             log.warn(
            //                 `Invalid permission ${permission} for plugin ${pluginPackage.name}`
            //             );
            //         }
            //         return acc;
            //     },
            //     {}
            // );

            this.#permissions.set( pluginPackage.id, {} );

            plugin.sendUIMessage = throttle(
                ( message: any ) => {
                    this.#sendCustomUIMessage( plugin.id, message );
                },
                100,
                { leading: true, trailing: false }
            );

            log.debug( `@plugin-system-native: initialized plugin "${plugin.name}"` );

            return plugin;
        } catch ( e: unknown ) {
            log.error(
                withErrorMessage(
                    e,
                    `@plugin-system: failed to initialize "${pluginPackage.name}"`
                )
            );
        }
    }

    constructor(
        pluginPackages: PluginMetaData[],
        msg: ( id: string, message: any ) => void,
        createCompartment: ( env: any ) => any
    ) {
        this.#plugins = pluginPackages
            .map( ( p ) => this.loadPlugin( p, createCompartment ) )
            .filter( Boolean ) as PluginBase[];
        this.#sendCustomUIMessage = msg;

        this.#janitor.addEventListener(
            window,
            "message",
            "messageListener",
            ( event: {
                data?: {
                    type?: string;
                    payload?: { pluginId: string; message: string };
                };
            } ) => {
                if ( event.data?.type === UI_SYSTEM_CUSTOM_MESSAGE ) {
                    const { pluginId, message } = event.data.payload!;
                    const plugin = this.#plugins.find( ( p ) => p.id === pluginId );
                    if ( plugin ) {
                        try {
                            plugin.onUIMessage && plugin.onUIMessage( message );
                        } catch ( e ) {
                            log.error(
                                withErrorMessage(
                                    e,
                                    `@plugin-system-native: onUIMessage "${plugin.name}"`
                                )
                            );
                        }
                    }
                }
            }
        );
    }

    getAllSceneControllers() {
        return this.#plugins.filter( ( p ) => p.isSceneController ) as SceneController[];
    }

    activateSceneController( plugin: SceneController | undefined ) {
        this.#sceneController = plugin;
    }

    getById( id: string ) {
        return this.#plugins.find( ( p ) => p.id === id );
    }

    getByName( name: string ) {
        return this.#plugins.find( ( p ) => p.name === name );
    }

    dispose() {
        for ( const plugin of this.#plugins ) {
            try {
                plugin.dispose && plugin.dispose();
            } catch ( e ) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onDispose "${plugin.name}"`
                    )
                );
            }
        }
        this.#plugins = [];
    }

    disposePlugin( id: string ) {
        const plugin = this.#plugins.find( ( p ) => p.id === id );
        if ( plugin ) {
            try {
                plugin.dispose && plugin.dispose();
            } catch ( e ) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onDispose "${plugin.name}"`
                    )
                );
            }
            this.#plugins = this.#plugins.filter( ( p ) => p.id !== id );
        }
    }

    isRegularPluginOrActiveSceneController( plugin: PluginBase ) {
        return !plugin.isSceneController || this.#sceneController === plugin;
    }

    hook_onConfigChanged( pluginId: string, config: PluginConfig ) {
        const plugin = this.#plugins.find( ( p ) => p.id === pluginId );

        if ( plugin ) {
            try {
                const oldConfig = { ...plugin.config };
                plugin.rawConfig = config;
                plugin.onConfigChanged &&
                    this.isRegularPluginOrActiveSceneController( plugin ) &&
                    plugin.onConfigChanged( oldConfig );
            } catch ( e ) {
                log.error(
                    withErrorMessage(
                        e,
                        `@plugin-system-native: onConfigChanged "${plugin.name}"`
                    )
                );
            }
        }
    }

    hook_onBeforeRender( delta: number, elapsed: number ) {
        for ( const plugin of this.#plugins ) {
            plugin.onBeforeRender &&
                this.isRegularPluginOrActiveSceneController( plugin ) &&
                plugin.onBeforeRender( delta, elapsed );
        }
    }

    hook_onRender( delta: number, elapsed: number ) {
        for ( const plugin of this.#plugins ) {
            plugin.onRender && plugin.onRender( delta, elapsed );
        }
    }

    hook_onFrame( frame: number, commands: any[] ) {
        for ( const plugin of this.#plugins ) {
            if ( plugin.onFrame && this.isRegularPluginOrActiveSceneController( plugin ) ) {
                if ( this.#permissions.get( plugin.id )?.[PERMISSION_REPLAY_COMMANDS] ) {
                    plugin.onFrame( frame, commands );
                } else {
                    plugin.onFrame( frame );
                }
            }
        }
    }

    enableAdditionalPlugins(
        pluginPackages: PluginMetaData[],
        createCompartment: ( env: any ) => any
    ) {
        const additionalPlugins = pluginPackages
            .map( ( p ) => this.loadPlugin( p, createCompartment ) )
            .filter( Boolean );

        this.#plugins = [ ...this.#plugins, ...additionalPlugins ] as PluginBase[];
    }

    /**
     * Temporarily inject an api into all active plugins.
     */
    injectApi( object: object ) {
        mix( PluginBase.prototype, object );
        const keys = Object.keys( object );

        return () => {
            keys.forEach( ( key ) => {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete PluginBase.prototype[key as keyof typeof PluginBase.prototype];
            } );
        };
    }

    getConfigSnapshot() {
        return this.#plugins.reduce( ( acc, plugin ) => {
            for ( const [ key, field ] of Object.entries( plugin.rawConfig ?? {} ) ) {
                if (
                    key !== "system" &&
                    ( field as FieldDefinition ).value !== undefined
                ) {
                    lSet( acc, [ plugin.name, key ], ( field as FieldDefinition ).value );
                }
            }
            return acc;
        }, {} ) as PluginsConfigSnapshot;
    }

    sessionInit() {
        for ( const plugin of this.#plugins ) {
            try {
                plugin.init && plugin.init();
            } catch ( e ) {
                log.error(
                    withErrorMessage( e, `@plugin-system-native: init "${plugin.name}"` )
                );
            }
        }
    }
}
