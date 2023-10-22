//@ts-nocheck
// import {
//     DELETE_PLUGIN_REMOTE,
//     DEACTIVATE_PLUGIN,
//     ACTIVATE_PLUGINS_REMOTE,
//     DOWNLOAD_PLUGIN,
//     LOAD_REMOTE_PLUGIN_METADATA,
//     SAVE_PLUGIN_CONFIG_REMOTE,
// } from "common/ipc-handle-names";
import { PluginMetaData } from "common/types";

export const savePluginsConfig = async ( pluginId: string, config: any ) => {
    throw new Error();
    // await ipcRenderer.invoke( SAVE_PLUGIN_CONFIG_REMOTE, pluginId, config );
};

export const deactivatePlugin = async ( pluginId: string ) => {
    throw new Error();
    // return ( await ipcRenderer.invoke( DEACTIVATE_PLUGIN, pluginId ) ) as boolean;
};

export const deletePlugin = async ( pluginId: string ) => {
    throw new Error();
    // return ( await ipcRenderer.invoke( DELETE_PLUGIN_REMOTE, pluginId ) ) as boolean | undefined;
};

export const activatePlugins = async ( pluginIds: string[] ) => {
    throw new Error();
    // return ( await ipcRenderer.invoke( ACTIVATE_PLUGINS_REMOTE, pluginIds ) ) as boolean;
};

export const downloadPlugin = async ( repository: string ) => {
    throw new Error();
    // return ( await ipcRenderer.invoke(
    //     DOWNLOAD_PLUGIN,
    //     repository
    // ) ) as PluginMetaData | null;
};

export const loadRemoteMetaData = async ( pluginId: string ) => {
    throw new Error();
    // return ( await ipcRenderer.invoke(
    //     LOAD_REMOTE_PLUGIN_METADATA,
    //     pluginId
    // ) ) as PluginMetaData | null;
};
