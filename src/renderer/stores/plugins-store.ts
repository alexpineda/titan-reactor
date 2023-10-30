import create from "zustand";

import { PluginConfig, PluginMetaData } from "common/types";
import { LocalStorageAdapter } from "./storage-adapters/localstorage";
import { PluginsRepository } from "./plugin-repository";

const storage = new LocalStorageAdapter();
const pluginRepository = new PluginsRepository( storage );

export type PluginsStore = {
    init: () => Promise<void>;
    enablePlugins( pluginIds: string[] ): void;
    disablePlugins( pluginIds: string[] ): void;
    sessionPlugins: PluginMetaData[];
    enabledPlugins: PluginMetaData[];
    plugins: PluginMetaData[];
    savePluginConfig( pluginId: string, settings: PluginConfig ): void;
    update(): void;
    setSessionPlugins( sessionType: "map" | "replay" ): void;
};

/**
 * Reactive data store mostly for updating settings and configuration
 * Instances of the plugins during a game session can be found in 
 * -`create-plugin-session`
 */
export const usePluginsStore = create<PluginsStore>( ( set, get ) => ( {
    sessionPlugins: [],
    enabledPlugins: [],
    plugins: [],
    setSessionPlugins: async (sessionType: "map" | "replay") => {
        set({
            sessionPlugins: sessionType === "map" ? pluginRepository.mapPlugins : pluginRepository.replayPlugins,
        })
    },
    update() {
        set({
            enabledPlugins: pluginRepository.enabledPlugins,
            plugins: pluginRepository.plugins,
        })
    },
    savePluginConfig( pluginId: string, settings: PluginConfig ) {
        pluginRepository.savePluginConfig( pluginId, settings );
        get().update();
        
    },
    enablePlugins: ( pluginIds: string[] ) => {
        pluginRepository.enablePlugins( pluginIds );
        get().update();
    },
    disablePlugins: ( pluginIds: string[] ) => {
        pluginRepository.disablePlugins( pluginIds );
        get().update();

    },
    init: async () => {
        await pluginRepository.init();
        get().update();
    },
} ) );

export const pluginsStore = () => usePluginsStore.getState();
