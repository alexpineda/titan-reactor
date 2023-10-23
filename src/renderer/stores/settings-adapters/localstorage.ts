import { PluginConfig, Settings } from "common/types";
import { SettingsAdapter, createDefaults } from "./settings-adapter";

export class LocalStorageAdapter implements SettingsAdapter {
    loadSettings() {
        try {
            const settings = localStorage.getItem( "settings" );
            if ( settings === null ) {
                return createDefaults();
            }
            return JSON.parse( settings ) as Settings;
        } catch ( e ) {
            return createDefaults();
        }
    }

    saveSettings( settings: Settings ) {
        try {
            localStorage.setItem( "settings", JSON.stringify( settings ) );
        } catch ( e ) {}
    }

    loadPluginSettings( id: string ) {
        try {
            const pluginSettings = localStorage.getItem( `plugin:${id}` );
            if ( pluginSettings === null ) {
                return undefined;
            }
            return JSON.parse( pluginSettings ) as PluginConfig;
        } catch ( e ) {
            return undefined;
        }
    }

    savePluginSettings( id: string, data: PluginConfig ) {
        localStorage.setItem( `plugin:${id}`, JSON.stringify( data ) );
    }
}
