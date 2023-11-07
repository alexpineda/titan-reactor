import { MacroDTO, MacrosDTO, PluginConfig, Settings } from "common/types";
import { StorageAdapter, createDefaults } from "./settings-adapter";
import defaultMacros from "common/macros/default-macros.json";

export class LocalStorageAdapter implements StorageAdapter {
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

    loadMacros() {
        try {
            const macros = localStorage.getItem( "macros" );
            if ( macros === null ) {
                return {
                    revision: 0,
                    macros: defaultMacros as MacroDTO[],
                };
            }
            return JSON.parse( macros ) as MacrosDTO;
        } catch ( e ) {
            return {
                revision: 0,
                macros: defaultMacros as MacroDTO[],
            }
        }
    }

    saveMacros( macrosDto: MacrosDTO ) {
        try {
            const macros  = JSON.stringify( macrosDto );
            localStorage.setItem( "macros", macros);
        } catch ( e ) {}
        return macrosDto;
    }

}
