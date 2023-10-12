import create from "zustand";

import { Settings, SettingsMeta } from "common/types";
import { defaultSettings } from "common/default-settings";
import { getSettings as invokeGetSettings, saveSettings } from "../ipc";

export type SettingsStore = SettingsMeta & {
    save: ( data: Partial<Settings> ) => Promise<SettingsMeta>;
    set: ( data: Partial<Settings> ) => void;
    load: () => Promise<SettingsMeta>;
    setSession( type: string, sandbox?: boolean ): void;
};

export const useSettingsStore = create<SettingsStore>( ( set, get ) => ( {
    data: { ...defaultSettings },
    phrases: {},
    isCascStorage: false,
    errors: [],
    activatedPlugins: [],
    deactivatedPlugins: [],
    pluginsMetadata: [],
    initialInstall: false,
    set: ( settings ) => {
        set( ( state ) => ( { data: { ...state.data, ...settings } } ) );
    },
    setSession( type: SettingsMeta["data"]["session"]["type"], sandbox = false ) {
        set( {
            data: { ...get().data, session: { ...get().data.session, type, sandbox } },
        } );
    },
    save: async ( settings ) => {
        await saveSettings( { ...get().data, ...settings } );
        return await get().load();
    },
    load: async () => {
        const settings = await invokeGetSettings();
        set( settings );
        return settings;
    },
} ) );

export const settingsStore = () => useSettingsStore.getState();
