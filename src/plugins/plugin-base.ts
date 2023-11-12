import type { GameTimeApi } from "@core/world/game-time-api";
import type {
    FieldDefinition,
    NativePlugin,
    PluginConfig,
    PluginPackage,
} from "common/types";
// import { savePluginsConfig } from "renderer/command-center/ipc/plugins";
import { normalizePluginConfiguration } from "@utils/function-utils";
import type { SessionVariables } from "@core/world/settings-session-store";
import { TypeEmitter, TypeEmitterProxy } from "@utils/type-emitter";
import type { WorldEvents } from "@core/world/world-events";
import { usePluginsStore } from "@stores/plugins-store";

const structuredClone =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    globalThis.structuredClone ??
    ((x: any) => JSON.parse(JSON.stringify(x)) as unknown);

export interface PluginBase extends NativePlugin, GameTimeApi {}

export type PluginSessionContext = {
    game: GameTimeApi;
    settings: SessionVariables;
    events: TypeEmitter<WorldEvents>;
    customEvents: TypeEmitter<unknown>;
};

export class PluginBase implements PluginBase {
    readonly id: string;
    readonly name: string;
    isSceneController = false;
    #config: PluginConfig = {};

    game: GameTimeApi;
    settings: SessionVariables;
    events: TypeEmitterProxy<WorldEvents>;

    /**
     * @internal
     * Same as config but simplified to [key] = value
     */
    #normalizedConfig: Record<string, unknown> = {};

    constructor(pluginPackage: PluginPackage, session: PluginSessionContext) {
        this.id = pluginPackage.id;
        this.name = pluginPackage.name;
        this.rawConfig = structuredClone(pluginPackage.config ?? {});
        this.game = session.game;
        this.settings = session.settings;
        this.events = new TypeEmitterProxy(session.events);
    }

    dispose() {
        this.events.dispose();
    }

    sendUIMessage: (message: any) => void = () => {};

    /**
     *
     * Useful for plugins that want to update their own config.
     *
     * @param key The configuration key.
     * @param value  The configuration value.
     * @returns
     */
    saveConfigProperty(key: string, value: unknown, persist = true): void {
        if (!(key in this.#config)) {
            console.warn(
                `Plugin ${this.id} tried to set config key ${key} but it was not found`
            );
            return undefined;
        }

        this.#config[key].value = value;
        if (persist) {
            usePluginsStore.getState().savePluginConfig( this.id, this.#config );
        }
    }

    /*
     * Generates the normalized config object.
     * Same as config but simplified to [key] = value
     */
    refreshConfig() {
        this.#normalizedConfig = normalizePluginConfiguration(this.#config);
    }

    /**
     * Read from the normalized configuration.
     */
    get config(): Record<string, any> {
        return this.#normalizedConfig;
    }

    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set rawConfig(value: PluginConfig) {
        this.#config = value;
        this.refreshConfig();
    }

    get rawConfig() {
        return this.#config;
    }

    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getFieldDefinition(key: string) {
        return this.#config[key] as FieldDefinition | undefined;
    }
}
