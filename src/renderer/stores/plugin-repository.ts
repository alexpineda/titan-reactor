import { PluginConfig, PluginMetaData, PluginPackage } from "common/types";
import { withErrorMessage } from "common/utils/with-error-message";
import { getPluginAPIVersion } from "common/utils/api-version";

const log = console;

import semver from "semver";
import { HostApiVersion } from "common/utils/api-version";
import { StorageAdapter } from "./storage-adapters/settings-adapter";
import gameStore from "./game-store";

import deepMerge from "deepmerge";
import { arrayOverwriteMerge } from "@utils/object-utils";
import { urlJoin } from "@utils/string-utils";

const defaultMapPlugins = [
    "@titan-reactor-plugins/camera-standard",
    "@titan-reactor-plugins/camera-overview",
    "@titan-reactor-plugins/camera-battle",
    "@titan-reactor-plugins/sandbox-tools",
    "@titan-reactor-plugins/vr-controller",
];

const defaultReplayPlugins = [
    "@titan-reactor-plugins/camera-standard",
    "@titan-reactor-plugins/camera-overview",
    "@titan-reactor-plugins/camera-battle",
    "@titan-reactor-plugins/clock",
    "@titan-reactor-plugins/player-colors",
    "@titan-reactor-plugins/players-bar",
    "@titan-reactor-plugins/unit-selection-display",
    "@titan-reactor-plugins/production-bar",
    "@titan-reactor-plugins/unit-sounds",
    "@titan-reactor-plugins/narrative-maker",
    "@titan-reactor-plugins/vr-controller",
];

type IndexedPackage = {
    rootUrl: string;
    name: string;
    version: string;
    description: string;
    files: string[];
};

/**
 * Interfaces with NPM packages and the file system to load plugins.
 */
export class PluginsRepository {
    #pluginPackages: PluginMetaData[] = [];
    #storage: StorageAdapter;
    repositoryUrl = "";
    #pluginSettings: Record<string, PluginConfig> = {};

    get plugins() {
        return this.#pluginPackages;
    }

    get hasAnyPlugins() {
        return this.plugins.length > 0;
    }

    constructor(storage: StorageAdapter) {
        this.#storage = storage;
    }

    async init() {
        this.#pluginPackages = [];
        await this.#fetch(gameStore().pluginRepositoryUrl);

        // todo: deprecate plugin.config
        for (const plugin of this.plugins) {
            const userConfig = await this.#storage.loadPluginSettings(plugin.name);

            if (userConfig === undefined) {
                if (defaultMapPlugins.includes(plugin.name)) {
                    plugin.config._map.value = true;
                    plugin.config._enabled.value = true;
                }
                if (defaultReplayPlugins.includes(plugin.name)) {
                    plugin.config._replay.value = true;
                    plugin.config._enabled.value = true;
                }
            }

            this.#pluginSettings[plugin.name] = Object.assign(
                plugin.config,
                userConfig
            );

            this.#storage.savePluginSettings(plugin.name, plugin.config);

            console.log("plugin found", plugin.name, plugin.version);
        }
    }

    #isPluginIncompatible(plugin: Partial<PluginPackage>) {
        return (
            semver.major(HostApiVersion) !== semver.major(getPluginAPIVersion(plugin))
        );
    }

    //todo: do this at build time
    async #loadPluginPackage(
        plugin: IndexedPackage,
        pluginRootUrl: string,
    ): Promise<null | PluginMetaData> {
        const packageJSON = await fetch(urlJoin(pluginRootUrl, "package.json"))
            .then((r) => r.json() as Partial<PluginPackage>)
            .catch((e) => {
                log.error(
                    withErrorMessage(
                        e,
                        `@load-plugins/load-plugin-packages: Could not load package.json - ${plugin.name}`
                    )
                );
                return null;
            });

        if (!packageJSON) {
            return null;
        }

        if (packageJSON.name === undefined) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin name - ${plugin.name}`
            );
            return null;
        }

        if (packageJSON.version === undefined) {
            log.error(
                `@load-plugins/load-configs: Undefined plugin version - ${plugin.name}`
            );
            return null;
        }

        if (this.#isPluginIncompatible(packageJSON)) {
            log.error(
                `@load-plugins/load-configs: Plugin ${plugin.name} is incompatible with this version.`
            );
            return null;
        }

        let isSceneController = false;

        const pluginNative = plugin.files.includes("host.js") ? await fetch(`${pluginRootUrl}/host.js`)
            .then(async (r) => {
                isSceneController = (await r.text()).includes("onEnterScene");
                return "host.js";
            })
            .catch(() => null) : null;

        const indexFile = plugin.files.includes("ui.js") ? await fetch(`${pluginRootUrl}/ui.js`)
            .then(() => "ui.js")
            .catch(() => "") : "";

        const readme = plugin.files.includes("readme.md") ? await fetch(`${pluginRootUrl}/readme.md`)
            .then((r) => r.text())
            .catch(() => undefined): undefined;

        const config = packageJSON.config ?? {};

        if (!indexFile && !pluginNative) {
            log.error(
                `@load-plugins/load-plugin-package: Plugin ${plugin.name} has no host or ui plugin files`
            );
            return null;
        }

        const pluginPackage = {
            id: packageJSON.name, // MathUtils.generateUUID(), We used to have this to help protect individual plugins, will revisit later
            name: packageJSON.name,
            version: packageJSON.version,
            description: packageJSON.description,
            author: packageJSON.author,
            repository: packageJSON.repository,
            keywords: packageJSON.keywords ?? [],
            apiVersion: getPluginAPIVersion(packageJSON),
            path: plugin.rootUrl,
            config,
            nativeSource: pluginNative,
            indexFile,
            isSceneController,
            readme,
            url: pluginRootUrl,
        };

        return pluginPackage;
    }

    #sanitizeConfig(plugin: PluginMetaData) {
        const config = plugin.config;
        Object.assign(config, {
            _visible: { value: true, label: "UI Visible", folder: "System" },
        });
        Object.assign(config, {
            _replay: {
                value: false,
                label: "Activated On Replay",
                folder: "System",
            },
        });
        Object.assign(config, {
            _map: { value: false, label: "Activated On Map", folder: "System" },
        });
        Object.assign(config, {
            _enabled: { value: false, label: "Enabled", folder: "System" },
        });
        return config;
    }

    //todo: deprecate once we move configs and values to separate containers
    #createEnabledOption(value: boolean) {
        return {
            value,
            label: "Enabled",
            folder: "System",
        };
    }

    async #fetch(rootUrl: string) {
        this.repositoryUrl = rootUrl;

        //todo: load plugins
        const plugins = await fetch(urlJoin(rootUrl, "index.json"))
            .then((r) => r.json() as Promise<IndexedPackage[]>)
            .catch(() => []);

        for (const plugin of plugins) {
            const pluginPackage = await this.#loadPluginPackage(
                plugin,
                urlJoin(rootUrl, plugin.rootUrl)
            );
            if (pluginPackage) {
                this.#sanitizeConfig(pluginPackage);
                this.#pluginPackages.push(pluginPackage);
            }
        }
    }

    get mapPlugins() {
        return this.enabledPlugins.filter((p) => p.config._map.value);
    }

    get replayPlugins() {
        return this.enabledPlugins.filter((p) => p.config._replay.value);
    }

    get enabledPlugins() {
        return this.plugins.filter((p) => p.config._enabled.value);
    }

    get disabledPlugins() {
        return this.plugins.filter((p) => !p.config._enabled.value);
    }

    async disablePlugins(pluginIds: string[]) {
        const plugins = this.enabledPlugins.filter((p) => pluginIds.includes(p.id));

        if (plugins.length) {
            for (const plugin of plugins) {
                await this.savePluginConfig(plugin.id, {
                    ...plugin.config,
                    _enabled: this.#createEnabledOption(false),
                });
            }
            return plugins;
        }
    }

    async enablePlugins(pluginIds: string[]) {
        const plugins = this.disabledPlugins.filter((p) => pluginIds.includes(p.id));

        if (plugins.length) {
            for (const plugin of plugins) {
                await this.savePluginConfig(plugin.id, {
                    ...plugin.config,
                    _enabled: this.#createEnabledOption(true),
                });
            }
            return plugins;
        }
    }

    async savePluginConfig(pluginId: string, config: PluginConfig) {
        const plugin = this.plugins.find((p) => p.id === pluginId);
        if (!plugin) {
            log.error(
                `@settings/load-plugins: Could not find plugin with id ${pluginId}`
            );
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            plugin.config = deepMerge(plugin.config, config, {
                arrayMerge: arrayOverwriteMerge,
            });

            await this.#storage.savePluginSettings(plugin.name, plugin.config);
        } catch (e) {
            log.error(
                withErrorMessage(
                    e,
                    "@save-plugins-config: Error writing plugin package.json"
                )
            );
            return;
        }
    }
}
