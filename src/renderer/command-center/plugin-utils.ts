import { PluginMetaData, SettingsMeta } from "common/types";
import type search from "libnpmsearch";
import * as log from "@ipc/log"
import React from "react";
import {
    deletePlugin,
    disablePlugin,
    enablePlugins,
    installPlugin
} from "@ipc/plugins";
import semver from "semver";

type RemotePackage = search.Result;

type Plugin = {
    plugin?: PluginMetaData;
    remote?: RemotePackage;
};

type SetBanner = (value: React.SetStateAction<string>) => void;
type SetTabIndex = (value: React.SetStateAction<number>) => void;
type SetSelectedPlugin = (value: React.SetStateAction<Plugin>) => void;

export const localPluginRepository = (setSelectedPluginPackage: SetSelectedPlugin, setBanner: SetBanner, setTabIndex: SetTabIndex, reload: () => Promise<SettingsMeta>) => ({

    tryInstallPlugin: async (packageName: string) => {
        if (
            confirm(
                "This will download the plugin into your plugins folder. Continue?"
            )
        ) {
            const installedPlugin = await installPlugin(
                packageName
            );
            if (installedPlugin) {
                const plugin = (await reload()).enabledPlugins.find(p => p.id === installedPlugin.id);
                setSelectedPluginPackage({ plugin });
                setBanner(`${installedPlugin.name} installed!`);
                setTabIndex(0);
            } else {
                setBanner(
                    `Failed to install ${packageName}`
                );
            }
        }
    },

    tryUpdatePlugin: async (packageName: string) => {
        if (
            confirm("This will update the plugin in your plugins folder. Continue?")
        ) {
            const installedPlugin = await installPlugin(
                packageName
            );
            if (installedPlugin) {
                const plugin = (await reload()).enabledPlugins.find(p => p.id === installedPlugin.id);
                setSelectedPluginPackage({ plugin });
                log.info(`Succesfully updated ${packageName}`);
            } else {
                setBanner(`Failed to update ${packageName}`);
            }
        }
    },

    tryDisablePlugin: async (pluginId: string) => {
        if (confirm("Are you sure you want to disable this plugin?")) {
            if (await disablePlugin(pluginId)) {
                setSelectedPluginPackage({ plugin: undefined });
                await reload();
            } else {
                setBanner(`Failed to disable plugin.`);
            }
        }
    },

    tryEnablePlugin: async (pluginId: string) => {
        if (confirm("Do you wish to continue and enable this plugin?")) {
            if (await enablePlugins([pluginId])) {
                await reload();
                const plugin = (await reload()).enabledPlugins.find(p => p.id === pluginId);
                setSelectedPluginPackage({ plugin });
            } else {
                setBanner("Failed to enable plugin");
            }
        }
    },

    tryDeletePlugin: async (pluginId: string) => {
        if (
            confirm("Are you sure you wish to place this plugin in the trashbin?")
        ) {
            if (await deletePlugin(pluginId)) {
                setBanner("Plugin files were placed in trash bin");
                setSelectedPluginPackage({ plugin: undefined });
                await reload();
            } else {
                setBanner("Failed to delete plugin");
            }
        }
    }
});

export const getUpdateVersion = (remote: RemotePackage | undefined, local: PluginMetaData | undefined) => {
    const remoteVersion = remote?.version ?? "0.0.0";
    const localVersion = local?.version ?? "0.0.0";
    try {
        return semver.gt(remoteVersion, localVersion) ? remoteVersion : undefined;
    } catch (e) {
        return undefined;
    }
};