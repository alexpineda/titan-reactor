// @ts-nocheck
import { PluginMetaData, SettingsMeta } from "common/types";
import type search from "libnpmsearch";
import { log } from "@ipc/log";
import React from "react";
import {
    deletePlugin,
    deactivatePlugin,
    activatePlugins,
    downloadPlugin,
} from "./ipc/plugins";
import semver from "semver";

type RemotePackage = search.Result;

interface Plugin {
    plugin?: PluginMetaData;
    remote?: RemotePackage;
}

type SetBanner = ( value: React.SetStateAction<string> ) => void;
type SetTabIndex = ( value: React.SetStateAction<number> ) => void;
type SetSelectedPlugin = ( value: React.SetStateAction<Plugin> ) => void;

export const localPluginRepository = (
    setSelectedPluginPackage: SetSelectedPlugin,
    setBanner: SetBanner,
    setTabIndex: SetTabIndex,
    reload: () => Promise<SettingsMeta>
) => ( {
    tryDownloadPlugin: async ( packageName: string ) => {
        if (
            confirm( "This will download the plugin into your plugins folder. Continue?" )
        ) {
            setBanner( "Downloading please wait.." );
            const downloadedPlugin = await downloadPlugin( packageName );
            if ( downloadedPlugin ) {
                const plugin = ( await reload() ).activatedPlugins.find(
                    ( p ) => p.id === downloadedPlugin.id
                );
                setSelectedPluginPackage( { plugin } );
                setBanner( `${downloadedPlugin.name} installed!` );
                setTabIndex( 0 );
            } else {
                setBanner( `Failed to install ${packageName}` );
            }
        }
    },

    tryUpdatePlugin: async ( packageName: string ) => {
        if ( confirm( "This will update the plugin in your plugins folder. Continue?" ) ) {
            setBanner( "Updating please wait.." );
            const installedPlugin = await downloadPlugin( packageName );
            if ( installedPlugin ) {
                const plugin = ( await reload() ).activatedPlugins.find(
                    ( p ) => p.id === installedPlugin.id
                );
                setSelectedPluginPackage( { plugin } );
                setBanner( `${installedPlugin.name} updated!` );
                log.info( `Succesfully updated ${packageName}` );
            } else {
                setBanner( `Failed to update ${packageName}` );
            }
        }
    },

    tryDeactivatePlugin: async ( pluginId: string ) => {
        if ( confirm( "Are you sure you want to deactivate this plugin?" ) ) {
            setBanner( "Please wait.." );
            if ( await deactivatePlugin( pluginId ) ) {
                setSelectedPluginPackage( { plugin: undefined } );
                await reload();
            } else {
                setBanner( "Failed to disable plugin." );
            }
        }
    },

    tryActivatePlugin: async ( pluginId: string ) => {
        if ( confirm( "Do you wish to continue and activate this plugin?" ) ) {
            setBanner( "Please wait.." );
            if ( await activatePlugins( [ pluginId ] ) ) {
                await reload();
                const plugin = ( await reload() ).activatedPlugins.find(
                    ( p ) => p.id === pluginId
                );
                setSelectedPluginPackage( { plugin } );
            } else {
                setBanner( "Failed to enable plugin" );
            }
        }
    },

    tryDeletePlugin: async ( pluginId: string ) => {
        if ( confirm( "Are you sure you wish to place this plugin in the trashbin?" ) ) {
            setBanner( "Please wait.." );
            if ( await deletePlugin( pluginId ) ) {
                setBanner( "Plugin files were placed in trash bin" );
                setSelectedPluginPackage( { plugin: undefined } );
                await reload();
            } else {
                setBanner( "Failed to delete plugin" );
            }
        }
    },
} );

export const getUpdateVersion = (
    remote: RemotePackage | undefined,
    local: PluginMetaData | undefined
) => {
    const remoteVersion = remote?.version ?? "0.0.0";
    const localVersion = local?.version ?? "0.0.0";
    try {
        return semver.gt( remoteVersion, localVersion ) ? remoteVersion : undefined;
    } catch ( e ) {
        return undefined;
    }
};
