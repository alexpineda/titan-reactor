import { ipcMain } from "electron";
import {
    DELETE_PLUGIN,
    DISABLE_PLUGIN,
    ENABLE_PLUGINS,
    INSTALL_PLUGIN,
    LOAD_REMOTE_PLUGIN_METADATA,
    ON_PLUGINS_ENABLED,
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

ipcMain.handle( DISABLE_PLUGIN, async ( _, pluginId: string ) => {
    const pluginNames = await settings.disablePlugins( [ pluginId ] );

    if ( pluginNames ) {
        browserWindows.main?.webContents.send( DISABLE_PLUGIN, pluginId );
        return true;
    }
    return false;
} );

ipcMain.handle( DELETE_PLUGIN, ( _, pluginId: string ) => {
    return settings.plugins.uninstallPlugin( pluginId );
} );

ipcMain.handle( ENABLE_PLUGINS, async ( _, pluginIds: string[] ) => {
    const plugins = await settings.enablePlugins( pluginIds );

    if ( plugins ) {
        browserWindows.main?.webContents.send( ON_PLUGINS_ENABLED, plugins );

        return true;
    }

    return false;
} );

ipcMain.handle( INSTALL_PLUGIN, async ( _, repository: string ) => {
    return await settings.plugins.installPlugin( repository, () => {
        browserWindows.main?.webContents.send( RELOAD_PLUGINS );
    } );
} );

ipcMain.handle( LOAD_REMOTE_PLUGIN_METADATA, async ( _, repository: string ) => {
    return await settings.plugins.loadRemoteMetaData( repository );
} );
