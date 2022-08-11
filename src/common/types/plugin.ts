import type CameraControls from "camera-controls";
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
    description?: string;
    repository?: string | { type?: string; url?: string };
    peerDependencies?: {
        [key: string]: string;
    },
    config?: {
        system?: {
            permissions?: string[],
            deprecated?: boolean;
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
    methods: string[];
    hooks: string[];
    isSceneController: boolean;
}
export interface PluginPrototype {
    id: string;
    config?: {
        [key: string]: any
    };
    /**
     *SSpecial permissions specified in the package.json.
     */
    $$permissions: {
        [key: string]: boolean
    },
    /**
     * Unprocessed configuration data from the package.json.
     */
    $$config: {
        [key: string]: any
    },
    /**
     * Allows a plugin to update it's own config key/value store
     */
    setConfig: (key: string, value: any, persist: boolean) => any;
}

export interface NativePlugin extends PluginPrototype {
    id: string;
    name: string;
    orbit: CameraControls;
    $$meta: {
        hooks: string[];
        methods: string[];
        indexFile: string;
        isSceneController: boolean;
    }

    /**
     * Called when a plugin has it's configuration changed by the user
     */
    onConfigChanged?: (oldConfig: {}) => void;
    /**
     * CaLLed when a plugin must release its resources
     */
    dispose?: () => void;
    /**
     * Called when an React component sends a message to this window
     */
    onUIMessage?: (message: any) => void;
    /**
     * Called just before render
     */
    onBeforeRender?: (delta: number, elapsed: number) => void;
    /**
     * Called after rendering is done
     */
    onRender?: (delta: number, elapsed: number) => void;
    /**
     * Called on a game frame
     */
    onFrame?: (frame: number, commands?: any[]) => void;
    /**
     * Used for message passing in hooks
     */
    context: any;

    /**
     * When a game has been loaded and the game loop is about to begin
     */
    onGameReady?: () => void;
    onGameDisposed?: () => void;
    onScenePrepared?: () => void;
    onUnitCreated?: () => void;
    onUnitKilled?: () => void;
    onFrameReset?: () => void;
    onUpgradeCompleted?: () => void;
    onTechCompleted?: () => void;
}

export type UserInputCallbacks = {
    onCameraMouseUpdate: (delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, mouse: Vector3, clientX: number, clientY: number, clicked?: Vector3) => void;

    onCameraKeyboardUpdate: (delta: number, elapsed: number, truck: Vector2) => void;

    onShouldHideUnit: (unit: any) => boolean | undefined;

    onUpdateAudioMixerLocation: (delta: number, elapsed: number, target: Vector3, position: Vector3) => Vector3;

    onMinimapDragUpdate: (pos: Vector3, isDragStart: boolean, mouseButton?: number) => void;

    onDrawMinimap: (ctx: CanvasRenderingContext2D) => void;

}

export type SceneInputHandler = NativePlugin & Partial<UserInputCallbacks> & {
    dispose: () => void;

    gameOptions: {
        allowUnitSelection: boolean;
        audio: "stereo" | "3d";
    }

    onEnterScene: (prevData: any) => Promise<void>;

    onExitScene?: (currentData: any) => any;

    onPostProcessingBundle: (renderPass: any, fogOfWarEffect: any) => {
        passes?: any[];
        effects?: any[];
    };

}
