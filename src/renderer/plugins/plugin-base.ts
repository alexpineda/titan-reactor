import { GameTimeApi } from "@core/world/game-time-api";
import { log } from "@ipc/log";
import { savePluginsConfig } from "@ipc/plugins";
import { normalizePluginConfiguration } from "@utils/function-utils";
import { NativePlugin, PluginPackage } from "common/types";

export interface PluginBase extends NativePlugin, GameTimeApi { }
export class PluginBase implements NativePlugin {
    readonly id: string;
    readonly name: string;
    isSceneController = false;
    #config: Record<string, any> | undefined = {}

    /**
     * @internal
     * Same as config but simplified to [key] = value | [key] = value * factor
     */
    #normalizedConfig: Record<string, any> | undefined;

    constructor(pluginPackage: PluginPackage) {
        this.id = pluginPackage.id;
        this.name = pluginPackage.name;
        this.config = pluginPackage.config;
    }

    callCustomHook: (hook: string, ...args: any[]) => any = () => { };
    sendUIMessage: (message: any) => void = () => { };

    /**
     * 
     * @param key The configuration key.
     * @param value  The configuration value.
     * @returns 
     */
    setConfig(key: string, value: any, persist = true): void {
        if (!this.#config) {
            return;
        }

        if (!(key in this.#config)) {
            log.warn(`Plugin ${this.id} tried to set config key ${key} but it was not found`);
            return undefined;
        }

        this.#config[key].value = value;
        if (persist) {
            savePluginsConfig(this.id, this.#config);
        }
    }

    /*
    * Generates the normalized config object.
    * Same as config but simplified to [key] = value | [key] = value * factor
    */
    refreshConfig() {
        this.#normalizedConfig = this.#config ? normalizePluginConfiguration(this.#config) : undefined;
    }

    get configExists() {
        return this.#config !== undefined;
    }

    /**
     * Read from the normalized configuration.
     */
    get config(): Record<string, any> | undefined {
        return this.#normalizedConfig;
    }

    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set config(value: any) {
        this.#config = value;
        this.refreshConfig();
    }

    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getFieldDefinition(key: string) {
        if (!this.#config) {
            return undefined;
        }
        return this.#config[key];
    }

    get rawConfig() {
        return this.#config;
    }
}