import { ipcMain } from "electron";
import {
    DELETE_PLUGIN_REMOTE,
    DEACTIVATE_PLUGIN,
    ACTIVATE_PLUGINS_REMOTE,
    DOWNLOAD_PLUGIN as DOWNLOAD_PLUGIN,
    LOAD_REMOTE_PLUGIN_METADATA,
    ON_PLUGINS_ACTIVATED_LOCAL,
    RELOAD_PLUGINS_LOCAL,
    SAVE_PLUGIN_CONFIG_REMOTE,
    SEARCH_NPM_PACKAGES_REMOTE,
} from "common/ipc-handle-names";
import settings from "../settings/singleton";
import browserWindows from "../windows";
import { PluginConfig } from "common/types";

ipcMain.handle(
    SAVE_PLUGIN_CONFIG_REMOTE,
    async ( _, pluginId: string, config: PluginConfig ) => {
        return await settings.plugins.savePluginConfig( pluginId, config );
    }
);

ipcMain.handle( DEACTIVATE_PLUGIN, async ( _, pluginId: string ) => {
    const pluginNames = await settings.deactivePlugins( [ pluginId ] );

    if ( pluginNames ) {
        browserWindows.main?.webContents.send( DEACTIVATE_PLUGIN, pluginId );
        return true;
    }
    return false;
} );

ipcMain.handle( DELETE_PLUGIN_REMOTE, ( _, pluginId: string ) => {
    return settings.plugins.deletePlugin( pluginId );
} );

ipcMain.handle( ACTIVATE_PLUGINS_REMOTE, async ( _, pluginIds: string[] ) => {
    const plugins = await settings.activatePlugins( pluginIds );

    if ( plugins ) {
        browserWindows.main?.webContents.send( ON_PLUGINS_ACTIVATED_LOCAL, plugins );

        return true;
    }

    return false;
} );

ipcMain.handle( DOWNLOAD_PLUGIN, async ( _, repository: string ) => {
    return await settings.plugins.downloadPlugin( repository, () => {
        browserWindows.main?.webContents.send( RELOAD_PLUGINS_LOCAL );
    } );
} );

ipcMain.handle( LOAD_REMOTE_PLUGIN_METADATA, async ( _, repository: string ) => {
    return await settings.plugins.loadRemoteMetaData( repository );
} );

ipcMain.handle( SEARCH_NPM_PACKAGES_REMOTE, async (  ) => {
    return await settings.plugins.searchPackages();
} );

