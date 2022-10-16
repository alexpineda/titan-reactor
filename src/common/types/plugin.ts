import { SessionVariables } from "@core/world/settings-session-store";
import { WorldEvents } from "@core/world/world-events";
import { TypeEmitterProxy } from "@utils/type-emitter";
import { FieldDefinition } from "./fields";

export type PluginConfig = Record<string, FieldDefinition>;

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
    config?: PluginConfig;
}

export interface PluginMetaData extends PluginPackage {
    nativeSource?: string | null;
    path: string;
    date?: Date;
    readme?: string;
    indexFile: string;
    externMethods: string[];
    hooks: string[];
    isSceneController: boolean;
    apiVersion: string;
}

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

    config: object | undefined;

    init?: () => void;

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
     * Call your custom hook. Must be defined in the package.json first.
     */
    callCustomHook( hook: string, ...args: any[] ): any;

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
     * Used for message passing in hooks
     */
    context?: any;

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
