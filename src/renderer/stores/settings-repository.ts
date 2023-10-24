// import { app } from "electron";
import { defaultSettings } from "common/default-settings";
import { Settings as SettingsType, SettingsMeta, PluginConfig } from "common/types";

import { applySettingsMigrations } from "./migrations/settings/settings-migrations";
import { sanitizeMacros } from "common/macros/sanitize-macros";
import { PluginsRepository } from "./plugin-repository";
import { StorageAdapter } from "@stores/storage-adapters/settings-adapter";

// import { DEFAULT_PLUGIN_PACKAGES } from "common/default-settings";
import deepMerge from "deepmerge";
import { arrayOverwriteMerge } from "@utils/object-utils";
import gameStore from "./game-store";
import { withErrorMessage } from "common/utils/with-error-message";

//todo: replace
const log = console;

/**
 * A settings management utility which saves and loads settings from a file.
 * It will also emit a "change" event whenever the settings are loaded or saved.
 */
export class SettingsRepository {
    #storage: StorageAdapter;
    #settings: SettingsType = {
        ...defaultSettings,
    };
    readonly plugins: PluginsRepository;
    #pluginSettings: Record<string, PluginConfig> = {};

    constructor( storage: StorageAdapter ) {
        this.#storage = storage;
        this.plugins = new PluginsRepository();
    }

    //todo: add error handling
    async init() {
        const settings = await this.#storage.loadSettings();
        this.#settings = applySettingsMigrations( settings );

        await this.plugins.fetch( gameStore().pluginRepositoryUrl );

        // todo: deprecate plugin.config
        for ( const plugin of this.plugins.getAllPlugins() ) {
            const userConfig = await this.#storage.loadPluginSettings( plugin.name );

            this.#pluginSettings[plugin.name] = Object.assign(
                plugin.config,
                userConfig
            );

            this.#storage.savePluginSettings( plugin.name, plugin.config );
        }

        await this.save();

        return this.getMeta();
    }

    get() {
        return this.#settings;
    }

    async disablePlugins( pluginIds: string[] ) {
        const plugins = this.enabledPlugins.filter( ( p ) => pluginIds.includes( p.id ) );

        if ( plugins.length ) {
            for ( const plugin of plugins ) {
                await this.savePluginConfig( plugin.id, { ...plugin.config, _enabled: this.plugins.createEnabledOption( false ) } );
            }
            return plugins;
        }
    }

    async enablePlugins( pluginIds: string[] ) {
        const plugins = this.disabledPlugins.filter( ( p ) => pluginIds.includes( p.id ) );

        if ( plugins.length ) {
            for ( const plugin of plugins ) {
                await this.savePluginConfig( plugin.id, { ...plugin.config, _enabled: this.plugins.createEnabledOption( true ) } );
            }
            return plugins;
        }
    }

    get enabledPlugins() {
        return this.plugins.getAllPlugins().filter( ( p ) => p.config._enabled.value );
    }

    get disabledPlugins() {
        return this.plugins.getAllPlugins().filter( ( p ) => !p.config._enabled.value );
    }

    getMeta(): SettingsMeta {
        const errors: string[] = [];

        const macros = sanitizeMacros( this.#settings.macros, {
            data: this.#settings,
            activatedPlugins: this.enabledPlugins,
        } );

        return {
            data: { ...this.#settings, macros },
            errors,
            activatedPlugins: this.enabledPlugins,
            deactivatedPlugins: this.disabledPlugins,
        };
    }

    /**
     * Saves the settings to disk. Will ignore any existing errors.
     * Emits the "change" event.
     * @param settings
     */
    async save( settings: Partial<SettingsType> = {} ) {
        this.#settings = Object.assign( {}, this.#settings, settings );
        this.#settings.macros = sanitizeMacros( this.#settings.macros, {
            data: this.#settings,
            activatedPlugins: this.enabledPlugins,
        } );

        await this.#storage.saveSettings( this.#settings );

        return this.#settings;
    }

    async savePluginConfig( pluginId: string, config: PluginConfig ) {
        const plugin = this.plugins.getAllPlugins().find( ( p ) => p.id === pluginId );
        if ( !plugin ) {
            log.error(
                `@settings/load-plugins: Could not find plugin with id ${pluginId}`
            );
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            plugin.config = deepMerge( plugin.config, config, {
                arrayMerge: arrayOverwriteMerge,
            } );

            await this.#storage.savePluginSettings( plugin.name, plugin.config );
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
