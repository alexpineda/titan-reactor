import type { Vector2, Vector3 } from "three";

export interface PluginPackage {
    name: string;
    id: string;
    version: string;
    author?: string | {
        name?: string;
        email?: string;
        username?: string;
    };
    keywords?: string[];
    description?: string;
    repository?: string | { type?: string; url?: string };
    peerDependencies?: {
        [key: string]: string;
    },
    config?: {
        system?: {
            permissions?: string[],
            customHooks?: string[],
        },
        [key: string]: any
    }
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

    config: Record<string, any> | undefined;

    init?: () => void;

    /**
     * Unprocessed configuration data from the package.json.
     * @internal
     */
    getFieldDefinition(key: string): any;

    /**
     * Allows a plugin to update it's own config key/value store
     */
    setConfig(key: string, value: any, persist?: boolean): void;

    /**
     * Send a message to your plugin UI.
     */
    sendUIMessage(message: any): void;
    /**
     * Call your custom hook. Must be defined in the package.json first.
     */
    callCustomHook(hook: string, ...args: any[]): any;

    /**
     * Called when a plugin has it's configuration changed by the user
     */
    onConfigChanged?(oldConfig: Record<string, unknown>): void;
    /**
     * CaLLed when a plugin must release its resources
     */
    dispose?(): void;
    /**
     * Called when an React component sends a message to this window
     */
    onUIMessage?(message: any): void;
    /**
     * Called just before render
     */
    onBeforeRender?(delta: number, elapsed: number): void;
    /**
     * Called after rendering is done
     */
    onRender?(delta: number, elapsed: number): void;
    /**
     * Called on a game frame
     */
    onFrame?(frame: number, commands?: any[]): void;
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

}

export interface UserInputCallbacks {
    /**
     * Updates every frame with the current mouse data.
     * 
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param scrollY - Mouse wheel scroll delta
     * @param screenDrag - Screen scroll delta
     * @param lookAt - pointerLock delta
     * @param mouse - x,y mouse position in NDC + z = button state
     * @param clientX mouse clientX value
     * @param clientY mouse clientY value
     * @param clicked - x,y mouse position in NDC + z = button state
     */
    onCameraMouseUpdate(delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, mouse: Vector3, clientX: number, clientY: number, clicked: Vector3 | undefined, modifiers: Vector3): void;

    /**
     * Updates every frame with the current keyboard data.
     * 
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param truck - x,y movement deltas
     */
    onCameraKeyboardUpdate(delta: number, elapsed: number, truck: Vector2): void;

    /**
     * You must return a Vector3 with a position for the audio listener.
     * 
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param target - Vector3 of the current camera target
     * @param position - Vector 3 of the current camera position
     */
    onUpdateAudioMixerLocation(delta: number, elapsed: number, target: Vector3, position: Vector3): Vector3;

    /**
     * Updates when the minimap is clicked and dragged.
     * 
     * @param pos - Vector3 of the map coordinates.
     * @param isDragStart - Did the user just start dragging
     * @param mouseButton - The button the user is using.
     */
    onMinimapDragUpdate(pos: Vector2, isDragStart: boolean, mouseButton?: number): void;


}

export type SceneInputHandler = NativePlugin & Partial<UserInputCallbacks> & {
    //TODO MOve this to hidden settings
    gameOptions: {
        /**
         * Audio mode in stereo is classic bw style, 3d is spatial.
         */
        audio: "stereo" | "3d";
    }


    /**
     * When a scene is entered and nearly initialized.
     */
    onEnterScene: (prevData: any) => Promise<void>;

    /**
     * When a scene has exited. Dispose resources here.
     */
    onExitScene?: (currentData: any) => any;

    /**
     * When a scene is ready to be drawn.
     */
    onPostProcessingBundle: (renderPass: any, fogOfWarEffect: any) => {
        passes?: any[];
        effects?: any[];
    };

}
