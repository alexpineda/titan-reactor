import { ipcMain } from "electron";
import {
    DELETE_PLUGIN,
    DEACTIVATE_PLUGIN,
    ACTIVATE_PLUGINS,
    DOWNLOAD_PLUGIN as DOWNLOAD_PLUGIN,
    LOAD_REMOTE_PLUGIN_METADATA,
    ON_PLUGINS_ACTIVATED,
    RELOAD_PLUGINS,
    UPDATE_PLUGIN_CONFIG,
} from "common/ipc-handle-names";
import settings from "../settings/singleton";
import browserWindows from "../windows";
import { PluginConfig } from "common/types";

ipcMain.handle(
    UPDATE_PLUGIN_CONFIG,
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

ipcMain.handle( DELETE_PLUGIN, ( _, pluginId: string ) => {
    return settings.plugins.deletePlugin( pluginId );
} );

ipcMain.handle( ACTIVATE_PLUGINS, async ( _, pluginIds: string[] ) => {
    const plugins = await settings.activatePlugins( pluginIds );

    if ( plugins ) {
        browserWindows.main?.webContents.send( ON_PLUGINS_ACTIVATED, plugins );

        return true;
    }

    return false;
} );

ipcMain.handle( DOWNLOAD_PLUGIN, async ( _, repository: string ) => {
    return await settings.plugins.downloadPlugin( repository, () => {
        browserWindows.main?.webContents.send( RELOAD_PLUGINS );
    } );
} );

ipcMain.handle( LOAD_REMOTE_PLUGIN_METADATA, async ( _, repository: string ) => {
    return await settings.plugins.loadRemoteMetaData( repository );
} );
