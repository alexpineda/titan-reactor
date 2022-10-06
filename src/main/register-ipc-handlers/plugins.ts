import { ipcMain } from "electron";
import { DELETE_PLUGIN, DISABLE_PLUGIN, ENABLE_PLUGINS, INSTALL_PLUGIN, ON_PLUGINS_ENABLED, RELOAD_PLUGINS, UPDATE_PLUGIN_CONFIG } from "common/ipc-handle-names";
import settings from "../settings/singleton";
import browserWindows from "../windows";

ipcMain.handle(UPDATE_PLUGIN_CONFIG, async (_, pluginId, config: any) => {
    return await settings.plugins.savePluginConfig(pluginId, config);
});

ipcMain.handle(DISABLE_PLUGIN, async (_, pluginId) => {

    const pluginNames = await settings.disablePlugins([pluginId]);

    if (pluginNames) {
        browserWindows.main?.webContents.send(DISABLE_PLUGIN, pluginId);
        return true;
    }
    return false;

});

ipcMain.handle(DELETE_PLUGIN, async (_, pluginId) => {
    return await settings.plugins.uninstallPlugin(pluginId);
});

ipcMain.handle(ENABLE_PLUGINS, async (_, pluginIds: string[]) => {
    const plugins = await settings.enablePlugins(pluginIds);

    if (plugins) {

        browserWindows.main?.webContents.send(ON_PLUGINS_ENABLED, plugins);

        return true;
    }

    return false;
});

ipcMain.handle(INSTALL_PLUGIN, async (_, repository) => {
    return await settings.plugins.installPlugin(repository, () => {
        browserWindows.main?.webContents.send(RELOAD_PLUGINS);
    });
});