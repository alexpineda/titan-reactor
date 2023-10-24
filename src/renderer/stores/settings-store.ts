import create from "zustand";

import { Settings, SettingsMeta } from "common/types";
import { defaultSettings } from "common/default-settings";
import { SettingsRepository } from "@stores/settings-repository";
import { LocalStorageAdapter } from "./settings-adapters/localstorage";

const settingsRepository = new SettingsRepository( new LocalStorageAdapter() );

export type SettingsStore = SettingsMeta & {
    save: ( data: Partial<Settings> ) => Promise<SettingsMeta>;
    set: ( data: Partial<Settings> ) => void;
    init: () => Promise<SettingsMeta>;
    initSessionData( type: "replay" | "map", sandbox?: boolean ): void;
};


export const useSettingsStore = create<SettingsStore>( ( set, get ) => ( {
    data: { ...defaultSettings },
    phrases: {},
    errors: [],
    activatedPlugins: [],
    deactivatedPlugins: [],
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
        return get();
    },
    init: async () => {
        const settings = await settingsRepository.init();
        set( settings );
        return settings;
    },
} ) );

export const settingsStore = () => useSettingsStore.getState();
