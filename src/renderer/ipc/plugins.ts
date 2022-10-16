import { ipcRenderer } from "electron";

import {
    DELETE_PLUGIN,
    DISABLE_PLUGIN,
    ENABLE_PLUGINS,
    INSTALL_PLUGIN,
    UPDATE_PLUGIN_CONFIG,
} from "common/ipc-handle-names";
import { PluginMetaData } from "common/types";

export const savePluginsConfig = async ( pluginId: string, config: any ) => {
    return await ipcRenderer.invoke( UPDATE_PLUGIN_CONFIG, pluginId, config );
};

export const disablePlugin = async ( pluginId: string ) => {
    return await ipcRenderer.invoke( DISABLE_PLUGIN, pluginId );
};

export const deletePlugin = async ( pluginId: string ) => {
    return await ipcRenderer.invoke( DELETE_PLUGIN, pluginId );
};

export const enablePlugins = async ( pluginIds: string[] ) => {
    return await ipcRenderer.invoke( ENABLE_PLUGINS, pluginIds );
};

export const installPlugin = async (
    repository: string
): Promise<null | PluginMetaData> => {
    return await ipcRenderer.invoke( INSTALL_PLUGIN, repository );
};
