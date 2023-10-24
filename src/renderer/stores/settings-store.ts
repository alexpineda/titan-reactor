import create from "zustand";

import { Settings, SettingsMeta } from "common/types";
import { defaultSettings } from "common/default-settings";
import { SettingsRepository } from "@stores/settings-repository";
import { LocalStorageAdapter } from "./storage-adapters/localstorage";

const settingsRepository = new SettingsRepository( new LocalStorageAdapter() );

export type SettingsStore = SettingsMeta & {
    save: ( data: Partial<Settings> ) => Promise<Settings>;
    set: ( data: Partial<Settings> ) => void;
    init: () => Promise<SettingsMeta>;
    initSessionData( type: "replay" | "map", sandbox?: boolean ): void;
    enablePlugins( pluginIds: string[] ): void;
    disablePlugins( pluginIds: string[] ): void;
};


export const useSettingsStore = create<SettingsStore>( ( set, get ) => ( {
    data: { ...defaultSettings },
    phrases: {},
    errors: [],
    get activatedPlugins() {
        return settingsRepository.enabledPlugins;
    },
    get deactivatedPlugins() {
        return settingsRepository.disabledPlugins;
    },
    enablePlugins: ( pluginIds: string[] ) => {
        settingsRepository.enablePlugins( pluginIds );
    },
    disablePlugins: ( pluginIds: string[] ) => {
        settingsRepository.disablePlugins( pluginIds )
    },
    set: ( settings ) => {
        set( ( state ) => ( { data: { ...state.data, ...settings } } ) );
    },
    initSessionData( type: SettingsMeta["data"]["session"]["type"], sandbox = false ) {
        set( {
            data: { ...get().data, session: { ...get().data.session, type, sandbox } },
        } );
    },
    save: async ( settings ) => {
        await settingsRepository.save( { ...get().data, ...settings } );
        get().set( settings );
        return get().data;
    },
    init: async () => {
        const settings = await settingsRepository.init();
        set( settings );
        return settings;
    },
} ) );

export const settingsStore = () => useSettingsStore.getState();
