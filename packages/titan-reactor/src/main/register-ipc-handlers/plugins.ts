import { ipcMain } from "electron";

import settings from "../settings/singleton"
import { DELETE_PLUGIN, DISABLE_PLUGIN, ENABLE_PLUGIN, UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";
import { disablePlugin, enablePlugin, savePluginsConfig, uninstallPlugin } from "../settings/load-plugins";

ipcMain.handle(UPDATE_PLUGIN_CONFIG, async (_, pluginId, config: any) => {
    return await savePluginsConfig(settings.get().directories.plugins, pluginId, config);
});

ipcMain.handle(DISABLE_PLUGIN, async (_, pluginId) => {
    return await disablePlugin(pluginId);
});

ipcMain.handle(DELETE_PLUGIN, async (_, pluginId) => {
    return await uninstallPlugin(pluginId);
});

ipcMain.handle(ENABLE_PLUGIN, async (_, pluginId) => {
    return await enablePlugin(pluginId);
});