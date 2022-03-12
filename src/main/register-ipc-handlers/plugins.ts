import { ipcMain } from "electron";

import settings from "../settings/singleton"
import { DELETE_PLUGIN, DISABLE_PLUGIN, ENABLE_PLUGINS, INSTALL_PLUGIN, UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";
import { disablePlugin, enablePlugins, installPlugin, savePluginsConfig, uninstallPlugin } from "../plugins/load-plugins";

ipcMain.handle(UPDATE_PLUGIN_CONFIG, async (_, pluginId, config: any) => {
    return await savePluginsConfig(settings.get().directories.plugins, pluginId, config);
});

ipcMain.handle(DISABLE_PLUGIN, async (_, pluginId) => {
    return await disablePlugin(pluginId);
});

ipcMain.handle(DELETE_PLUGIN, async (_, pluginId) => {
    return await uninstallPlugin(pluginId);
});

ipcMain.handle(ENABLE_PLUGINS, async (_, pluginIds: string[]) => {
    return await enablePlugins(pluginIds);
});

ipcMain.handle(INSTALL_PLUGIN, async (_, repository) => {
    return await installPlugin(repository);
});