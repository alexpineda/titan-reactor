import PackageJson from "@npmcli/package-json";
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";
import { shell, app } from "electron";
import pacote from "pacote";
import sanitizeFilename from "sanitize-filename";
import deepMerge from "deepmerge";

import { PluginConfig, PluginMetaData, PluginPackage } from "common/types";

import readFolder from "../starcraft/get-files";
import { withErrorMessage } from "common/utils/with-error-message";
import log from "../log";
import { fileExists } from "common/utils/file-exists";
import { transpile } from "../typescript/transpile";
import { DEFAULT_PLUGIN_PACKAGES } from "common/default-settings";
import semver from "semver";
import { arrayOverwriteMerge } from "@utils/object-utils";
import { HostApiVersion, getPluginAPIVersion } from "common/utils/api-version";
import search from "libnpmsearch";

const LIMIT = 1000;
const SEARCH_KEYWORDS = "keywords:titan-reactor-plugin";
const SEARCH_OFFICIAL = "@titan-reactor-plugins";

const loadUtf8 = async (
    filepath: string,
    format: "json" | "text" | "xml" = "text"
): Promise<unknown> => {
    const content = await fsPromises.readFile( filepath, { encoding: "utf8" } );
    if ( format === "json" ) {
        return JSON.parse( content ) as unknown;
    }
    return content;
};

const tryLoadUtf8 = async (
    filepath: string,
    format: "json" | "text" | "xml" = "text"
): Promise<unknown> => {
    try {
        const content = await fsPromises.readFile( filepath, { encoding: "utf8" } );
        if ( format === "json" ) {
            return JSON.parse( content ) as unknown;
        }
        return content;
    } catch ( _ ) {
        return null;
    }
};

/**
 * Interfaces with NPM packages and the file system to load plugins.
 */
export class PluginManager {
    #pluginPackages: PluginMetaData[] = [];
    #pluginDirectory = "";

    getCompatiblePlugins() {
        return this.#pluginPackages.filter(
            ( plugin ) => !this.#isIncompatible( plugin.apiVersion )
        );
    }

    getAllPlugins() {
        return this.#pluginPackages;
    }

    get hasAnyPlugins() {
        return this.#pluginPackages.length > 0;
    }

    /**
     * Reads a plugin directory
     * - Sanity checks on required files
     * - Transpiles native plugin files
     * - Produces a PluginMetaData object
     * @param folderPath
     * @param sanitizedFolderLabel
     * @returns
     */
    async #loadPluginPackage(
        folderPath: string,
        sanitizedFolderLabel: string
    ): Promise<null | PluginMetaData> {
        if ( !( await fileExists( path.join( folderPath, "package.json" ) ) ) ) {
            log.error(
                `@load-plugins/load-plugin-packages: package.json missing - ${sanitizedFolderLabel}`
            );
            return null;
        }
        const packageJSON = ( await loadUtf8(
            path.join( folderPath, "package.json" ),
            "json"
        ) ) as Partial<PluginPackage>;

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

        let pluginNative = null;
        const _pluginHostIndexFile = path.join( folderPath, "host", "index.ts" );
        if ( await fileExists( _pluginHostIndexFile) ) {
            const tsSource = ( await tryLoadUtf8( _pluginHostIndexFile ) ) as
                | string;
            if ( tsSource ) {
                try {
                    const result = transpile(
                        tsSource,
                        packageJSON.name,
                        `${path.basename( folderPath )}.plugin.ts`,
                        true
                    );
                    if ( result.transpileErrors.length ) {
                        log.error(
                            `@load-plugins/load-plugin-packages: Plugin ${sanitizedFolderLabel} transpilation errors: ${result.transpileErrors[0].message} ${result.transpileErrors[0].snippet}`
                        );
                        return null;
                    }
                    pluginNative = result.result.outputText;
                } catch ( e ) {
                    log.error(
                        withErrorMessage(
                            e,
                            `@load-plugins/load-plugin-package: Plugin ${sanitizedFolderLabel} transpilation error`
                        )
                    );
                    return null;
                }
            }
        }
        const readme = ( await tryLoadUtf8( path.join( folderPath, "readme.md" ) ) ) as
            | string
            | null;

        let indexFile = "";
        if ( await fileExists( path.join( folderPath, "ui", "index.jsx" ) ) ) {
            indexFile = "index.jsx";
        } else if ( await fileExists( path.join( folderPath, "ui", "index.tsx" ) ) ) {
            indexFile = "index.tsx";
        }

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

        if (!indexFile && !pluginNative) {
            log.error( `@load-plugins/load-plugin-package: Plugin ${sanitizedFolderLabel} has no host or ui plugin files` );
            return null;
        }

        return {
            id: MathUtils.generateUUID(),
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
            readme: readme ?? undefined,
            indexFile,
            externMethods: getExternMethods( pluginNative ?? "" ),
            isSceneController: ( pluginNative ?? "" ).includes( "onEnterScene" ),
            hooks: [],
            hostIndexFile:  path.join( folderPath, "host", "index.ts" )
        };
    }

    async init( pluginDirectory: string ) {
        this.#pluginPackages = [];
        this.#pluginDirectory = pluginDirectory;
        const folders = await readFolder( pluginDirectory );

        for ( const folder of folders ) {
            if ( !folder.isFolder ) {
                continue;
            }
            const plugin = await this.#loadPluginPackage( folder.path, folder.name );
            if ( plugin === null ) {
                continue;
            }

            log.info(
                `@load-plugins/load-plugin-packages: Loaded plugin ${plugin.name} v${plugin.version}`
            );

            this.#pluginPackages.push( plugin );

            if ( this.#isIncompatible( plugin.apiVersion ) ) {
                log.error(
                    `@load-plugins/load-plugin-packages: Plugin ${
                        plugin.name
                    } requires Titan Reactor API version ${
                        plugin.apiVersion
                    } but the current version is ${HostApiVersion}`
                );
            }
        }
    }

    #isIncompatible( apiVersion: string ) {
        return semver.major( HostApiVersion ) !== semver.major( apiVersion );
    }

    async installDefaultPlugins( onNotify: () => void ) {
        for ( const defaultPackage of DEFAULT_PLUGIN_PACKAGES ) {
            const plugin = await this.downloadPlugin( defaultPackage );
            onNotify();
            if ( plugin ) {
                this.#pluginPackages.push( plugin );
            } else {
                log.error(
                    `@load-plugins/default: Failed to install default plugin ${defaultPackage}`
                );
            }
        }
    }

    async downloadPlugin( repository: string, onUpdated?: () => void ) {
        log.info( `@load-plugins/download-plugin: Downloading plugin ${repository}` );

        try {
            const manifest = await pacote.manifest( repository );
            const folderName = sanitizeFilename( manifest.name.replace( "/", "_" ) );
            const folderPath = path.join( this.#pluginDirectory, folderName );

            await pacote.extract( repository, folderPath );

            try {
                const loadedPackage = await this.#loadPluginPackage(
                    folderPath,
                    folderName
                );

                if ( loadedPackage ) {
                    const pluginToUpdate = this.#pluginPackages.find(
                        ( p ) => p.name === loadedPackage.name
                    );
                    // we are not only downloading but also updating this package
                    if ( pluginToUpdate ) {
                        const oldConfig = pluginToUpdate.config;
                        this.#pluginPackages.splice(
                            this.#pluginPackages.indexOf( pluginToUpdate ),
                            1,
                            loadedPackage
                        );
                        if ( oldConfig ) {
                            await this.savePluginConfig( loadedPackage.id, oldConfig );
                        }
                        onUpdated && onUpdated();
                    }
                    // otherwise this is a fresh install in which plugins get placed in the disabled plugins list
                    else {
                        this.#pluginPackages.push( loadedPackage );
                    }
                }
                return loadedPackage;
            } catch ( e ) {
                log.error(
                    withErrorMessage(
                        e,
                        "@load-plugins/download-plugin: Error loading plugins"
                    )
                );
            }
        } catch ( e ) {
            log.error(
                withErrorMessage(
                    e,
                    `@load-plugins/download-plugin: Error loading plugin ${repository}`
                )
            );
        }

        return null;
    }

    deletePlugin( pluginId: string ) {
        const plugin = this.#pluginPackages.find( ( p ) => p.id === pluginId );
        if ( !plugin ) {
            log.error( `@load-plugins/undelete: Plugin ${pluginId} not found` );
            return;
        }

        log.info( `@load-plugins/undelete: Deleting plugin ${plugin.name}` );

        const delPath = path.join( this.#pluginDirectory, plugin.path );
        try {
            shell.trashItem( delPath );
            this.#pluginPackages = this.#pluginPackages.filter(
                ( otherPlugin ) => otherPlugin.id !== pluginId
            );
        } catch {
            log.error(
                `@load-plugins/delete: Failed to delete plugin ${plugin.name} on folder ${delPath}`
            );
            return false;
        }
        return true;
    }

    async savePluginConfig( pluginId: string, config: PluginConfig ) {
        const pluginConfig = this.#pluginPackages.find( ( p ) => p.id === pluginId );
        if ( !pluginConfig ) {
            log.error(
                `@settings/load-plugins: Could not find plugin with id ${pluginId}`
            );
            return;
        }

        const existingConfigPath = path.join( this.#pluginDirectory, pluginConfig.path );

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const pkgJson = await PackageJson.load( existingConfigPath );

            if ( pluginConfig.config ) {
                pluginConfig.config = deepMerge( pluginConfig.config, config, {
                    arrayMerge: arrayOverwriteMerge,
                } );
            } else {
                pluginConfig.config = config;
            }

            pkgJson.update( {
                config,
            } );
            await pkgJson.save();
        } catch ( e ) {
            log.error(
                withErrorMessage(
                    e,
                    "@save-plugins-config: Error writing plugin package.json"
                )
            );
            return;
        }
    }

    async loadRemoteMetaData( repository: string ) {
        log.info( `@load-plugins/loadRemoteMetaData: ${repository}` );

        try {
            const folderPath = path.join( app.getPath( "temp" ), "TitanReactor" );

            const manifest = await pacote.manifest( repository );
            // delete resolvedFolderPath if it exists
            if ( await fileExists( folderPath ) ) {
                await shell.trashItem( folderPath );
            }
            await pacote.extract( repository, folderPath );

            const folderName = sanitizeFilename( manifest.name.replace( "/", "_" ) );

            try {
                const loadedPackage = await this.#loadPluginPackage(
                    folderPath,
                    folderName
                );

                if ( loadedPackage ) {
                    return loadedPackage;
                } else {
                    throw new Error( "Could not load plugin metadata" );
                }
            } catch ( e ) {
                log.error(
                    withErrorMessage(
                        e,
                        "@load-plugins/loadRemoteMetaData: Error loading plugin"
                    )
                );
            }
        } catch ( e ) {
            log.error(
                withErrorMessage(
                    e,
                    `@load-plugins/loadRemoteMetaData: Error loading plugin ${repository}`
                )
            );
        }

        return null;
    }

    async searchPackages (){
        const officialPackages = await search( SEARCH_OFFICIAL, {
            limit: LIMIT,
        } );

        const publicPackages = (
            await search( SEARCH_KEYWORDS, {
                limit: LIMIT,
            } )
        ).filter( ( pkg ) => !officialPackages.some( ( p ) => p.name === pkg.name ) );

        return [ ...officialPackages, ...publicPackages ];
    };
}

const getExternMethods = ( fn: string ) => {
    const regex = /(externMethod([a-zA-Z0-9_$]+))+/g;
    const matches = fn.match( regex );
    if ( matches ) {
        return [ ...new Set( matches ) ];
    } else {
        return [];
    }
};
