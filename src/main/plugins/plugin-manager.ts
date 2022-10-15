import PackageJson from "@npmcli/package-json";
import path from "path";
import { MathUtils } from "three";
import { promises as fsPromises } from "fs";
import { shell } from "electron";
import pacote from "pacote";
import sanitizeFilename from "sanitize-filename";
import deepMerge from "deepmerge";

import { PluginMetaData, PluginPackage } from "common/types";

import readFolder from "../starcraft/get-files";
import { withErrorMessage } from "common/utils/with-error-message";
import log from "../log";
import { fileExists } from "common/utils/file-exists";
import { transpile } from "../transpile";
import { DEFAULT_PLUGIN_PACKAGES } from "common/default-settings";
import packagejson from "../../../package.json";
import semver from "semver";

const loadUtf8 = async (
    filepath: string,
    format: "json" | "text" | "xml" = "text"
): Promise<object | string> => {
    const content = await fsPromises.readFile( filepath, { encoding: "utf8" } );
    if ( format === "json" ) {
        return JSON.parse( content );
    }
    return content;
};

const tryLoadUtf8 = async (
    filepath: string,
    format: "json" | "text" | "xml" = "text"
): Promise<any | null> => {
    try {
        const content = await fsPromises.readFile( filepath, { encoding: "utf8" } );
        if ( format === "json" ) {
            return JSON.parse( content );
        }
        return content;
    } catch ( _ ) {
        return null;
    }
};

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

    async #loadPluginPackage(
        folderPath: string,
        folderName: string
    ): Promise<null | PluginMetaData> {
        if ( !( await fileExists( path.join( folderPath, "package.json" ) ) ) ) {
            log.error(
                `@load-plugins/load-plugin-packages: package.json missing - ${folderName}`
            );
            return null;
        }
        const packageJSON = ( await loadUtf8(
            path.join( folderPath, "package.json" ),
            "json"
        ) ) as PluginPackage;
        let pluginNative = null;
        if ( await fileExists( path.join( folderPath, "plugin.ts" ) ) ) {
            const tsSource = ( await tryLoadUtf8( path.join( folderPath, "plugin.ts" ) ) ) as
                | string
                | null;
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
                            `@load-plugins/load-plugin-packages: Plugin ${folderName} transpilation errors: ${result.transpileErrors[0].message} ${result.transpileErrors[0].snippet}`
                        );
                        return null;
                    }
                    pluginNative = result.result.outputText;
                } catch ( e ) {
                    log.error(
                        withErrorMessage(
                            e,
                            `@load-plugins/load-plugin-package: Plugin ${folderName} transpilation error`
                        )
                    );
                    return null;
                }
            }
        } else if ( await fileExists( path.join( folderPath, "plugin.js" ) ) ) {
            pluginNative = ( await tryLoadUtf8( path.join( folderPath, "plugin.js" ) ) ) as
                | string
                | null;
            if ( pluginNative === null ) {
                log.error(
                    `@load-plugins/load-plugin-packages: Plugin ${folderName} failed to load plugin.js`
                );
                return null;
            }
        }
        const readme = ( await tryLoadUtf8( path.join( folderPath, "readme.md" ) ) ) as
            | string
            | null;

        let indexFile = "";
        if ( await fileExists( path.join( folderPath, "index.jsx" ) ) ) {
            indexFile = "index.jsx";
        } else if ( await fileExists( path.join( folderPath, "index.tsx" ) ) ) {
            indexFile = "index.tsx";
        }

        if ( packageJSON.name === undefined ) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin name - ${folderName}`
            );
            return null;
        }

        if ( packageJSON.version === undefined ) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin version - ${folderName}`
            );
            return null;
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

        return {
            id: MathUtils.generateUUID(),
            name: packageJSON.name,
            version: packageJSON.version,
            description: packageJSON.description,
            author: packageJSON.author,
            repository: packageJSON.repository,
            keywords: packageJSON.keywords ?? [],
            apiVersion: packageJSON.peerDependencies?.["titan-reactor-api"] ?? "1.0.0",
            path: folderName,
            config,
            nativeSource: pluginNative,
            readme: readme ?? undefined,
            indexFile,
            externMethods: getExternMethods( pluginNative ?? "" ),
            isSceneController: ( pluginNative ?? "" ).includes( "onEnterScene" ),
            hooks: packageJSON.config?.system?.customHooks ?? [],
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
                    `@load-plugins/load-plugin-packages: Plugin ${plugin.name} requires Titan Reactor API version ${plugin.apiVersion} but the current version is ${packagejson.config["titan-reactor-api"]}`
                );
            }
        }
    }

    #isIncompatible( apiVersion: string ) {
        return (
            semver.major( packagejson.config["titan-reactor-api"] ) !==
            semver.major( apiVersion )
        );
    }

    async installDefaultPlugins( onNotify: () => void ) {
        for ( const defaultPackage of DEFAULT_PLUGIN_PACKAGES ) {
            const plugin = await this.installPlugin( defaultPackage );
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

    async installPlugin( repository: string, onUpdated?: () => void ) {
        log.info( `@load-plugins/install-plugin: Installing plugin ${repository}` );

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
                    // we are not only installing but also updating this package
                    if ( pluginToUpdate ) {
                        const oldConfig = pluginToUpdate.config;
                        this.#pluginPackages.splice(
                            this.#pluginPackages.indexOf( pluginToUpdate ),
                            1,
                            loadedPackage
                        );
                        await this.savePluginConfig( loadedPackage.id, oldConfig );
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
                        "@load-plugins/install-plugin: Error loading plugins"
                    )
                );
            }
        } catch ( e ) {
            log.error(
                withErrorMessage(
                    e,
                    `@load-plugins/install-plugin: Error loading plugin ${repository}`
                )
            );
        }

        return null;
    }

    async uninstallPlugin( pluginId: string ) {
        const plugin = this.#pluginPackages.find( ( p ) => p.id === pluginId );
        if ( !plugin ) {
            log.error( `@load-plugins/uninstall: Plugin ${pluginId} not found` );
            return;
        }

        log.info( `@load-plugins/uninstall: Uninstalling plugin ${plugin.name}` );

        const delPath = path.join( this.#pluginDirectory, plugin.path );
        try {
            shell.trashItem( delPath );
            this.#pluginPackages = this.#pluginPackages.filter(
                ( otherPlugin ) => otherPlugin.id !== pluginId
            );
        } catch {
            log.error(
                `@load-plugins/uninstall: Failed to delete plugin ${plugin.name} on folder ${delPath}`
            );
            return false;
        }
        return true;
    }

    async savePluginConfig( pluginId: string, config: any ) {
        const pluginConfig = this.#pluginPackages.find( ( p ) => p.id === pluginId );
        if ( !pluginConfig ) {
            log.error(
                `@settings/load-plugins: Could not find plugin with id ${pluginId}`
            );
            return;
        }

        const existingConfigPath = path.join( this.#pluginDirectory, pluginConfig.path );

        try {
            const pkgJson = await PackageJson.load( existingConfigPath );
            const overwriteMerge = ( _: any, sourceArray: any ) => sourceArray;

            if ( pluginConfig.config ) {
                pluginConfig.config = deepMerge( pluginConfig.config, config, {
                    arrayMerge: overwriteMerge,
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
}

const getExternMethods = ( fn: string ) => {
    const regex = /(externMethod([a-zA-Z0-9_$]+))+/g;
    const matches = fn.match( regex );
    if ( matches ) {
        return [...new Set( matches )];
    } else {
        return [];
    }
};
