import { defaultSettings } from "common/default-settings";
import {  MacrosDTO, PluginConfig, Settings } from "common/types";

export interface StorageAdapter {
    loadSettings(): Promise<Settings> | Settings;

    saveSettings( settings: Settings ): Promise<void> | void;

    loadPluginSettings(
        id: string
    ): Promise<PluginConfig | undefined> | ( PluginConfig | undefined );

    savePluginSettings( id: string, value: PluginConfig ): Promise<void> | void;

    loadMacros(
        id: string
    ): Promise<MacrosDTO | undefined> | ( MacrosDTO | undefined );

    saveMacros( macros: MacrosDTO ): Promise<MacrosDTO> | MacrosDTO;
}

export const supportedLanguages = [ "en-US", "es-ES", "ko-KR", "pl-PL", "ru-RU" ];

export const createDefaults: () => Settings = () => {
    return {
        ...defaultSettings,
        language:
            supportedLanguages.find( ( s ) => s === String( getEnvLocale() ) ) ?? "en-US",
    };
};

export const getEnvLocale = () => navigator.language;

export const localLanguage = supportedLanguages.includes( getEnvLocale()! )
    ? getEnvLocale()!
    : "en-US";
