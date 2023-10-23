import { SessionVariables } from "@core/world/settings-session-store";
import { WorldEvents } from "@core/world/world-events";
import { TypeEmitterProxy } from "@utils/type-emitter";
import { FieldDefinition } from "./fields";

export type PluginConfig = Record<string, FieldDefinition | undefined>;

/**
 * A package definition for a plugin.
 * This is the same format as a package.json file with exception of the `permissions` property.
 */
export interface PluginPackage {
    name: string;
    id: string;
    version: string;
    author?:
        | string
        | {
              name?: string;
              email?: string;
              username?: string;
          };
    keywords?: string[];
    description?: string;
    repository?: string | { type?: string; url?: string };
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    config?: PluginConfig;
}

/**
 * A plugin's metadata based off it's package.json file and surrounding plugin files.
 */
export interface PluginMetaData extends PluginPackage {
    nativeSource?: string | null;
    path: string;
    date?: Date;
    readme?: string;
    indexFile: string;
    isSceneController: boolean;
    apiVersion: string;
}

/**
 * These are the injectable services that are available to plugins during a world session.
 */
export interface Injectables {
    /**
     * Reactive setting values that apply to the active session only.
     */
    settings: SessionVariables;

    /**
     * World events that can be listened to and emitted.
     */
    events: TypeEmitterProxy<WorldEvents>;
}

/**
 * A plugin that executes in the main process.
 */
export interface NativePlugin {
    /**
     * The id of the plugin.
     */
    readonly id: string;
    /**
     * Package name.
     */
    readonly name: string;

    /**
     * Whether or not this plugin is a scene controller.
     */
    isSceneController: boolean;

    config: Record<string, any>;

    init?(): void;

    /**
     * Unprocessed configuration data from the package.json.
     * @internal
     */
    getFieldDefinition( key: string ): FieldDefinition | undefined;

    /**
     * Allows a plugin to update it's own config key/value store
     */
    saveConfigProperty( key: string, value: unknown, persist?: boolean ): void;

    /**
     * Send a message to your plugin UI.
     */
    sendUIMessage( message: any ): void;

    /**
     * Called when a plugin has it's configuration changed by the user
     */
    onConfigChanged?( oldConfig: Record<string, unknown> ): void;
    /**
     * CaLLed when a plugin must release its resources
     */
    dispose?(): void;
    /**
     * Called when an React component sends a message to this window
     */
    onUIMessage?( message: any ): void;
    /**
     * Called just before render
     */
    onBeforeRender?( delta: number, elapsed: number ): void;
    /**
     * Called after rendering is done
     */
    onRender?( delta: number, elapsed: number ): void;
    /**
     * Called on a game frame
     */
    onFrame?( frame: number, commands?: any[] ): void;
    /**
     * When a game has been loaded and the game loop is about to begin
     */
    onSceneReady?(): void;
    /**
     * When the scene is being disposed
     */
    onSceneDisposed?(): void;
    /**
     * When the scene objects have been reset due to replay forwarding or rewinding.
     */
    onFrameReset?(): void;

    /**
     * When a scene is entered and nearly initialized.
     */
    onEnterScene?( prevData: any ): Promise<unknown>;

    /**
     * When a scene has exited. Dispose resources here.
     */
    onExitScene?( currentData: any ): any;
}
