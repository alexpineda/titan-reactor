import { app } from "electron";
import { promises as fsPromises } from "fs";
import path from "path";

import phrases from "common/phrases";
import { defaultSettings } from "common/default-settings";
import { fileExists } from "common/utils/file-exists";
import { Settings as SettingsType, SettingsMeta } from "common/types";

import { findStarcraftPath } from "../starcraft/find-install-path";
import { findMapsPath } from "../starcraft/find-maps-path";
import { findReplaysPath } from "../starcraft/find-replay-paths";
import { foldersExist } from "./folders-exist";
import { doMigrations } from "./migrate";
import { findPluginsPath } from "../starcraft/find-plugins-path";
import log from "../log";
import { sanitizeMacros } from "common/macros/sanitize-macros";
import { logService } from "../logger/singleton";
import { PluginManager } from "../plugins/plugin-manager";
import { setStorageIsCasc, setStoragePath } from "common/casclib";
import uniq from "common/utils/uniq";

const supportedLanguages = [ "en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU" ];

const getEnvLocale = ( env = process.env ) => {
    return env.LC_ALL ?? env.LC_MESSAGES ?? env.LANG ?? env.LANGUAGE;
};

/**
 * Loads the settings.yml file from disk and parses the contents into a JS object.
 * Emits the "change" event.
 */
async function loadJSON<T>( filepath: string ): Promise<T | null> {
    try {
        const contents = await fsPromises.readFile( filepath, {
            encoding: "utf8",
        } );
        const json = JSON.parse( contents ) as T;
        return json;
    } catch ( e ) {
        return null;
    }
}

/**
 * A settings management utility which saves and loads settings from a file.
 * It will also emit a "change" event whenever the settings are loaded or saved.
 */
export class Settings {
    #settings: SettingsType = {
        ...defaultSettings,
    };
    #filepath = "";
    readonly plugins = new PluginManager();

    get activatedPlugins() {
        return this.plugins
            .getCompatiblePlugins()
            .filter( ( p ) => this.#settings.plugins.activated.includes( p.name ) );
    }

    get deactivatedPlugins() {
        return this.plugins
            .getAllPlugins()
            .filter( ( p ) => !this.#settings.plugins.activated.includes( p.name ) );
    }

    /**
     * Loads the existing settings file from disk.
     * It will migrate the settings if they are not compatible with the current version.
     * It will create a new settings file if it does not exist.
     * @param filepath
     */
    async init( filepath: string ) {
        this.#filepath = filepath;
        await this.initialize();
    }

    async initialize() {
        this.#settings = doMigrations(
            ( await loadJSON<SettingsType>( this.#filepath ) ) ??
                ( await this.createDefaults() )
        );

        await this.plugins.init( this.#settings.directories.plugins );

        if ( !this.plugins.hasAnyPlugins ) {
            await this.plugins.installDefaultPlugins( () => {} );
                // browserWindows.main?.webContents.send( ON_PLUGINS_INITIAL_INSTALL_LOCAL )
            

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if ( !this.plugins.hasAnyPlugins ) {
                log.error( "@load-plugins/default: Failed to install default plugins" );
                // browserWindows.main?.webContents.send( ON_PLUGINS_INITIAL_INSTALL_ERROR_LOCAL );
            }
        }

        await this.save();
    }

    get() {
        return this.#settings;
    }

    async deactivePlugins( pluginIds: string[] ) {
        const plugins = this.activatedPlugins.filter( ( p ) => pluginIds.includes( p.id ) );
        const pluginNames = plugins.map( ( p ) => p.name );

        if ( plugins.length ) {
            await this.save( {
                plugins: {
                    ...this.#settings.plugins,
                    activated: this.#settings.plugins.activated.filter(
                        ( p ) => !pluginNames.includes( p )
                    ),
                },
            } );

            return plugins;
        }
    }

    async isCascStorage() {
        return await foldersExist( this.#settings.directories.starcraft, [
            "Data",
            "locales",
        ] );
    }

    async activatePlugins( pluginIds: string[] ) {
        const plugins = this.deactivatedPlugins.filter( ( p ) => pluginIds.includes( p.id ) );

        if ( plugins.length ) {
            await this.save( {
                plugins: {
                    ...this.#settings.plugins,
                    activated: uniq([
                        ...this.#settings.plugins.activated,
                        ...plugins.map( ( p ) => p.name ),
                    ]),
                },
            } );

            return plugins;
        }
    }

    async getMeta(): Promise<SettingsMeta> {
        const errors = [];
        const files = [ "plugins" ];

        for ( const file of files ) {
            if (
                !( await fileExists(
                    this.#settings.directories[
                        file as keyof SettingsType["directories"]
                    ]
                ) )
            ) {
                errors.push( `${file} directory is not a valid path. ` );
            }
        }

        const isBareDirectory = await foldersExist(
            this.#settings.directories.starcraft,
            [ "anim", "arr" ]
        );
        if ( !( await this.isCascStorage() ) ) {
            if (
                await fileExists(
                    path.join( this.#settings.directories.starcraft, "STARDAT.MPQ" )
                )
            ) {
                errors.push(
                    "The StarCraft directory is not a valid path. Your configuration might be pointing to StarCraft 1.16 version which is not supported."
                );
            } else if ( !isBareDirectory ) {
                errors.push( "The StarCraft directory is not a valid path." );
            }
        }

        const localLanguage = supportedLanguages.includes( getEnvLocale()! )
            ? getEnvLocale()!
            : "en-US";
        this.#settings.language = supportedLanguages.includes( this.#settings.language )
            ? this.#settings.language
            : localLanguage;

        const macros = sanitizeMacros(
            this.#settings.macros,
            {
                data: this.#settings,
                activatedPlugins: this.activatedPlugins,
            },
            logService
        );

        return {
            data: { ...this.#settings, macros },
            errors,
            isCascStorage: await this.isCascStorage(),
            initialInstall: false,
            activatedPlugins: this.activatedPlugins,
            deactivatedPlugins: this.deactivatedPlugins,
            phrases: {
                ...phrases["en-US"],
                ...phrases[this.#settings.language as keyof typeof phrases],
            },
        };
    }

    /**
     * Saves the settings to disk. Will ignore any existing errors.
     * Emits the "change" event.
     * @param settings
     */
    async save( settings: Partial<SettingsType> = {} ) {
        this.#settings = Object.assign( {}, this.#settings, settings );
        this.#settings.plugins.activated = [ ...new Set( this.#settings.plugins.activated ) ];
        this.#settings.macros = sanitizeMacros(
            this.#settings.macros,
            {
                data: this.#settings,
                activatedPlugins: this.activatedPlugins,
            },
            logService
        );

        await fsPromises.writeFile(
            this.#filepath,
            JSON.stringify( this.#settings, null, 4 ),
            {
                encoding: "utf8",
            }
        );

        setStorageIsCasc( await this.isCascStorage() );
        setStoragePath( this.#settings.directories.starcraft );

        return this.#settings;
    }

    /**
     * Creates default settings for the user.
     * @returns a JS object with default settings
     */
    async createDefaults(): Promise<SettingsType> {
        return {
            ...defaultSettings,
            language:
                supportedLanguages.find( ( s ) => s === String( getEnvLocale() ) ) ?? "en-US",
            directories: {
                starcraft: await findStarcraftPath(),
                maps: await findMapsPath(),
                replays: await findReplaysPath(),
                assets: app.getPath( "documents" ),
                plugins: await findPluginsPath(),
            },
        };
    }
}
