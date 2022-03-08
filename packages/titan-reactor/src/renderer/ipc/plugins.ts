import { ipcRenderer } from "electron";

import { DELETE_PLUGIN, DISABLE_PLUGIN, ENABLE_PLUGIN, UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";

export const updatePluginsConfig = async (pluginId: string, config: any) => {
    return await ipcRenderer.invoke(UPDATE_PLUGIN_CONFIG, pluginId, config);
}

export const disablePlugin = async (pluginId: string) => {
    return await ipcRenderer.invoke(DISABLE_PLUGIN, pluginId);
}

export const deletePlugin = async (pluginId: string) => {
    return await ipcRenderer.invoke(DELETE_PLUGIN, pluginId);
}

export const enablePlugin = async (pluginId: string) => {
    return await ipcRenderer.invoke(ENABLE_PLUGIN, pluginId);
}