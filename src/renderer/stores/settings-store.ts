import create from "zustand";
import lSet from "lodash.set";

import { Settings } from "common/types";
import { defaultSettings } from "common/default-settings";
import { LocalStorageAdapter } from "./storage-adapters/localstorage";
import { applySettingsMigrations } from "./migrations/settings/settings-migrations";

const storage = new LocalStorageAdapter();

export type SettingsStore = {
    data: Settings;
    save: ( data: Partial<Settings> ) => Promise<Settings>;
    set: ( data: Partial<Settings> ) => void;
    lset: ( path: string, value: any ) => void;
    init: () => Promise<Settings>;
    initSessionData( type: "replay" | "map", sandbox?: boolean ): void;
};


export const useSettingsStore = create<SettingsStore>( ( set, get ) => ( {
    data: { ...defaultSettings },
    set: ( settings ) => {
        set( ( state ) => ( { data: { ...state.data, ...settings } } ) );
    },
    lset: ( path: string, value: any ) => {
        set( ( state ) => ( { data: lSet( state.data, path, value ) } ) );
    },
    initSessionData( type: Settings["session"]["type"], sandbox = false ) {
        set( {
            data: { ...get().data, session: { ...get().data.session, type, sandbox } },
        } );
    },
    save: async ( _settings: Partial<Settings> = {} ) => {
        const data =  Object.assign( {}, get().data, _settings );
        
        //todo: reimplement
        // const macros = sanitizeMacros( this.#settings.macros, {
        //     data,
        //     activatedPlugins: this.enabledPlugins,
        // } );

        await storage.saveSettings( data );

        get().set( data );

        return data;
    },
    init: async () => {
        const settings = applySettingsMigrations( await storage.loadSettings() );
        await get().save(settings);
        return get().data;
    },
} ) );

export const settingsStore = () => useSettingsStore.getState();
