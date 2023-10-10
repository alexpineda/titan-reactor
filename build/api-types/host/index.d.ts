
        /// <reference types="node" />
        import Chk from "bw-chk"
import CameraControls from "camera-controls"
import { Vector2, Color, Vector3, DataTexture, PerspectiveCamera, OrthographicCamera, Texture, Matrix4, Vector4, CompressedTexture, BufferAttribute, DataArrayTexture, CubeTexture, Object3D, Mesh, BufferGeometry, MeshBasicMaterial, SpriteMaterialParameters, Shader, MeshStandardMaterial, SkinnedMesh, AnimationClip, AudioContext, Quaternion, AnimationMixer, Box3, Sphere, Raycaster, Intersection, Group, Scene, Camera } from "three";
import { Effect } from "postprocessing";
import { Janitor } from "three-janitor";



//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/**
 * A plugin that executes in the main process.
 */
/** @internal */
interface NativePlugin {
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
    init?(): void;
    /**
     * Unprocessed configuration data from the package.json.
     * @internal
     */
    getFieldDefinition(key: string): FieldDefinition | undefined;
    /**
     * Allows a plugin to update it's own config key/value store
     */
    saveConfigProperty(key: string, value: unknown, persist?: boolean): void;
    /**
     * Send a message to your plugin UI.
     */
    sendUIMessage(message: any): void;
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
    onEnterScene?(prevData: any): Promise<unknown>;
    /**
     * When a scene has exited. Dispose resources here.
     */
    onExitScene?(currentData: any): any;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/fields.ts

/** @internal */
interface FieldDefinition<T = unknown> {
    /**
     * The type is usually inferred except for the case of Leva Plugins.
     */
    type?: string;
    onChange?: (value: any, path: string, context: any) => void;
    folder?: string;
    label?: string;
    value: T;
    step?: number;
    min?: number;
    max?: number;
    options?: string[] | Record<string, string>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/game-time-api.ts

/**
 * @public
 * The exposed api available to macros and plugins.
 */
export interface GameTimeApi extends OverlayComposerApi, InputsComposerApi, SceneComposerApi, SurfaceComposerApi, PostProcessingComposerApi, ViewControllerComposerApi, OpenBwComposerApi {
    map: Chk;
    getCommands: () => CommandsStream;
    assets: Assets;
    exitScene(): void;
    sandboxApi: ReturnType<typeof createSandboxApi>;
    refreshScene(): void;
    simpleMessage(message: string): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/overlay-composer.ts

/** @internal */
declare type OverlayComposerApi = OverlayComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/overlay-composer.ts

/** @internal */
declare type OverlayComposer = {
    api: {
        isMouseInsideMinimap: () => boolean;
        getMouseMinimapUV: () => Vector2 | undefined;
    };
    minimapUv: Vector2 | undefined;
    insideMinimap: boolean;
    update(delta: number): void;
    onFrame(completedUpgrades: number[][]): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/input-composer.ts

/** @internal */
declare type InputsComposerApi = InputsComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/input-composer.ts

/** @internal */
declare type InputsComposer = ReturnType<typeof createInputComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/input-composer.ts

/**
 * Hanndles user input including unit selection events ( which is then sent through the message bus for other handlers to use ).
 */
/** @internal */
declare const createInputComposer: (world: World, { images, scene, simpleIndex }: SceneComposer) => {
    readonly mouse: MouseInput;
    readonly keyboard: ArrowKeyInput;
    readonly unitSelectionBox: {
        readonly status: UnitSelectionStatus;
        camera: import("three").Camera;
        enabled: boolean;
        readonly isActive: boolean;
        update(): void;
        getHoveredUnit(): Unit | undefined;
    };
    reset(): void;
    dispose: () => void;
    update(delta: number, elapsed: number, { sceneController }: ViewControllerComposer, overlay: OverlayComposer): void;
    api: {
        getHoveredUnit(): Unit | undefined;
        mouse: Pick<MouseInput, "mouseScrollY" | "screenDrag" | "lookAt" | "move" | "modifiers" | "clientX" | "clientY" | "clicked">;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/world.ts

/** @internal */
interface World {
    map: Chk;
    players: Players;
    commands: CommandsStream;
    fogOfWar: FogOfWar;
    fogOfWarEffect: FogOfWarEffect;
    openBW: OpenBW;
    settings: SettingsSessionStore;
    janitor: Janitor;
    events: TypeEmitter<WorldEvents>;
    reset(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/players.ts

/** @internal */
declare class Players extends Array<Player> {
    #private;
    originalColors: readonly string[];
    originalNames: readonly PlayerName[];
    constructor(players: BasePlayer[]);
    get(id: number): Player | undefined;
    static get [Symbol.species](): ArrayConstructor;
    togglePlayerVision(id: number): void;
    getVisionFlag(): number;
    setPlayerColors: (colors: readonly string[]) => void;
    setPlayerNames(players: PlayerName[]): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/player.ts

/** @internal */
interface Player {
    id: number;
    name: string;
    race: string;
    color: Color;
    vision: boolean;
    startLocation?: Vector3;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/players.ts

/** @internal */
declare type PlayerName = Pick<BasePlayer, "id" | "name">;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/players.ts

/**
 * @public
 */
export interface BasePlayer {
    id: number;
    name: string;
    color: string;
    race: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/process-replay/commands/commands-stream.ts

/**
 * A stream of game commands taken from the replay command buffer.
 */
/** @internal */
declare class CommandsStream {
    #private;
    constructor(buffer?: Buffer, stormPlayerToGamePlayer?: number[]);
    /**
     * Creates a copy of this CommandsStream.
     * @returns {CommandsStream}
     */
    copy(): CommandsStream;
    /**
     * Generates commands from the buffer.
     */
    generate(): Generator<number | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x: number;
        y: number;
        unitTag: number;
        unk?: undefined;
        unit: number;
        queued: number;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit: number;
        unitTags?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x: number;
        y: number;
        unk?: undefined;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags: number[];
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags: number[];
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType: number;
        group: number;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType: number;
        group: number;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        hotkeyType: number;
        group: number;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType: number;
        group: number;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType: number;
        group: number;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId: number;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId: number;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId: number;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId: number;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x: number;
        y: number;
        unitTag: number;
        unk?: undefined;
        unit?: undefined;
        queued: number;
        unitTypeId: number;
        order: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x: number;
        y: number;
        unk?: undefined;
        unit?: undefined;
        queued: number;
        unitTags?: undefined;
        unitTypeId: number;
        order: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x: number;
        y: number;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId: number;
        order: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x: number;
        y: number;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId: number;
        order: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId: number;
        order: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued: number;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x: number;
        y: number;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x: number;
        y: number;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        senderSlot: number;
        message: string;
        hotkeyType?: undefined;
        group?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        senderSlot: number;
        message: string;
        hotkeyType?: undefined;
        group?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        senderSlot: number;
        message: string;
        hotkeyType?: undefined;
        group?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        senderSlot: number;
        message: string;
        hotkeyType?: undefined;
        group?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        senderSlot: number;
        message: string;
        hotkeyType?: undefined;
        group?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        value: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        value: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        value: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        value: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        value: number;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        alliedVictory: boolean;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        alliedVictory: boolean;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        slotIds: number[];
        alliedVictory: boolean;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        alliedVictory: boolean;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        alliedVictory: boolean;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unit: number;
        queued: number;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTags: number[];
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x: number;
        y: number;
        unitTag: number;
        unk: number;
        unitTypeId: number;
        order: number;
        queued: number;
        unit?: undefined;
        unitTags?: undefined;
        slotIds: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        unitTag: number;
        x?: undefined;
        y?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        slotIds: number[];
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    } | {
        x?: undefined;
        y?: undefined;
        unitTag?: undefined;
        unk?: undefined;
        unit?: undefined;
        queued?: undefined;
        unitTags?: undefined;
        unitTypeId?: undefined;
        order?: undefined;
        hotkeyType?: undefined;
        group?: undefined;
        senderSlot?: undefined;
        message?: undefined;
        value?: undefined;
        slotIds?: undefined;
        alliedVictory?: undefined;
        frame: number;
        id: number;
        player: number;
        isUnknown: boolean;
        data: Buffer;
    }, void, unknown>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/fogofwar/fog-of-war.ts

/** @internal */
declare class FogOfWar {
    #private;
    texture: DataTexture;
    effect: FogOfWarEffect;
    buffer: Uint8Array;
    forceInstantUpdate: boolean;
    enabled: boolean;
    constructor(width: number, height: number, openBw: OpenBW, effect: FogOfWarEffect);
    onFrame(playerVision: number): void;
    isVisible(x: number, y: number): boolean;
    isExplored(x: number, y: number): boolean;
    isSomewhatVisible(x: number, y: number): boolean;
    isSomewhatExplored(x: number, y: number): boolean;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/fogofwar/fog-of-war-effect.ts

/** @internal */
declare class FogOfWarEffect extends Effect {
    constructor();
    set opacity(value: number);
    get opacity(): number;
    set mainCamera(camera: PerspectiveCamera | OrthographicCamera);
    get fog(): Texture;
    set fog(value: Texture);
    get fogResolution(): Vector2;
    set fogResolution(value: Vector2);
    get viewInverse(): Matrix4;
    set viewInverse(value: Matrix4);
    get projectionInverse(): Matrix4;
    set projectionInverse(value: Matrix4);
    get color(): Color;
    set color(value: Color);
    get fogUvTransform(): Vector4;
    set fogUvTransform(value: Vector4);
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/openbw/openbw.ts

/**
 * @public
 */
export interface OpenBW extends OpenBWWasm {
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/openbw.ts

/** @internal */
interface OpenBWWasm extends EmscriptenPreamble {
    _reset: () => void;
    _load_replay: (buffer: number, length: number) => void;
    _load_map: (buffer: number, length: number) => void;
    _upload_height_map: (buffer: number, length: number, width: number, height: number) => void;
    _load_replay_with_height_map: (replayBuffer: number, replayLength: number, buffer: number, length: number, width: number, height: number) => void;
    _next_frame: () => number;
    _next_no_replay: () => number;
    _create_unit: (unitId: number, playerId: number, x: number, y: number) => number;
    _counts: (index: number) => number;
    _get_buffer: (index: number) => number;
    _replay_get_value: (index: number) => number;
    _replay_set_value: (index: number, value: number) => void;
    _set_player_visibility: (playerId: number) => void;
    _generate_frame: () => void;
    get_util_funcs: () => {
        get_sounds: () => SoundStruct[];
        dump_unit: (unitAddr: number) => {
            id: number;
            resourceAmount?: number;
            remainingTrainTime?: number;
            upgrade?: {
                id: number;
                level: number;
                time: number;
            };
            research?: {
                id: number;
                time: number;
            };
            loaded?: number[];
            buildQueue?: number[];
        };
        kill_unit: (unitId: number) => number;
        remove_unit: (unitId: number) => number;
        issue_command: (unitId: number, command: number, targetId: number, x: number, y: number, extra: number) => boolean;
    };
    callMain: () => void;
    getExceptionMessage: (e: unknown) => string;
    setupCallbacks: (callbacks: Callbacks) => void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/emscripten.ts

/** @internal */
interface EmscriptenPreamble extends EmscriptenHeap {
    UTF8ToString: (ptr: number) => string | undefined;
    stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void;
    UTF16ToString(ptr: number): string | undefined;
    stringToUTF16(str: string, outPtr: number, maxBytesToWrite: number): void;
    UTF32ToString(ptr: number): string | undefined;
    stringToUTF32(str: string, outPtr: number, maxBytesToWrite: number): void;
    AsciiToString(ptr: number): string | undefined;
    intArrayFromString(stringy: string, dontAddNull: boolean, length: number): number[];
    intArrayToString(array: number[]): string;
    writeArrayToMemory(array: number[], buffer: number): void;
    writeAsciiToMemory(str: string, buffer: number, dontAddNull: boolean): void;
    ccall(ident: string, returnType: "number" | "string" | "boolean" | null, argTypes?: ("number" | "string" | "array" | "boolean")[], args?: (number | number[] | string | string[] | boolean | boolean[])[], opts?: {
        async: boolean;
    }): unknown;
    cwrap(ident: string, returnType: "number" | "string" | "array" | null, argTypes?: "number" | "string" | "boolean", opts?: {
        async: boolean;
    }): unknown;
    setValue(ptr: number, value: number, type: SetGetType): void;
    getValue(ptr: number, type: SetGetType): number;
    stackTrace(): string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/emscripten.ts

/** @internal */
interface EmscriptenHeap {
    HEAP8: Int8Array;
    HEAPU8: Uint8Array;
    HEAP16: Int16Array;
    HEAPU16: Uint16Array;
    HEAP32: Int32Array;
    HEAPU32: Uint32Array;
    allocate: (buffer: ArrayBuffer, flags: number) => number;
    _free: (buffer: number) => void;
    ALLOC_NORMAL: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/emscripten.ts
/** @internal */
declare type SetGetType = "i8" | "i16" | "i32" | "i64" | "float" | "double" | "i8*" | "i16*" | "i32*" | "i64*" | "float*" | "double*" | "*";

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/sound-struct.ts
/** @internal */
interface SoundStruct {
    typeId: number;
    unitTypeId: number | null;
    x: number;
    y: number;
    volume?: number;
    pan?: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/openbw.ts

/** @internal */
declare type Callbacks = {
    js_fatal_error?: (ptr: number) => string;
    js_pre_main_loop?: () => void;
    js_post_main_loop?: () => void;
    js_file_size?: (index: number) => number;
    js_read_data?: (index: number, dst: number, offset: number, size: number) => void;
    js_load_done?: () => void;
    js_file_index?: (ptr: number) => number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/openbw/openbw.ts

/**
 * @public
 * An interface layer between the OpenBW WASM module and the rest of the application.
 */
export declare class OpenBW implements OpenBW {
    #private;
    running: boolean;
    files?: OpenBWFileList;
    unitGenerationSize: number;
    /**
     * Load the WASM module and initialize the OpenBW instance.
     */
    init(): Promise<void>;
    isReplay(): boolean;
    isSandboxMode(): boolean;
    setSandboxMode: (sandbox: boolean) => boolean | undefined;
    /**
     * @param buffer the replay file buffer
     */
    loadReplay(buffer: Buffer): void;
    /**
     * OpenBW uses the height map to determine Y coordinates for units so that we don't have to.
     *
     * @param data the greyscale height map data
     * @param width width in px
     * @param height height inpx
     */
    uploadHeightMap: (data: Uint8ClampedArray, width: number, height: number) => void;
    /**
     * @param buffer the map file buffer
     */
    loadMap(buffer: Buffer): void;
    /**
     * Called after init() to call main() and provide data files.
     */
    start(readFile: ReadFile): Promise<void>;
    /**
     * Increments the game frame where openbw will run until the next frame.
     * If the game is in sandbox mode, the game will run at 24 fps.
     * @returns the game frame number
     */
    nextFrame: () => number;
    nextFrameSafe: () => number;
    nextFrameNoAdvance(): number;
    setGameSpeed(speed: number): void;
    getGameSpeed(): number;
    setCurrentFrame(frame: number): void;
    getCurrentFrame(): number;
    setCurrentReplayFrame(frame: number): void;
    getCurrentReplayFrame(): number;
    isPaused(): boolean;
    setPaused(paused: boolean): void;
    getPlayersAddress(): number;
    setUnitLimits(unitLimits: number): void;
    /**
     * Updates fog of war and creep data
     */
    generateFrame(): void;
    getFowSize(): number;
    getFowPtr(): number;
    setPlayerVisibility(visibility: number): void;
    getCreepSize(): number;
    getCreepPtr(): number;
    getCreepEdgesSize(): number;
    getCreepEdgesPtr(): number;
    getTilesPtr(): number;
    getTilesSize(): number;
    getSoundObjects(): SoundStruct[];
    getLastError(): number;
    getLastErrorMessage(): "Terrain displaces unit" | "Cannot create more units" | "Unable to create unit" | null;
    getSpritesOnTileLineSize(): number;
    getSpritesOnTileLineAddress(): number;
    getUnitsAddr(): number;
    getBulletsAddress(): number;
    getBulletsDeletedCount(): number;
    getBulletsDeletedAddress(): number;
    getSoundsAddress(): number;
    getSoundsCount(): number;
    getIScriptProgramDataSize(): number;
    getIScriptProgramDataAddress(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/openbw/openbw-filelist.ts

/** @internal */
declare class OpenBWFileList {
    private buffers;
    private index;
    unused: number[];
    private _cleared;
    normalize(path: string): string;
    constructor(openBw: OpenBWWasm);
    loadBuffers(readFile: (filename: string) => Promise<Buffer | Uint8Array>): Promise<void>;
    dumpFileList(): Promise<void>;
    clear(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/file.ts
/// <reference types="node" />
/** @internal */
declare type ReadFile = (filename: string) => Promise<Buffer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/settings-session-store.ts

/** @internal */
declare type SettingsSessionStore = ReturnType<typeof createSettingsSessionStore>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/settings-session-store.ts

/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
/** @internal */
declare const createSettingsSessionStore: (events: TypeEmitter<WorldEvents>) => {
    vars: SessionVariables;
    dispose: () => void;
    getState: () => {
        session: {
            type: "replay" | "live" | "map";
            sandbox: boolean;
            audioListenerDistance: number;
        };
        audio: {
            global: number;
            music: number;
            sound: number;
            playIntroSounds: boolean;
        };
        input: {
            sceneController: string;
            dampingFactor: number;
            movementSpeed: number;
            rotateSpeed: number;
            cameraShakeStrength: number;
            zoomLevels: [number, number, number];
            unitSelection: boolean;
            cursorVisible: boolean;
        };
        minimap: {
            mode: "2d" | "3d";
            position: [number, number];
            rotation: [number, number, number];
            scale: number;
            enabled: boolean;
            opacity: number;
            softEdges: boolean;
            interactive: boolean;
            drawCamera: boolean;
        };
        postprocessing: {
            anisotropy: number;
            antialias: number;
            bloom: number;
            brightness: number;
            contrast: number;
            fogOfWar: number;
        };
        postprocessing3d: {
            anisotropy: number;
            antialias: number;
            toneMapping: number;
            bloom: number;
            brightness: number;
            contrast: number;
            depthFocalLength: number;
            depthBokehScale: number;
            depthBlurQuality: number;
            depthFocalRange: number;
            fogOfWar: number;
            envMap: number;
            sunlightDirection: [number, number, number];
            sunlightColor: string;
            sunlightIntensity: number;
            shadowQuality: number;
        };
    };
    setValue: (path: string[], value: unknown) => void;
    getValue: (path: string[]) => unknown;
    merge: (rhs: {
        session?: {
            type?: "replay" | "live" | "map" | undefined;
            sandbox?: boolean | undefined;
            audioListenerDistance?: number | undefined;
        } | undefined;
        audio?: {
            global?: number | undefined;
            music?: number | undefined;
            sound?: number | undefined;
            playIntroSounds?: boolean | undefined;
        } | undefined;
        input?: {
            sceneController?: string | undefined;
            dampingFactor?: number | undefined;
            movementSpeed?: number | undefined;
            rotateSpeed?: number | undefined;
            cameraShakeStrength?: number | undefined;
            zoomLevels?: [(number | undefined)?, (number | undefined)?, (number | undefined)?] | undefined;
            unitSelection?: boolean | undefined;
            cursorVisible?: boolean | undefined;
        } | undefined;
        minimap?: {
            mode?: "2d" | "3d" | undefined;
            position?: [(number | undefined)?, (number | undefined)?] | undefined;
            rotation?: [(number | undefined)?, (number | undefined)?, (number | undefined)?] | undefined;
            scale?: number | undefined;
            enabled?: boolean | undefined;
            opacity?: number | undefined;
            softEdges?: boolean | undefined;
            interactive?: boolean | undefined;
            drawCamera?: boolean | undefined;
        } | undefined;
        postprocessing?: {
            anisotropy?: number | undefined;
            antialias?: number | undefined;
            bloom?: number | undefined;
            brightness?: number | undefined;
            contrast?: number | undefined;
            fogOfWar?: number | undefined;
        } | undefined;
        postprocessing3d?: {
            anisotropy?: number | undefined;
            antialias?: number | undefined;
            toneMapping?: number | undefined;
            bloom?: number | undefined;
            brightness?: number | undefined;
            contrast?: number | undefined;
            depthFocalLength?: number | undefined;
            depthBokehScale?: number | undefined;
            depthBlurQuality?: number | undefined;
            depthFocalRange?: number | undefined;
            fogOfWar?: number | undefined;
            envMap?: number | undefined;
            sunlightDirection?: [(number | undefined)?, (number | undefined)?, (number | undefined)?] | undefined;
            sunlightColor?: string | undefined;
            sunlightIntensity?: number | undefined;
            shadowQuality?: number | undefined;
        } | undefined;
    }) => void;
    operate: (action: Operation, transformPath?: ((path: string[]) => string[]) | undefined) => void;
    createVariable: (path: string[]) => ((value?: unknown) => unknown) & {
        set: (value: any) => void;
        get: () => unknown;
        inc: () => void;
        incCycle: () => void;
        dec: () => void;
        decCycle: () => void;
        min: () => void;
        max: () => void;
        reset: () => void;
        toggle: () => void;
    };
    sourceOfTruth: SourceOfTruth<{
        session: {
            type: "replay" | "live" | "map";
            sandbox: boolean;
            audioListenerDistance: number;
        };
        audio: {
            global: number;
            music: number;
            sound: number;
            playIntroSounds: boolean;
        };
        input: {
            sceneController: string;
            dampingFactor: number;
            movementSpeed: number;
            rotateSpeed: number;
            cameraShakeStrength: number;
            zoomLevels: [number, number, number];
            unitSelection: boolean;
            cursorVisible: boolean;
        };
        minimap: {
            mode: "2d" | "3d";
            position: [number, number];
            rotation: [number, number, number];
            scale: number;
            enabled: boolean;
            opacity: number;
            softEdges: boolean;
            interactive: boolean;
            drawCamera: boolean;
        };
        postprocessing: {
            anisotropy: number;
            antialias: number;
            bloom: number;
            brightness: number;
            contrast: number;
            fogOfWar: number;
        };
        postprocessing3d: {
            anisotropy: number;
            antialias: number;
            toneMapping: number;
            bloom: number;
            brightness: number;
            contrast: number;
            depthFocalLength: number;
            depthBokehScale: number;
            depthBlurQuality: number;
            depthFocalRange: number;
            fogOfWar: number;
            envMap: number;
            sunlightDirection: [number, number, number];
            sunlightColor: string;
            sunlightIntensity: number;
            shadowQuality: number;
        };
    }>;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/type-emitter.ts

/**
 * @public
 */
export declare class TypeEmitter<T> {
    #private;
    on<K extends keyof T>(s: K, listener: (v: T[K]) => void): () => void;
    off<K extends keyof T>(s: K, listener: (v: T[K]) => void): void;
    emit(s: keyof T, v?: T[keyof T]): undefined | false;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/world-events.ts

/** @internal */
interface WorldEvents {
    "unit-created": Unit;
    "unit-killed": Unit;
    "unit-destroyed": Unit;
    "followed-units-changed": Unit[];
    "selected-units-changed": Unit[];
    "completed-upgrade": {
        owner: number;
        typeId: number;
        level: number;
    };
    "completed-tech": {
        owner: number;
        typeId: number;
    };
    "frame-reset": number;
    "minimap-enter": undefined;
    "minimap-leave": undefined;
    "image-destroyed": ImageBase;
    "image-updated": ImageBase;
    "image-created": ImageBase;
    "units-cleared": undefined;
    "settings-changed": {
        settings: SessionSettingsData;
        rhs: DeepPartial<SessionSettingsData>;
    };
    "plugin-configuration-changed": {
        settings: SessionSettingsData;
        rhs: DeepPartial<SessionSettingsData>;
    };
    "resize": GameSurface;
    "box-selection-start": undefined;
    "box-selection-move": undefined;
    "box-selection-end": Unit[];
    "box-selection-enabled": boolean;
    "scene-controller-exit": string;
    "scene-controller-enter": string;
    "world-start": undefined;
    "world-end": undefined;
    "dispose": undefined;
    "mouse-click": MouseEventDTO;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/unit.ts

/**
 * @public
 * A unit (and its state) in the game.
 */
export interface Unit extends UnitStruct {
    extras: {
        recievingDamage: number;
        selected?: boolean;
        dat: UnitDAT;
    };
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/unit-struct.ts

/** @internal */
interface UnitStruct extends FlingyStruct {
    id: number;
    typeId: number;
    owner: number;
    energy: number;
    shields: number;
    statusFlags: number;
    remainingBuildTime: number;
    resourceAmount: number;
    order: number | null;
    kills: number;
    orderTargetAddr: number;
    orderTargetX: number;
    orderTargetY: number;
    orderTargetUnit: number;
    /**
     * @internal
     */
    subunit: UnitStruct | null;
    subunitId: number | null;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/flingy-struct.ts

/** @internal */
interface FlingyStruct extends ThingyStruct {
    x: number;
    y: number;
    direction: number;
    moveTargetX: number;
    moveTargetY: number;
    nextMovementWaypointX: number;
    nextMovementWaypointY: number;
    nextTargetWaypointX: number;
    nextTargetWaypointY: number;
    movementFlags: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/thingy-struct.ts
/** @internal */
interface ThingyStruct {
    hp: number;
    /**
     * @internal
     */
    spriteIndex: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/scene-composer.ts

/** @internal */
declare const createSceneComposer: (world: World, assets: Assets) => Promise<{
    images: ImageEntities;
    sprites: SpriteEntities;
    units: UnitEntities;
    simpleIndex: Record<string, ImageBase[]>;
    selectedUnits: IterableSet<Unit>;
    followedUnits: IterableSet<Unit>;
    scene: BaseScene;
    terrain: Terrain;
    terrainExtra: {
        minimapTex: import("three").DataTexture;
        creep: Creep;
        heightMaps: {
            texture: import("three").Texture;
            displaceCanvas: HTMLCanvasElement;
            displacementImage: ImageData;
            singleChannel: Uint8ClampedArray;
        };
        dispose(): void;
    };
    pxToWorld: PxToWorld;
    pxToWorldInverse: PxToWorld;
    startLocations: Vector3[];
    onFrame(delta: number, elapsed: number, viewport: GameViewPort | boolean, direction?: number): void;
    resetImageCache(): void;
    api: {
        getPlayers: () => Players;
        toggleFogOfWarByPlayerId(playerId: number): void;
        pxToWorld: PxToWorld;
        readonly units: IterableMap<number, Unit>;
        simpleIndex: Record<string, ImageBase[]>;
        scene: BaseScene;
        followedUnits: IterableSet<Unit>;
        startLocations: Vector3[];
        getFollowedUnitsCenterPosition: () => Vector3 | undefined;
        selectedUnits: IterableSet<Unit>;
    };
}>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/assets.ts

/**
 * @public
 * Most game assets excepting sprites / images.
 */
export declare type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
} & Partial<Awaited<ReturnType<typeof generateUIIcons>>>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/assets.ts

/** @internal */
declare const initializeAssets: (directories: {
    starcraft: string;
    assets: string;
}) => Promise<{
    selectionCircles: {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    }[];
    minimapConsole: {
        clock: import("three").CompressedTexture;
        square: import("three").CompressedTexture;
    };
    loadImageAtlas(imageId: number, bwDat: BwDAT): {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    } | undefined;
    getImageAtlas(imageId: number): AnimAtlas | undefined;
    hasImageAtlas(imageId: number): boolean;
    loadImageAtlasAsync(imageId: number, bwDat: BwDAT): Promise<void>;
    skyBox: CubeTexture;
    refId: (id: number) => number;
    resetAssetCache: () => void;
    arrowIconsGPU: LegacyGRP;
    hoverIconsGPU: LegacyGRP;
    dragIconsGPU: LegacyGRP;
    remaining: number;
    atlases: {
        isHD: boolean;
        isHD2: boolean;
        diffuse: import("three").CompressedTexture;
        imageIndex: number;
        frames: {
            x: number;
            y: number;
            w: number;
            h: number;
            xoff: number;
            yoff: number;
        }[];
        uvPos: {
            pos: import("three").BufferAttribute;
            uv: import("three").BufferAttribute;
            flippedPos: import("three").BufferAttribute;
            flippedUv: import("three").BufferAttribute;
        }[];
        uvPosDataTex: import("three").DataArrayTexture;
        textureWidth: number;
        textureHeight: number;
        spriteWidth: number;
        spriteHeight: number;
        unitTileScale: UnitTileScale;
        teammask: import("three").CompressedTexture | undefined;
        hdLayers: {
            emissive: import("three").CompressedTexture | undefined;
        };
        dispose(): void;
    }[];
}>;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/image.ts

/** @internal */
declare enum UnitTileScale {
    SD = 1,
    HD2 = 2,
    HD = 4
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/bw-dat.ts

/**
 * @public
 */
export interface BwDAT {
    iscript: IScriptDATType;
    sounds: SoundDAT[];
    tech: TechDataDAT[];
    upgrades: UpgradeDAT[];
    orders: OrderDAT[];
    units: UnitDAT[];
    images: ImageDAT[];
    los: LoDAT[];
    sprites: SpriteDAT[];
    weapons: WeaponDAT[];
    grps: GrpSprite[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/iscript.ts

/** @internal */
interface IScriptDATType {
    iscripts: Record<number, IScriptProgram>;
    animations: Record<number, IScriptAnimation>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/iscript.ts

/** @internal */
interface IScriptProgram {
    id: number;
    type: number;
    offset: number;
    offsets: number[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/iscript.ts

/** @internal */
declare type IScriptAnimation = IScriptOperations[];

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/iscript.ts

/** @internal */
declare type IScriptOperations = [string, number[]];

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/sounds-dat.ts

/**
 * @public
 */
export interface SoundDAT {
    file: string;
    priority: number;
    flags: number;
    race: number;
    minVolume: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/tech-data-dat.ts

/**
 * @public
 */
export interface TechDataDAT {
    mineralCost: number;
    vespeneCost: number;
    researchTime: number;
    energyRequired: number;
    researchRequirements: number;
    useRequirements: number;
    icon: number;
    name: string;
    race: number;
    researched: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/enums/upgrades.ts
/** @internal */
declare enum upgrades {
    terranInfantryArmor = 0,
    terranVehiclePlating = 1,
    terranShipPlating = 2,
    zergCarapace = 3,
    zergFlyerCarapace = 4,
    protossArmor = 5,
    protossPlating = 6,
    terranInfantryWeapons = 7,
    terranVehicleWeapons = 8,
    terranShipWeapons = 9,
    zergMeleeAttacks = 10,
    zergMissileAttacks = 11,
    zergFlyerAttacks = 12,
    protossGroundWeapons = 13,
    protossAirWeapons = 14,
    protossPlasmaShields = 15,
    u238Shells = 16,
    ionThrusters = 17,
    burstLasers = 18,
    titanReactor = 19,
    ocularImplants = 20,
    moebiusReactor = 21,
    apolloReactor = 22,
    colossusReactor = 23,
    ventralSacs = 24,
    antennae = 25,
    pneumatizedCarapace = 26,
    metabolicBoost = 27,
    adrenalGlands = 28,
    muscularAugments = 29,
    groovedSpines = 30,
    gameteMeiosis = 31,
    metasynapticNode = 32,
    singularityCharge = 33,
    legEnhancements = 34,
    scarabDamage = 35,
    reaverCapacity = 36,
    graviticDrive = 37,
    sensorArray = 38,
    graviticBoosters = 39,
    khaydarinAmulet = 40,
    apialSensors = 41,
    graviticThrusters = 42,
    carrierCapacity = 43,
    khaydarinCore = 44,
    unk45 = 45,
    unk46 = 46,
    argusJewel = 47,
    unk48 = 48,
    argusTalisman = 49,
    unk50 = 50,
    caduceusReactor = 51,
    chitinousPlating = 52,
    anabolicSynthesis = 53,
    charonBooster = 54
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/upgrades-dat.ts

/**
 * @public
 */
export interface UpgradeDAT {
    mineralCostBase: number;
    mineralCostFactor: number;
    vespeneCostFactor: number;
    vespeneCostBase: number;
    researchTimeBase: number;
    researchTimeFactor: number;
    requirements: number;
    icon: number;
    name: string;
    maxRepeats: number;
    race: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/enums/orders.ts
/** @internal */
declare enum orders {
    die = 0,
    stop = 1,
    gaurd = 2,
    playerGaurd = 3,
    turretGaurd = 4,
    bunkerGaurd = 5,
    move = 6,
    stopReaver = 7,
    attack1 = 8,
    attack2 = 9,
    attackUnit = 10,
    attackFixedRange = 11,
    attackTile = 12,
    hover = 13,
    attackMove = 14,
    infestedCommandCenter = 15,
    unusedNothing = 16,
    unusedPowerup = 17,
    towerGaurd = 18,
    towerAttack = 19,
    vultureMine = 20,
    stayInRange = 21,
    turretAttack = 22,
    nothing = 23,
    unused24 = 24,
    droneStartBuild = 25,
    droneBuild = 26,
    castInfestation = 27,
    moveToInfest = 28,
    infestingCommandCenter = 29,
    placeBuilding = 30,
    placeProtossBuilding = 31,
    createProtossBuilding = 32,
    constructingBuilding = 33,
    repair = 34,
    moveToRepair = 35,
    placeAddOn = 36,
    buildAddOn = 37,
    train = 38,
    rallyPointUnit = 39,
    rallyPointTile = 40,
    zergBirth = 41,
    zergUnitMorph = 42,
    zergBuildingMorph = 43,
    incompleteBuilding = 44,
    incompleteMorphing = 45,
    buildNydusExit = 46,
    enterNydusCanal = 47,
    incompleteWarping = 48,
    follow = 49,
    carrier = 50,
    reaverCarrierMove = 51,
    carrierStop = 52,
    carrierAttack = 53,
    carrierMoveToAttack = 54,
    carrierIgnore2 = 55,
    carrierFight = 56,
    carrierHoldPosition = 57,
    reaver = 58,
    reaverAttack = 59,
    reaverMoveToAttack = 60,
    reaverFight = 61,
    reaverHoldPosition = 62,
    trainFighter = 63,
    interceptorAttack = 64,
    scarabAttack = 65,
    rechargeShieldsUnit = 66,
    rechargeShieldsBattery = 67,
    shieldBattery = 68,
    interceptorReturn = 69,
    droneLand = 70,
    buildingLand = 71,
    buildingLiftOff = 72,
    droneLiftOff = 73,
    liftingOff = 74,
    researchTech = 75,
    upgrade = 76,
    larva = 77,
    spawningLarva = 78,
    harvest1 = 79,
    harvest2 = 80,
    moveToGas = 81,
    waitForGas = 82,
    harvestGas = 83,
    returnGas = 84,
    moveToMinerals = 85,
    waitForMinerals = 86,
    miningMinerals = 87,
    harvest3 = 88,
    harvest4 = 89,
    returnMinerals = 90,
    interrupted = 91,
    enterTransport = 92,
    pickupIdle = 93,
    pickupTransport = 94,
    pickupBunker = 95,
    pickup4 = 96,
    powerupIdle = 97,
    sieging = 98,
    unsieging = 99,
    watchTarget = 100,
    initCreepGrowth = 101,
    spreadCreep = 102,
    stoppingCreepGrowth = 103,
    guardianAspect = 104,
    archonWarp = 105,
    completingArchonSummon = 106,
    holdPosition = 107,
    queenHoldPosition = 108,
    cloak = 109,
    decloak = 110,
    unload = 111,
    moveUnload = 112,
    fireYamatoGun = 113,
    moveToFireYamatoGun = 114,
    castLockdown = 115,
    burrowing = 116,
    burrowed = 117,
    unburrowing = 118,
    castDarkSwarm = 119,
    castParasite = 120,
    castSpawnBroodlings = 121,
    castEmpShockwave = 122,
    nukeWait = 123,
    nukeTrain = 124,
    nukeLaunch = 125,
    nukePaint = 126,
    nukeUnit = 127,
    castNuclearStrike = 128,
    nukeTrack = 129,
    initializeArbiter = 130,
    cloakNearbyUnits = 131,
    placeSpiderMine = 132,
    rightClickAction = 133,
    suicideUnit = 134,
    suicideTile = 135,
    suicideHoldPosition = 136,
    castRecall = 137,
    teleport = 138,
    castScannerSweep = 139,
    scanner = 140,
    castDefensiveMatrix = 141,
    castPsionicStorm = 142,
    castIrradiate = 143,
    castPlague = 144,
    castConsume = 145,
    castEnsnare = 146,
    castStasisField = 147,
    castHallucination = 148,
    hallucination2 = 149,
    resetCollision = 150,
    resetHarvestCollision = 151,
    patrol = 152,
    CTFCOPInit = 153,
    CTFCOPStarted = 154,
    CTFCOP2 = 155,
    computerAI = 156,
    atkMoveEp = 157,
    harrassMove = 158,
    AIPatrol = 159,
    guardPost = 160,
    rescuePassive = 161,
    neutral = 162,
    computerReturn = 163,
    InitializePsiProvider = 164,
    scarabSelfDestructing = 165,
    critter = 166,
    hiddenGun = 167,
    openDoor = 168,
    closeDoor = 169,
    hideTrap = 170,
    revealTrap = 171,
    enableDoodad = 172,
    disableDoodad = 173,
    warpIn = 174,
    medic = 175,
    medicHeal = 176,
    medicHealMove = 177,
    medicHoldPosition = 178,
    medicHealToIdle = 179,
    castRestoration = 180,
    castDisruptionWeb = 181,
    castMindControl = 182,
    darkArchonMeld = 183,
    castFeedback = 184,
    castOpticalFlare = 185,
    castMaelstrom = 186,
    junkYardDog = 187,
    fatal = 188,
    none = 189
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/orders-dat.ts

/**
 * @public
 */
export interface OrderDAT {
    name: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export interface UnitDAT extends UnitDATIncomingType {
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export interface UnitDATIncomingType {
    index: number;
    flingy: any;
    subUnit1: number;
    subUnit2: number;
    infestation: number[];
    constructionImage: number;
    direction: number;
    shieldsEnabled: boolean;
    shields: number;
    hp: number;
    elevationLevel: number;
    groundWeapon: number;
    airWeapon: number;
    sightRange: number;
    armorUpgrade: number;
    unitSize: number;
    armor: number;
    readySound: number;
    whatSound: number[];
    yesSound: number[];
    pissSound: number[];
    whatSoundStart: number;
    whatSoundEnd: number;
    yesSoundStart: number;
    yesSoundEnd: number;
    pissSoundStart: number;
    pissSoundEnd: number;
    placementWidth: number;
    placementHeight: number;
    addonHorizontal: number;
    addonVertical: number;
    unitSizeLeft: number;
    unitSizeUp: number;
    unitSizeRight: number;
    unitSizeDown: number;
    portrait: number;
    mineralCost: number;
    vespeneCost: number;
    buildTime: number;
    requirements: number;
    starEditGroupFlags: number;
    supplyProvided: number;
    supplyRequired: number;
    spaceRequired: number;
    spaceProvided: number;
    buildScore: number;
    destroyScore: number;
    starEditAvailabilityFlags: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/units-dat.ts

/**
 * @public
 */
export declare class UnitDAT implements UnitDAT {
    specialAbilityFlags: number;
    starEditGroupFlags: number;
    name: string;
    isBuilding: boolean;
    isAddon: boolean;
    isFlyer: boolean;
    isResourceMiner: boolean;
    isTurret: boolean;
    isFlyingBuilding: boolean;
    isHero: boolean;
    regenerates: boolean;
    animatedIdle: boolean;
    cloakable: boolean;
    twoUnitsInOneEgg: boolean;
    singleEntity: boolean;
    isResourceDepot: boolean;
    isResourceContainer: boolean;
    isRobotic: boolean;
    isDetector: boolean;
    isOrganic: boolean;
    requiresCreep: boolean;
    unusedFlag: boolean;
    requiresPsi: boolean;
    burrowable: boolean;
    isSpellcaster: boolean;
    permanentCloak: boolean;
    pickupItem: boolean;
    ignoreSupplyCheck: boolean;
    useMediumOverlays: boolean;
    useLargeOverlays: boolean;
    battleReactions: boolean;
    fullAutoAttack: boolean;
    invincible: boolean;
    isMechanical: boolean;
    producesUnits: boolean;
    isZerg: boolean;
    isTerran: boolean;
    isProtoss: boolean;
    constructor(data: UnitDATIncomingType);
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/images-dat.ts

/**
 * @public
 */
export interface ImageDAT {
    index: number;
    grpFile: string;
    name: string;
    grp: number;
    gfxTurns: number;
    clickable: number;
    useFullIscript: number;
    drawIfCloaked: number;
    drawFunction: number;
    remapping: number;
    iscript: number;
    shieldOverlay: number;
    attackOverlay: number;
    damageOverlay: number;
    specialOverlay: number;
    landingDustOverlay: number;
    liftOffDustOverlay: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/parse-lo.ts
/// <reference types="node" />
/**
 * @public
 */
export declare type LoDAT = number[][][];

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/sprites-dat.ts

/**
 * @public
 */
export interface SpriteDAT {
    image: ImageDAT;
    name: string;
    index: number;
    healthBar: number;
    visible: number;
    selectionCircle: {
        size: number;
        index: number;
    };
    selectionCircleOffset: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/weapons-dat.ts

/**
 * @public
 */
export interface WeaponDAT {
    index: number;
    name: string;
    flingy: FlingyDAT;
    targetFlags: number;
    minRange: number;
    maxRange: number;
    damageUpgrade: number;
    damageType: number;
    weaponBehavior: number;
    lifetime: number;
    explosionType: number;
    innerSplashRange: number;
    mediumSplashRange: number;
    outerSplashRange: number;
    damageAmount: number;
    damageBonus: number;
    weaponCooldown: number;
    damageFactor: number;
    attackAngle: number;
    launchSpin: number;
    forwardOffset: number;
    upwardOffset: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/flingy-dat.ts

/**
 * @public
 */
export interface FlingyDAT {
    sprite: SpriteDAT;
    speed: number;
    acceleration: number;
    haltDistance: number;
    turnRadius: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/anim-grp.ts

/** @internal */
declare type GrpSprite = {
    w: number;
    h: number;
    frames: AnimFrame[];
    maxFrameH: number;
    maxFramew: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/anim-grp.ts
/// <reference types="node" />
/** @internal */
declare type AnimFrame = {
    x: number;
    y: number;
    w: number;
    h: number;
    xoff: number;
    yoff: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/atlas/load-anim-atlas.ts

/** @internal */
declare type AnimAtlas = ReturnType<typeof loadAnimAtlas>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/atlas/load-anim-atlas.ts

/** @internal */
declare const loadAnimAtlas: (buf: Buffer, imageIndex: number, scale: Exclude<UnitTileScale, "SD">) => {
    isHD: boolean;
    isHD2: boolean;
    diffuse: import("three").CompressedTexture;
    imageIndex: number;
    frames: {
        x: number;
        y: number;
        w: number;
        h: number;
        xoff: number;
        yoff: number;
    }[];
    uvPos: {
        pos: BufferAttribute;
        uv: BufferAttribute;
        flippedPos: BufferAttribute;
        flippedUv: BufferAttribute;
    }[];
    uvPosDataTex: DataArrayTexture;
    textureWidth: number;
    textureHeight: number;
    spriteWidth: number;
    spriteHeight: number;
    unitTileScale: UnitTileScale;
    teammask: import("three").CompressedTexture | undefined;
    hdLayers: {
        emissive: import("three").CompressedTexture | undefined;
    };
    dispose(): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/atlas/legacy-grp.ts

/** @internal */
declare class LegacyGRP {
    width: number;
    height: number;
    grpWidth: number;
    grpHeight: number;
    texture: DataTexture;
    teamcolor?: DataTexture;
    frames: {
        x: number;
        y: number;
        grpX: number;
        grpY: number;
        w: number;
        h: number;
    }[];
    constructor();
    load({ readGrp, imageDef, palettes, }: {
        readGrp: () => Promise<Buffer>;
        imageDef: ImageDAT;
        palettes: Palettes;
    }, stride?: number): Promise<this>;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/atlas/legacy-grp.ts

/** @internal */
declare type Palettes = Uint8Array[] & {
    dark?: Buffer;
    light?: Buffer;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/generate-icons/generate-icons.ts

/** @internal */
declare const generateUIIcons: (readFile: ReadFile) => Promise<{
    cmdIcons: ArrayBuffer[];
    gameIcons: {
        minerals: Blob;
        vespeneZerg: Blob;
        vespeneTerran: Blob;
        vespeneProtoss: Blob;
        zerg: Blob;
        terran: Blob;
        protoss: Blob;
        energy: Blob;
    };
    raceInsetIcons: {
        zerg: Blob;
        terran: Blob;
        protoss: Blob;
    };
    workerIcons: {
        apm: ArrayBuffer | SharedArrayBuffer;
        terran: ArrayBuffer | SharedArrayBuffer;
        zerg: ArrayBuffer | SharedArrayBuffer;
        protoss: ArrayBuffer | SharedArrayBuffer;
    };
}>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-entities.ts

/**
 * A collection of all images in the game.
 */
/** @internal */
declare class ImageEntities {
    #private;
    use3dImages: boolean;
    onCreateImage?: (image: ImageBase) => void;
    onFreeImage?: (image: ImageBase) => void;
    constructor();
    [Symbol.iterator](): IterableIterator<ImageBase>;
    get(imageIndex: number): ImageBase | undefined;
    getOrCreate(imageIndex: number, imageTypeId: number): ImageBase | undefined;
    free(imageIndex: number): void;
    clear(): void;
    dispose(): void;
    setUnit(image: ImageBase, unit: Unit): void;
    getUnit(image: ImageBase): Unit | undefined;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-base.ts

/**
 * Base structure for how starcraft image objects are represented in three.js
 */
/** @internal */
interface ImageBase extends Object3D {
    atlas?: AnimAtlas;
    isImageHd: boolean;
    isImage3d: boolean;
    isInstanced?: boolean;
    dat: ImageDAT;
    _zOff: number;
    frame: number;
    setModifiers: (modifier: number, modifierData1: number, modifierData2: number) => void;
    setTeamColor: (color: Color | undefined) => void;
    setEmissive?(val: number): void;
    updateImageType(atlas: AnimAtlas, force?: boolean): ImageBase;
    setFrame: (frame: number, flip: boolean) => void;
    readonly unitTileScale: UnitTileScale;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/image-utils.ts

/** @internal */
declare const isImageHd: (image: Object3D) => image is ImageHD;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-hd.ts

/**
 * A threejs mesh for a starcraft image.
 */
/** @internal */
declare class ImageHD extends Mesh<BufferGeometry, ImageHDMaterial | ImageHDInstancedMaterial> implements ImageBase {
    #private;
    isImageHd: boolean;
    isImage3d: boolean;
    isInstanced: boolean;
    atlas?: AnimAtlas;
    _zOff: number;
    protected spriteWidth: number;
    protected spriteHeight: number;
    constructor();
    protected createMaterial(): ImageHDMaterial | ImageHDInstancedMaterial;
    get dat(): ImageDAT;
    updateImageType(atlas: AnimAtlas, force: boolean): this;
    get unitTileScale(): UnitTileScale;
    get frames(): {
        x: number;
        y: number;
        w: number;
        h: number;
        xoff: number;
        yoff: number;
    }[];
    setTeamColor(val: Color | undefined): void;
    setModifiers(modifier: number, modifierData1: number, modifierData2: number): void;
    setOpacityFromModifiers(modifier: number, modifierData1: number): void;
    setOpacity(val: number): void;
    get frame(): number;
    set frame(val: number);
    get flip(): boolean;
    set flip(val: boolean);
    setFrame(frame: number, flip: boolean): void;
    raycast(raycaster: Raycaster, intersects: Intersection[]): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-hd-material.ts

/** @internal */
declare class ImageHDMaterial extends MeshBasicMaterial {
    #private;
    isTeamSpriteMaterial: boolean;
    constructor(parameters?: SpriteMaterialParameters);
    set teamMask(val: Texture | undefined);
    get teamMask(): Texture | undefined;
    set teamColor(val: Color);
    get teamColor(): Color;
    set uvPosTex(val: Texture);
    set frame(val: number);
    set flipped(val: boolean);
    set warpInFlashGRP(val: AnimAtlas | undefined);
    set modifierData(val: Vector2);
    get modifierData(): Vector2;
    set modifier(val: number);
    get modifier(): number;
    set localMatrix(val: Matrix4);
    get localMatrix(): Matrix4;
    set parentMatrix(val: Matrix4);
    get parentMatrix(): Matrix4;
    onBeforeCompile(shader: Shader): void;
    customProgramCacheKey(): string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-hd-instanced-material.ts

/** @internal */
declare class ImageHDInstancedMaterial extends MeshBasicMaterial {
    #private;
    isTeamSpriteMaterial: boolean;
    flatProjection: boolean;
    constructor(parameters?: SpriteMaterialParameters);
    set teamMask(val: Texture | undefined);
    get teamMask(): Texture | undefined;
    set teamColor(val: Color);
    get teamColor(): Color;
    set warpInFlashGRP(val: AnimAtlas | undefined);
    set modifierData(val: Vector2);
    get modifierData(): Vector2;
    set modifier(val: number);
    get modifier(): number;
    set uvPosTex(val: Texture);
    onBeforeCompile(shader: Shader): void;
    customProgramCacheKey(): string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/image-utils.ts

/** @internal */
declare const isImage3d: (image: Object3D) => image is Image3D;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-3d.ts

/**
 * Starcraft image as a 3D object in GLB format with animations.
 */
/** @internal */
declare class Image3D extends Object3D implements ImageBase {
    #private;
    isImageHd: boolean;
    isImage3d: boolean;
    isInstanced: boolean;
    atlas: GltfAtlas;
    mixer?: AnimationMixer;
    model: GltfAtlas["model"];
    mesh: Mesh;
    boundingBox: Box3;
    boundingSphere: Sphere;
    readonly image3dMaterial: Image3DMaterial;
    _zOff: number;
    constructor(atlas: GltfAtlas);
    get dat(): ImageDAT;
    updateImageType(): this;
    get unitTileScale(): UnitTileScale;
    setTeamColor(val?: Color | undefined): void;
    setModifiers(): void;
    get frames(): {
        x: number;
        y: number;
        w: number;
        h: number;
        xoff: number;
        yoff: number;
    }[];
    setFrame(frame: number): void;
    setFrameSet(frameSet: number): void;
    setEmissive(val: number): void;
    get frame(): number;
    get frameSet(): number;
    get isLooseFrame(): boolean;
    static clone(source: Object3D): Object3D<import("three").Object3DEventMap>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/atlas/load-glb-atlas.ts

/** @internal */
interface GltfAtlas extends AnimAtlas {
    isGLTF: boolean;
    model: Object3D;
    mesh: Mesh<BufferGeometry, MeshStandardMaterial> | SkinnedMesh<BufferGeometry, MeshStandardMaterial>;
    animations: AnimationClip[];
    fixedFrames: number[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/global.ts

/**
 * INTERCEPTS IPC MESSAGES AND PUSHES THEM INTO THE GLOBAL EVENT BUS. WE DO THIS TO KEEP THINGS CLEAN.
 * ALSO CREATES GLOBAL SOUND MIXER AND MUSIC PLAYER
 */
/** @internal */
declare const mixer: MainMixer;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/audio/main-mixer.ts

/** @internal */
declare class MainMixer {
    intro: GainNode;
    sound: GainNode;
    music: GainNode;
    gain: GainNode;
    context: AudioContext;
    compressor: DynamicsCompressorNode;
    constructor();
    getInput(): GainNode;
    get masterVolume(): number;
    set masterVolume(val: number);
    get soundVolume(): number;
    set soundVolume(val: number);
    get musicVolume(): number;
    set musicVolume(val: number);
    setVolumes(volumes: Settings["audio"]): void;
    update({ x, y, z }: Vector3, orientation: Quaternion, delta: number): void;
    get position(): Vector3;
    noise(length?: number, loop?: boolean): {
        source: AudioBufferSourceNode;
        gain: GainNode;
    };
    loadAudioBuffer(filenameOrId: string | number): Promise<AudioBuffer>;
    connect(...args: AudioNode[]): () => void;
    createGain(value: number): GainNode;
    createDistortion(k?: number): WaveShaperNode;
    smoothStop(gain: GainNode, delta?: number, decay?: number): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
declare type Settings = SettingsV6;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
interface SettingsV6 {
    version: 6;
    language: string;
    session: {
        type: "replay" | "live" | "map";
        sandbox: boolean;
        audioListenerDistance: number;
    };
    directories: {
        starcraft: string;
        maps: string;
        replays: string;
        assets: string;
        plugins: string;
    };
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean;
    };
    graphics: {
        pixelRatio: number;
        useHD2: "auto" | "ignore" | "force";
        preload: boolean;
        cursorSize: number;
    };
    minimap: {
        mode: "2d" | "3d";
        position: [number, number];
        rotation: [number, number, number];
        scale: number;
        enabled: boolean;
        opacity: number;
        softEdges: boolean;
        interactive: boolean;
        drawCamera: boolean;
    };
    input: {
        sceneController: string;
        dampingFactor: number;
        movementSpeed: number;
        rotateSpeed: number;
        cameraShakeStrength: number;
        zoomLevels: [number, number, number];
        unitSelection: boolean;
        cursorVisible: boolean;
    };
    utilities: {
        sanityCheckReplayCommands: boolean;
        debugMode: boolean;
        detectMeleeObservers: boolean;
        detectMeleeObserversThreshold: number;
        alertDesynced: boolean;
        alertDesyncedThreshold: number;
        logLevel: LogLevel;
    };
    plugins: {
        serverPort: number;
        developmentDirectory?: string;
        enabled: string[];
    };
    postprocessing: {
        anisotropy: number;
        antialias: number;
        bloom: number;
        brightness: number;
        contrast: number;
        fogOfWar: number;
    };
    postprocessing3d: {
        anisotropy: number;
        antialias: number;
        toneMapping: number;
        bloom: number;
        brightness: number;
        contrast: number;
        depthFocalLength: number;
        depthBokehScale: number;
        depthBlurQuality: number;
        depthFocalRange: number;
        fogOfWar: number;
        envMap: number;
        sunlightDirection: [number, number, number];
        sunlightColor: string;
        sunlightIntensity: number;
        shadowQuality: number;
    };
    macros: MacrosDTO;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/logging.ts

/** @internal */
declare type LogLevel = "info" | "warn" | "error" | "debug";

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacrosDTO {
    revision: number;
    macros: MacroDTO[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacroDTO {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    trigger: MacroTriggerDTO;
    actions: MacroAction[];
    actionSequence: MacroActionSequence;
    conditions: MacroCondition[];
    error?: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacroTriggerDTO {
    type: TriggerType;
    value?: unknown;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare enum TriggerType {
    None = "None",
    Hotkey = "Hotkey",
    WorldEvent = "WorldEvent"
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacroAction<T extends TargetType = TargetType> {
    type: "action";
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: unknown;
    operator: Operator;
    group?: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare type TargetType = ":app" | ":plugin" | ":function" | ":macro";

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacroActionConfigurationError {
    critical?: boolean;
    type: MacroActionConfigurationErrorType;
    message: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare enum MacroActionConfigurationErrorType {
    MissingField = "MissingField",
    InvalidField = "InvalidField",
    InvalidFieldValue = "InvalidFieldValue",
    InvalidInstruction = "InvalidInstruction",
    InvalidCondition = "InvalidCondition",
    MissingPlugin = "MissingPlugin",
    InvalidPlugin = "InvalidPlugin",
    InvalidMacro = "InvalidMacro",
    InvalidAction = "InvalidAction"
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare type TargetedPath<T extends TargetType = TargetType> = [T, ...string[]];

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/fields.ts
/** @internal */
declare enum Operator {
    SetToDefault = "SetToDefault",
    Set = "Set",
    Toggle = "Toggle",
    Increase = "Increase",
    Decrease = "Decrease",
    IncreaseCycle = "IncreaseCycle",
    DecreaseCycle = "DecreaseCycle",
    Min = "Min",
    Max = "Max",
    Execute = "Execute"
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare enum MacroActionSequence {
    AllSync = "AllSync",
    SingleAlternate = "SingleAlternate",
    SingleRandom = "SingleRandom"
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
interface MacroCondition<T extends TargetType = TargetType> {
    type: "condition";
    id: string;
    error?: MacroActionConfigurationError;
    path: TargetedPath<T>;
    value?: unknown;
    comparator: ConditionComparator;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/macros.ts

/** @internal */
declare enum ConditionComparator {
    Equals = "Equals",
    NotEquals = "NotEquals",
    GreaterThan = "GreaterThan",
    LessThan = "LessThan",
    GreaterThanOrEquals = "GreaterThanOrEquals",
    LessThanOrEquals = "LessThanOrEquals",
    Execute = "Execute"
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/image-3d-material.ts

/**
 * Custom material for starcraft images. Takes into account team color, warp in flash, and modifiers.
 */
/** @internal */
declare class Image3DMaterial extends MeshStandardMaterial {
    #private;
    isTeamSpriteMaterial: boolean;
    constructor(parameters?: SpriteMaterialParameters);
    set teamColor(val: Color);
    get teamColor(): Color;
    set warpInFlashGRP(val: AnimAtlas | undefined);
    set modifierData1(val: number);
    get modifierData1(): number;
    set modifierData2(val: number);
    get modifierData2(): number;
    set modifier(val: number);
    get modifier(): number;
    onBeforeCompile(shader: Shader): void;
    customProgramCacheKey(): string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/sprite-entities.ts

/** @internal */
declare class SpriteEntities {
    #private;
    group: Group<import("three").Object3DEventMap>;
    constructor();
    get isEmpty(): boolean;
    [Symbol.iterator](): IterableIterator<SpriteType>;
    get(spriteIndex: number): SpriteType | undefined;
    getOrCreate(spriteIndex: number, spriteTypeId: number): SpriteType;
    free(spriteIndex: number): void;
    clear(): void;
    getUnit(spriteIndex: number): Unit | undefined;
    setUnit(spriteIndex: number, unit: Unit): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/image.ts

/** @internal */
interface SpriteType extends Group {
    userData: {
        mainImage: ImageBase;
        typeId: number;
        isNew: boolean;
    };
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/unit-entities.ts

/** @internal */
declare class UnitEntities {
    freeUnits: Unit[];
    units: IterableMap<number, Unit>;
    externalOnCreateUnit?(unit: Unit): void;
    externalOnClearUnits?(): void;
    [Symbol.iterator](): IterableIterator<Unit>;
    get(unitId: number): Unit | undefined;
    getOrCreate(unitData: UnitsBufferView): Unit;
    free(unit: Unit): void;
    clear(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/data-structures/iteratible-map.ts
/**
 * A map that also keeps track of insertion order
 * @public
 */
export declare class IterableMap<T, R> {
    #private;
    get _dangerousArray(): R[];
    get(key: T): R | undefined;
    set(key: T, value: R): void;
    delete(key: T): void;
    has(key: T): boolean;
    clear(): void;
    [Symbol.iterator](): IterableIterator<R>;
    get length(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/units-buffer-view.ts

/**
 * Maps to openbw unit_t
 */
/** @internal */
declare class UnitsBufferView extends FlingyBufferView implements UnitStruct {
    #private;
    readonly resourceAmount = 0;
    get id(): number;
    get owner(): number;
    get order(): number | null;
    get groundWeaponCooldown(): number;
    get airWeaponCooldown(): number;
    get spellCooldown(): number;
    get orderTargetAddr(): number;
    get orderTargetX(): number;
    get orderTargetY(): number;
    get orderTargetUnit(): number;
    get shields(): number;
    get typeId(): number;
    get typeFlags(): number;
    get subunit(): UnitStruct | null;
    get parentUnit(): UnitStruct | null;
    get subunitId(): number | null;
    get kills(): number;
    get energy(): number;
    get generation(): number;
    get remainingBuildTime(): number;
    get statusFlags(): number;
    get currentBuildUnit(): UnitStruct | null;
    copyTo(dest: Partial<Unit>): void;
    copy(bufferView?: UnitsBufferView): UnitsBufferView;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/flingy-buffer-view.ts

/** @internal */
declare class FlingyBufferView extends ThingyBufferView implements FlingyStruct {
    get index(): number;
    get moveTargetX(): number;
    get moveTargetY(): number;
    get nextMovementWaypointX(): number;
    get nextMovementWaypointY(): number;
    get nextTargetWaypointX(): number;
    get nextTargetWaypointY(): number;
    get movementFlags(): number;
    get direction(): number;
    get x(): number;
    get y(): number;
    copyTo(dest: Partial<FlingyStruct>): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/thingy-buffer-view.ts

/**
 * Maps to openbw thingy_t
 */
/** @internal */
declare class ThingyBufferView implements ThingyStruct {
    protected _address: number;
    protected _addr32: number;
    protected _addr8: number;
    protected _sprite?: SpritesBufferView;
    _bw: OpenBW;
    get address(): number;
    get(address: number): this;
    constructor(bw: OpenBW);
    get hp(): number;
    get spriteIndex(): number;
    copyTo(dest: Partial<ThingyStruct>): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/sprites-buffer-view.ts

/**
 * Maps to openbw sprite_t starting from index address
 */
/** @internal */
declare class SpritesBufferView implements SpriteStruct {
    #private;
    readonly images: IntrusiveList;
    get(address: number): this;
    constructor(bw: OpenBW);
    get index(): number;
    get typeId(): number;
    get owner(): number;
    get elevation(): number;
    get flags(): number;
    get x(): number;
    get y(): number;
    get mainImage(): ImageBufferView;
    get mainImageIndex(): number;
    get extYValue(): number;
    get extFlyOffset(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/sprite-struct.ts
/** @internal */
interface SpriteStruct {
    index: number;
    owner: number;
    typeId: number;
    elevation: number;
    flags: number;
    x: number;
    y: number;
    mainImageIndex: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/intrusive-list.ts
/**
 * Represents an openbw intrusive_list
 */
/** @internal */
declare class IntrusiveList {
    #private;
    private _heapU32;
    private _pairOffset;
    private _current;
    addr: number;
    constructor(heap: Uint32Array, addr?: number, pairOffset?: number);
    [Symbol.iterator](): Generator<number, void, unknown>;
    reverse(): Generator<number, void, unknown>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/images-buffer-view.ts

/** @internal */
declare class ImageBufferView implements ImageStruct {
    #private;
    get(address: number): this;
    get _address(): number;
    set _address(val: number);
    constructor(bw: OpenBW);
    get index(): number;
    get typeId(): number;
    get modifier(): number;
    get modifierData1(): number;
    get modifierData2(): number;
    get frameIndex(): number;
    get frameIndexBase(): number;
    get frameIndexOffset(): number;
    get flags(): number;
    get x(): number;
    get y(): number;
    get iscript(): IScriptBufferView;
    get nextNode(): number;
    [Symbol.iterator](): Generator<this, void, unknown>;
    copy(any: Partial<ImageStruct>): Partial<ImageStruct>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/image-struct.ts
/** @internal */
interface ImageStruct {
    index: number;
    typeId: number;
    flags: number;
    frameIndex: number;
    frameIndexOffset: number;
    frameIndexBase: number;
    x: number;
    y: number;
    modifier: number;
    modifierData1: number;
    modifierData2: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/iscript-buffer-view.ts

/** @internal */
declare class IScriptBufferView implements IScriptStateStruct {
    #private;
    _bw: OpenBW;
    _debug: number;
    get(address: number): this;
    constructor(bw: OpenBW);
    private get _index32();
    get programAddress(): number | null;
    get typeId(): number | null;
    get programCounter(): number;
    get opCounter(): number;
    get returnAddress(): number;
    get animation(): number;
    get wait(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/iscript-struct.ts
/** @internal */
interface IScriptStateStruct {
    programCounter: number;
    returnAddress: number;
    animation: number;
    wait: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/data-structures/iterable-set.ts
/** @internal */
declare class IterableSet<T> {
    #private;
    onChange: (values: T[]) => void;
    constructor(onChange?: (values: T[]) => void);
    copyAsArray(): T[];
    get size(): number;
    get _dangerousArray(): T[];
    add(value: T): void;
    set(values: T[]): void;
    delete(value: T): void;
    has(key: T): boolean;
    clear(): void;
    [Symbol.iterator](): IterableIterator<T>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/render/base-scene.ts

/**
 * @public
 * The root scene of the game.
 */
export declare class BaseScene extends Scene {
    #private;
    mapWidth: number;
    mapHeight: number;
    sunlight: Sunlight;
    terrain: Terrain;
    constructor(mapWidth: number, mapHeight: number, terrain: Terrain, skyBox?: CubeTexture, envMap?: Texture);
    createSunlight(): void;
    setBorderTileColor(color: number): void;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/render/sunlight.ts

/** @internal */
declare class Sunlight {
    #private;
    shadowIntensity: number;
    constructor(mapWidth: number, mapHeight: number);
    get children(): Object3D<import("three").Object3DEventMap>[];
    set enabled(val: boolean);
    set intensity(value: number);
    get target(): Object3D<import("three").Object3DEventMap>;
    setPosition(...args: Parameters<Vector3["set"]>): void;
    getPosition(): Vector3;
    setColor(...args: Parameters<Color["setStyle"]>): void;
    needsUpdate(): void;
    set shadowQuality(quality: number);
    get shadowQuality(): number;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/terrain.ts

/**
 * A high level object representing the terrain.
 * Contains a collection of terrain quartiles.
 */
/** @internal */
declare class Terrain extends Group {
    #private;
    children: TerrainQuartile[];
    userData: {
        quartileWidth: number;
        quartileHeight: number;
        tilesX: number;
        tilesY: number;
        update(delta: number): void;
    };
    readonly getTerrainY: GetTerrainY;
    readonly geomOptions: GeometryOptions;
    constructor(geomOptions: GeometryOptions, getTerrainY: GetTerrainY, setCreepAnisotropy: (anisotropy: number) => void);
    set shadowsEnabled(val: boolean);
    set envMapIntensity(intensity: number);
    setTerrainQuality(highDefinition: boolean, anisotropy: number): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/terrain.ts

/** @internal */
interface TerrainQuartile extends Mesh<BufferGeometry, MeshStandardMaterial | MeshBasicMaterial> {
    userData: {
        qx: number;
        qy: number;
        basicMaterial: MeshBasicMaterial;
        standardMaterial: MeshStandardMaterial;
    };
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/generate-map/get-terrain-y.ts
/** @internal */
declare const getTerrainY: (image: {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}, scale: number, mapWidth: number, mapHeight: number, offset?: number) => (worldX: number, worldY: number) => number;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/generate-map/get-terrain-y.ts

/** @internal */
declare type GetTerrainY = ReturnType<typeof getTerrainY>;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/terrain.ts

/** @internal */
declare type GeometryOptions = {
    /**
     * low, walkable, mid, mid-walkable, high, high-walkable, mid/high/walkable
     */
    elevationLevels: number[];
    ignoreLevels: number[];
    normalizeLevels: boolean;
    texPxPerTile: number;
    /**
     * number of vertices per tile
     */
    tesselation: number;
    blendNonWalkableBase: boolean;
    renderFirstPass: boolean;
    renderSecondPass: boolean;
    processWater: boolean;
    maxTerrainHeight: number;
    drawMode: {
        value: number;
    };
    detailsMix: number;
    bumpScale: number;
    firstBlurPassKernelSize: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/creep/creep.ts

/** @internal */
declare class Creep {
    #private;
    mapWidth: number;
    mapHeight: number;
    creepValuesTexture: Texture;
    creepEdgesValuesTexture: Texture;
    minimapImageData: ImageData;
    worker: Worker;
    constructor(mapWidth: number, mapHeight: number, creepValuesTexture: Texture, creepEdgesValuesTexture: Texture);
    generate(tiles: SimpleBufferView<Uint8Array>, frame: number): void;
    generateImmediate(tiles: SimpleBufferView<Uint8Array>): void;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/buffer-view/simple-buffer-view.ts
/**
 A template for representing game struct(s) (eg units, sprites, etc)
*/
/** @internal */
declare class SimpleBufferView<K extends Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array> {
    #private;
    viewSize: number;
    private readonly _structSizeInBytes;
    constructor(structSizeInBytes: number, address: number | undefined, itemsCount: number | undefined, buffer: K);
    set address(address: number);
    get address(): number;
    copy(): Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array;
    shallowCopy(): K;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/utils/conversions.ts

/** @internal */
interface PxToWorld {
    x: (v: number) => number;
    y: (v: number) => number;
    xy: (x: number, y: number, out: Vector2) => Vector2;
    xyz: (x: number, y: number, out: Vector3) => Vector3;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/camera/game-viewport.ts

/**
 * @public
 * A "view" into the game. Every viewport contains it's own camera, dimensions, and additional properties.
 */
export declare class GameViewPort {
    #private;
    camera: DirectionalCamera;
    projectedView: ProjectedCameraView;
    orbit: CameraControls;
    viewport: Vector4;
    cameraShake: CameraShake;
    shakeCalculation: {
        frequency: Vector3;
        duration: Vector3;
        strength: Vector3;
        needsUpdate: boolean;
    };
    constrainToAspect: boolean;
    freezeCamera: boolean;
    needsUpdate: boolean;
    rotateSprites: boolean;
    audioType: "stereo" | "3d" | null;
    set renderMode3D(val: boolean);
    get renderMode3D(): boolean;
    get enabled(): boolean;
    set enabled(val: boolean);
    constructor(surface: Surface, isPrimaryViewport: boolean);
    reset(firstRun?: boolean): CameraControls;
    set orthographic(value: boolean);
    set center(val: Vector2 | undefined | null);
    get center(): Vector2 | undefined | null;
    get height(): number;
    set height(val: number);
    set width(val: number);
    get width(): number;
    get left(): number | undefined | null;
    set left(val: number | undefined | null);
    set right(val: number | undefined | null);
    get right(): number | undefined | null;
    get top(): number | undefined | null;
    set top(val: number | undefined | null);
    set bottom(val: number | undefined | null);
    get bottom(): number | undefined | null;
    get aspect(): number;
    set aspect(aspect: number);
    dispose(): void;
    generatePrevData(): {
        target: Vector3;
        position: Vector3;
    };
    shakeStart(elapsed: number, strength: number): void;
    shakeEnd(): void;
    update(targetDamping: number, delta: number): void;
    updateDirection32(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/camera/game-viewport.ts

/** @internal */
declare type DirectionalCamera = (PerspectiveCamera | OrthographicCamera) & {
    userData: {
        direction: number;
        prevDirection: number;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/camera/projected-camera-view.ts

/**
 * World position for the four corners of our view
 */
/** @internal */
declare class ProjectedCameraView {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    bl: [number, number];
    tr: [number, number];
    br: [number, number];
    tl: [number, number];
    center: Vector3;
    static mouseOnWorldPlane(mouse: {
        x: number;
        y: number;
    }, camera: Camera): Vector3 | null;
    update(camera: Camera, target: Vector3): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/camera/camera-shake.ts

/** @internal */
declare class CameraShake {
    #private;
    _duration: Vector3;
    _startTime: number[];
    _strength: Vector3;
    maxShakeDistance: number;
    set enabled(val: boolean);
    get enabled(): boolean;
    constructor(duration?: number, frequency?: number, strength?: number);
    setParams(component: 0 | 1 | 2, duration: number, frequency: number, strength: number): void;
    _update(component: 0 | 1 | 2, elapsed: number): number | undefined;
    _shake(component: 0 | 1 | 2, elapsed: number, duration: number, frequency: number, strength: number): void;
    shake(elapsed: number, duration: Vector3, frequency: Vector3, strength: Vector3): void;
    update(elapsed: number, camera: Camera): void;
    restore(camera: Camera): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/image/canvas/surface.ts
/** @internal */
declare class Surface {
    #private;
    ctx?: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    constructor(canvas?: HTMLCanvasElement, useContext?: boolean, styles?: Partial<ElementCSSInlineStyle["style"]>);
    setDimensions(width: number, height: number, pixelRatio?: number): void;
    get aspect(): number;
    get width(): number;
    get height(): number;
    get bufferWidth(): number;
    get bufferHeight(): number;
    get pixelRatio(): number;
    getContext(): CanvasRenderingContext2D | null;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
declare type SessionSettingsData = Pick<Settings, "audio" | "input" | "minimap" | "postprocessing" | "postprocessing3d" | "session">;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/utils/deep-partial.ts
/** @internal */
declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/render/game-surface.ts

/** @internal */
declare class GameSurface extends Surface {
    #private;
    top: number;
    left: number;
    right: number;
    bottom: number;
    constructor(mapWidth: number, mapHeight: number, canvas: HTMLCanvasElement);
    setDimensions(screenWidth: number, screenHeight: number, pixelRatio: number): void;
    isPointerLockLost(): boolean;
    togglePointerLock(val: boolean): void;
    requestPointerLock(): void;
    exitPointerLock(): void;
    get screenAspect(): Vector3;
    getMinimapDimensions(minimapScale: number): Pick<MinimapDimensions, "minimapWidth" | "minimapHeight">;
    dispose(): void;
    show(): void;
    hide(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/render/minimap-dimensions.ts
/** @internal */
interface MinimapDimensions {
    matrix: number[];
    minimapWidth: number;
    minimapHeight: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/input/mouse-input.ts

/** @internal */
declare type MouseEventDTO = {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    button: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/settings-session-store.ts

/**
 * @public
 */
export declare type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: MutationVariable;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/stores/operatable-store.ts

/** @internal */
declare type MutationVariable = ReturnType<ReturnType<typeof createMutationVariable>>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/stores/operatable-store.ts

/** @internal */
declare const createMutationVariable: (operate: (operation: Operation) => void, getValue: (path: string[]) => unknown) => (path: string[]) => ((value?: unknown) => unknown) & {
    set: (value: any) => void;
    get: () => unknown;
    /**
     * Increase the value of the property.
     */
    inc: () => void;
    /**
     * Increase the value of the property. Loop around if the value is greater than the maximum.
     */
    incCycle: () => void;
    /**
     * Decrease the value of the property.
     */
    dec: () => void;
    /**
     * Decrease the value of the property. Loop around if the value is less than the minimum.
     */
    decCycle: () => void;
    /**
     * Set the value of the property to the minimum.
     */
    min: () => void;
    /**
     * Set the value of the property to the maximum.
     */
    max: () => void;
    /**
     * Reset the value of the property to the default.
     */
    reset: () => void;
    /**
     * Reset the value of the property to the default.
     */
    toggle: () => void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/fields.ts

/** @internal */
interface Operation {
    operator: Operator;
    path: string[];
    value?: any;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/stores/source-of-truth.ts

/**
 * An object that emits the diff when it is updated.
 */
/** @internal */
declare class SourceOfTruth<T extends object> {
    #private;
    onUpdate: ((diff: DeepPartial<T>) => void) | undefined;
    constructor(data: T);
    getValue(path: string[]): any;
    update(data: Partial<T>): void;
    clone(): T;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/scene-composer.ts

/** @internal */
declare type SceneComposer = Awaited<ReturnType<typeof createSceneComposer>>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/input/mouse-input.ts

/** @internal */
declare class MouseInput {
    #private;
    event: MouseEventDTO;
    direction: Vector3;
    constructor(domElement: HTMLElement);
    get clientX(): number;
    get clientY(): number;
    get released(): Vector3 | undefined;
    get move(): Vector3;
    get clicked(): Vector3 | undefined;
    get screenDrag(): Vector2;
    get mouseScrollY(): number;
    get modifiers(): Vector3;
    get lookAt(): Vector2;
    reset(): void;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/input/arrow-key-input.ts

/** @internal */
declare class ArrowKeyInput {
    #private;
    constructor(el: HTMLElement);
    get vector(): Vector2;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/input/create-unit-selection.ts

/** @internal */
declare enum UnitSelectionStatus {
    None = 0,
    Dragging = 1,
    Hovering = 2
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/view-composer.ts

/** @internal */
declare type ViewControllerComposer = ReturnType<typeof createViewControllerComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/view-composer.ts

/**
 * The Scene Controller plugin is responsible for managing the game viewports.
 * This composer helps activate those plugins, as well as update the viewports and their orbiting camera controls.
 *
 * @param world
 * @param param1
 * @returns
 */
/** @internal */
declare const createViewControllerComposer: (world: World, { gameSurface }: SurfaceComposer) => {
    api: {
        readonly viewport: GameViewPort;
        readonly secondViewport: GameViewPort;
    };
    update(delta: number): void;
    readonly viewports: GameViewPort[];
    deactivate(): void;
    activeViewports(): Generator<GameViewPort, void, unknown>;
    readonly numActiveViewports: number;
    /**
     * Activates a scene controller plugin.
     * Runs events on the previous scene controller if it exists.
     * Resets all viewports.
     *
     * @param newController
     * @param firstRunData
     * @returns
     */
    activate(newController: SceneController | null | undefined, firstRunData?: any): Promise<void>;
    readonly primaryViewport: GameViewPort | undefined;
    aspect: number;
    readonly sceneController: SceneController | null;
    readonly primaryCamera: DirectionalCamera | undefined;
    readonly primaryRenderMode3D: boolean;
    changeRenderMode(renderMode3D?: boolean): void;
    generatePrevData(): {
        target: Vector3;
        position: Vector3;
    } | null;
    doShakeCalculation(explosionType: Explosion, damageType: DamageType, spritePos: Vector3): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/surface-composer.ts

/** @internal */
declare type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/surface-composer.ts

/**
 * Creates the game canvases, listeners, and resizers.
 * @param world
 * @returns
 */
/** @internal */
declare const createSurfaceComposer: (world: World) => {
    gameSurface: GameSurface;
    resize: (immediate?: boolean) => void;
    mount(): void;
    api: {
        togglePointerLock: (val: boolean) => void;
        isPointerLockLost(): boolean;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/**
 * These are the injectable services that are available to plugins during a world session.
 */
/** @internal */
interface Injectables {
    /**
     * Reactive setting values that apply to the active session only.
     */
    settings: SessionVariables;
    /**
     * World events that can be listened to and emitted.
     */
    events: TypeEmitterProxy<WorldEvents>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/utils/type-emitter.ts

/**
 * @public
 */
export declare class TypeEmitterProxy<T> {
    #private;
    constructor(host: TypeEmitter<T>);
    on<K extends keyof T>(s: K, listener: (v: T[K]) => void): () => void;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/**
 * A package definition for a plugin.
 * This is the same format as a package.json file with exception of the `permissions` property.
 */
/** @internal */
interface PluginPackage {
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
    repository?: string | {
        type?: string;
        url?: string;
    };
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    config?: PluginConfig;
    permissions?: string[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/** @internal */
declare type PluginConfig = Record<string, FieldDefinition>;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/enums/explosions.ts
/** @internal */
declare enum Explosion {
    None = 0,
    Normal = 1,
    Splash_Radial = 2,
    Splash_Enemy = 3,
    Lockdown = 4,
    NuclearMissile = 5,
    Parasite = 6,
    Broodlings = 7,
    EmpShockwave = 8,
    Irradiate = 9,
    Ensnare = 10,
    Plague = 11,
    StasisField = 12,
    DarkSwarm = 13,
    Consume = 14,
    YamatoGun = 15,
    Restoration = 16,
    DisruptionWeb = 17,
    CorrosiveAcid = 18,
    MindControl = 19,
    Feedback = 20,
    OpticalFlare = 21,
    Maelstrom = 22,
    Unknown = 23,
    SplashAir = 24
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/enums/damages-types.ts
/** @internal */
declare enum DamageType {
    Independent = 0,
    Explosive = 1,
    Concussive = 2,
    Normal = 3,
    IgnoreArmor = 4
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/scene-composer.ts

/** @internal */
declare type SceneComposerApi = SceneComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/surface-composer.ts

/** @internal */
declare type SurfaceComposerApi = SurfaceComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/postprocessing-composer.ts

/** @internal */
declare type PostProcessingComposerApi = PostProcessingComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/postprocessing-composer.ts

/** @internal */
declare type PostProcessingComposer = ReturnType<typeof createPostProcessingComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/postprocessing-composer.ts

/** @internal */
declare const createPostProcessingComposer: (world: World, { scene, images, sprites, terrain, ...sceneComposer }: SceneComposer, viewports: ViewControllerComposer, assets: Assets) => {
    precompile(camera: PerspectiveCamera | OrthographicCamera): void;
    api: {
        changeRenderMode(renderMode3D?: boolean): void;
    };
    startTransition(fn: () => void): void;
    readonly overlayScene: import("three").Scene;
    readonly overlayCamera: PerspectiveCamera;
    render(delta: number, elapsed: number): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/view-composer.ts

/** @internal */
declare type ViewControllerComposerApi = ViewControllerComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/openbw-composer.ts

/** @internal */
declare type OpenBwComposerApi = OpenBwComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/openbw-composer.ts

/** @internal */
declare type OpenBwComposer = ReturnType<typeof createOpenBWComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/core/world/openbw-composer.ts

/**
 * A lot of communication with OpenBW happens here.
 * Most importantly generates sounds, creep, and game data from the current frame our client is on.
 *
 * @param world
 * @param scene
 * @param viewInput
 * @returns
 */
/** @internal */
declare const createOpenBWComposer: (world: World, scene: Pick<SceneComposer, "pxToWorld" | "terrainExtra">, viewInput: ViewControllerComposer) => {
    completedUpgrades: number[][];
    readonly currentFrame: number;
    readonly previousBwFrame: number;
    /**
     * Compiler shaders ahead of time
     */
    precompile(): void;
    update(elapsed: number, frame: number): boolean;
    _refs: {
        gtapi_playSound: (typeId: number, volumeOrX?: number, y?: number, unitTypeId?: number) => void;
        gtapi_getCurrentFrame: () => number;
    };
    api: {
        getCurrentFrame(): number;
        skipForward: (gameSeconds?: number) => number;
        skipBackward: (gameSeconds?: number) => number;
        speedUp: () => number;
        speedDown: () => number;
        togglePause: (setPaused?: boolean) => boolean;
        readonly gameSpeed: number;
        setGameSpeed(value: number): void;
        gotoFrame: (frame: number) => void;
        playSound(typeId: number, volumeOrX?: number | undefined, y?: number | undefined, unitTypeId?: number | undefined): void;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/openbw/sandbox-api.ts

/**
 * @public
 * Sandbox API in order to manipulate the game state.
 */
export declare const createSandboxApi: (_world: World, pxToWorldInverse: PxToWorld) => {
    useWorldCoordinates: boolean;
    createUnit(unitTypeId: number, playerId: number, x: number, y: number): UnitsBufferView | null;
    killUnit(unitOrId: UnitStruct | number): number | undefined;
    removeUnit(unitOrId: UnitStruct | number): void;
    orderUnitAttackMove(unitOrId: UnitStruct | number, targetUnitOrId?: UnitStruct | number | null, x?: number, y?: number): void;
    orderUnitAttackUnit(unitOrId: UnitStruct | number, targetUnitOrId: UnitStruct | number | null, x?: number, y?: number): void;
    orderUnitMove(unitOrId: UnitStruct | number, x?: number, y?: number): void;
    orderUnitBuild(unitOrId: UnitStruct | number, unitType: number, x: number, y: number): void;
    orderUnitTrain(unitOrId: UnitStruct | number, unitType: number): void;
    orderUnitRightClick(unitOrId: UnitStruct | number, targetUnitOrId: UnitStruct | number | null, x?: number, y?: number): void;
};
        declare global {
            

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/plugins/plugin-base.ts

export interface PluginBase extends NativePlugin, GameTimeApi, Injectables {
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/plugins/scene-controller.ts

/**
 * @public
 */
export interface SceneController extends Omit<NativePlugin, "config">, GameTimeApi, Injectables {
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
    onCameraMouseUpdate?(delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, mouse: Vector3, clientX: number, clientY: number, clicked: Vector3 | undefined, modifiers: Vector3): void;
    /**
     * Updates every frame with the current keyboard data.
     *
     * @param delta - Time in milliseconds since last frame
     * @param elapsed - Time in milliseconds since the game started
     * @param truck - x,y movement deltas
     */
    onCameraKeyboardUpdate?(delta: number, elapsed: number, truck: Vector2): void;
    /**
     * An optional override for the position of the audio listener.
     *
     * @param target - Vector3 of the current camera target
     * @param position - Vector 3 of the current camera position
     */
    onUpdateAudioMixerLocation(target: Vector3, position: Vector3): Vector3;
    /**
     * Updates when the minimap is clicked and dragged.
     *
     * @param pos - Vector3 of the map coordinates.
     * @param isDragStart - Did the user just start dragging
     * @param mouseButton - The button the user is using.
     */
    onMinimapDragUpdate?(pos: Vector2, isDragStart: boolean, mouseButton?: number): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/plugins/scene-controller.ts

/**
 * @public
 */
export class SceneController extends PluginBase implements SceneController {
    isSceneController: boolean;
    viewports: GameViewPort[];
    get viewport(): GameViewPort;
    get secondViewport(): GameViewPort;
    onEnterScene(prevData: unknown): Promise<unknown>;
    onUpdateAudioMixerOrientation(): Quaternion;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/renderer/plugins/plugin-base.ts

export class PluginBase {
    #private;
    readonly id: string;
    readonly name: string;
    isSceneController: boolean;
    constructor(pluginPackage: PluginPackage);
    sendUIMessage: (message: any) => void;
    /**
     *
     * Useful for plugins that want to update their own config.
     *
     * @param key The configuration key.
     * @param value  The configuration value.
     * @returns
     */
    saveConfigProperty(key: string, value: unknown, persist?: boolean): void;
    refreshConfig(): void;
    get configExists(): boolean;
    /**
     * Read from the normalized configuration.
     */
    get config(): object | undefined;
    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set rawConfig(value: PluginConfig | undefined);
    get rawConfig(): PluginConfig | undefined;
    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getFieldDefinition(key: string): FieldDefinition<unknown> | undefined;
}
        }
        