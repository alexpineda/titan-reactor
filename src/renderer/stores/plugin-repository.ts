import path from "path";
import { PluginMetaData, PluginPackage } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { getPluginAPIVersion } from "common/utils/api-version";

const log = console;

/**
 * Interfaces with NPM packages and the file system to load plugins.
 */
export class PluginsRepository {
    #pluginPackages: PluginMetaData[] = [];
    repositoryUrl = "";

    getAllPlugins() {
        return this.#pluginPackages;
    }

    get hasAnyPlugins() {
        return this.#pluginPackages.length > 0;
    }

    //todo: do this at build time
    async #loadPluginPackage(
        pluginRootUrl: string,
        sanitizedFolderLabel: string
    ): Promise<null | PluginMetaData> {
        const packageJSON = await fetch( `${pluginRootUrl}/package.json` )
            .then( ( r ) => r.json() as Partial<PluginPackage> )
            .catch( ( e ) => {
                log.error(
                    withErrorMessage(
                        e,
                        `@load-plugins/load-plugin-packages: Could not load package.json - ${sanitizedFolderLabel}`
                    )
                );
                return null;
            } );

        if ( !packageJSON ) {
            return null;
        }

        if ( packageJSON.name === undefined ) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin name - ${sanitizedFolderLabel}`
            );
            return null;
        }

        if ( packageJSON.version === undefined ) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin version - ${sanitizedFolderLabel}`
            );
            return null;
        }

        const pluginNative = await fetch( `${pluginRootUrl}/host.js` )
            .then( ( r ) => r.text() )
            .catch( () => null );

        const indexFile = await fetch( `${pluginRootUrl}/ui.js` )
            .then( ( r ) => r.text() )
            .catch( () => "" );

        const readme = await fetch( `${pluginRootUrl}/readme.md` )
            .then( ( r ) => r.text() )
            .catch( () => undefined );

        const config = packageJSON.config ?? {};
        if ( typeof config._visible !== "object" ) {
            if ( indexFile ) {
                Object.assign( config, {
                    _visible: { value: true, label: "UI Visible", folder: "System" },
                } );
            } else {
                delete config._visible;
            }
        }

        if ( !indexFile && !pluginNative ) {
            log.error(
                `@load-plugins/load-plugin-package: Plugin ${sanitizedFolderLabel} has no host or ui plugin files`
            );
            return null;
        }

        return {
            id: packageJSON.name, // MathUtils.generateUUID(), We used to have this to help protect individual plugins, will revisit later
            name: packageJSON.name,
            version: packageJSON.version,
            description: packageJSON.description,
            author: packageJSON.author,
            repository: packageJSON.repository,
            keywords: packageJSON.keywords ?? [],
            apiVersion: getPluginAPIVersion( packageJSON ),
            path: sanitizedFolderLabel,
            config,
            nativeSource: pluginNative,
            indexFile,
            isSceneController: ( pluginNative ?? "" ).includes( "onEnterScene" ),
            readme,
        };
    }

    async init( rootUrl: string ) {
        this.repositoryUrl = rootUrl;
        this.#pluginPackages = [];

        //todo: load plugins
        const plugins = await fetch( `${rootUrl}/index.json` )
            .then( ( r ) => r.json() as Promise<string[]> )
            .catch( () => [] );

        for ( const plugin of plugins ) {
            const pluginPackage = await this.#loadPluginPackage(
                rootUrl + "/" + plugin,
                plugin
            );
            if ( pluginPackage ) {
                this.#pluginPackages.push( pluginPackage );
            }
        }
    }
}
