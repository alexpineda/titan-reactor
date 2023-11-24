
        
        import CameraControls from "camera-controls"
import { CommandsStream, Replay } from "process-replay";
import { DataTexture, PerspectiveCamera, OrthographicCamera, Texture, Matrix4, Vector4, CompressedTexture, BufferAttribute, DataArrayTexture, CubeTexture, Object3D, Mesh, BufferGeometry, MeshBasicMaterial, SpriteMaterialParameters, Shader, MeshStandardMaterial, SkinnedMesh, AnimationClip, AudioListener, Audio, AudioContext, Quaternion, AnimationMixer, Box3, Sphere, Raycaster, Intersection, Group, Scene, Camera, WebXRManager, XRTargetRaySpace } from "three";
import { Effect } from "postprocessing";
import { Janitor } from "three-janitor";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";



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
    config: Record<string, any>;
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
     * Called before render, every render tick
     */
    onTick?(delta: number, elapsed: number): void;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/game-time-api.ts

/**
 * @public
 * The exposed api available to macros and plugins.
 */
export interface GameTimeApi extends OverlayComposerApi, InputsComposerApi, SceneComposerApi, SurfaceComposerApi, PostProcessingComposerApi, ViewControllerComposerApi, OpenBwComposerApi, GameLoopComposerApi {
    map: Chk;
    replay?: Replay;
    getCommands: () => CommandsStream;
    assets: Assets;
    exitScene(): void;
    sandboxApi: ReturnType<typeof createSandboxApi>;
    refreshScene(): void;
    simpleMessage(message: string): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/overlay-composer.ts

/** @internal */
type OverlayComposerApi = OverlayComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/overlay-composer.ts

/** @internal */
type OverlayComposer = {
    api: {
        isMouseInsideMinimap: () => boolean;
        getMouseMinimapUV: () => Vector2 | undefined;
    };
    minimapUv: Vector2 | undefined;
    insideMinimap: boolean;
    update(delta: number): void;
    onFrame(): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/input-composer.ts

/** @internal */
type InputsComposerApi = InputsComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/input-composer.ts

/** @internal */
type InputsComposer = ReturnType<typeof createInputComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/input-composer.ts

/**
 * Hanndles user input including unit selection events ( which is then sent through the message bus for other handlers to use ).
 */
/** @internal */
declare const createInputComposer: (world: World, { images, scene, imageQuadrants }: SceneComposer) => {
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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/world.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/players.ts

/** @internal */
declare class Players extends Array<Player> {
    #private;
    originalNames: readonly PlayerName[];
    constructor(players: BasePlayer[]);
    get(id: number): Player | undefined;
    static get [Symbol.species](): ArrayConstructor;
    togglePlayerVision(id: number): void;
    getVisionFlag(): number;
    setColors: (colors: readonly string[]) => void;
    resetColors(): void;
    setNames(players: PlayerName[]): void;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/players.ts

/** @internal */
type PlayerName = Pick<BasePlayer, "id" | "name">;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/players.ts

/**
 * @public
 */
export interface BasePlayer {
    id: number;
    name: string;
    color: string;
    race: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/core/fogofwar/fog-of-war.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/fogofwar/fog-of-war-effect.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/openbw.ts

/**
 * @public
 */
export interface OpenBW extends OpenBWWasm {
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/openbw-wasm.ts

/** @internal */
interface OpenBWWasm extends EmscriptenPreamble {
    _reset: () => void;
    _load_replay: (buffer: number, length: number) => void;
    _load_map: (buffer: number, length: number) => void;
    _upload_height_map: (buffer: number, length: number, width: number, height: number) => void;
    _load_replay_with_height_map: (replayBuffer: number, replayLength: number, buffer: number, length: number, width: number, height: number) => void;
    _next_frame: () => number;
    _next_step: () => number;
    _next_replay_step: () => number;
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
    setupCallback: (key: keyof Callbacks, callback: Callbacks[keyof Callbacks]) => void;
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
type SetGetType = "i8" | "i16" | "i32" | "i64" | "float" | "double" | "i8*" | "i16*" | "i32*" | "i64*" | "float*" | "double*" | "*";

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

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/openbw-wasm.ts

/** @internal */
type Callbacks = {
    js_fatal_error?: (ptr: number) => string;
    js_pre_main_loop?: () => void;
    js_post_main_loop?: () => void;
    js_file_size?: (index: number) => number;
    js_read_data?: (index: number, dst: number, offset: number, size: number) => void;
    js_load_done?: () => void;
    js_file_index?: (ptr: number) => number;
    js_on_replay_frame?: () => void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/openbw.ts

/**
 * @public
 * An interface layer between the OpenBW WASM module and the rest of the application.
 */
export declare class OpenBW implements OpenBW {
    #private;
    running: boolean;
    files?: OpenBWFileList;
    unitGenerationSize: number;
    iterators: OpenBWIterators;
    structs: OpenBWStructViews;
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
    setReplayFrameListener: (fn: () => void) => void;
    /**
     * Increments the game frame where openbw will run until the next frame.
     * If the game is in sandbox mode, the game will run at 24 fps.
     * @returns the game frame number
     */
    nextFrame: () => number;
    nextFrameSafe: () => number;
    nextStep(): number;
    nextReplayStep(): number;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/openbw-filelist.ts

/** @internal */
declare class OpenBWFileList {
    private buffers;
    private index;
    unused: number[];
    private _cleared;
    normalize(path: string): string;
    constructor(openBw: OpenBWWasm);
    loadBuffers(readFile: (filename: string) => Promise<Buffer | Uint8Array>): Promise<void>;
    clear(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/openbw.ts

/**
 * @public
 */
declare class OpenBWIterators {
    destroyedUnitsThisFrame: () => ReturnType<typeof destroyedUnitsIterator>;
    killedUnitsThisFrame: () => ReturnType<typeof killedUnitIterator>;
    units: UnitsBufferViewIterator;
    deletedSpritesThisFrame: () => ReturnType<typeof deletedSpritesIterator>;
    deletedImagesThisFrame: () => ReturnType<typeof deletedImageIterator>;
    sprites: SpritesBufferViewIterator;
    constructor(openbw: OpenBW);
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/units-buffer-view.ts

/** @internal */
declare function destroyedUnitsIterator(openBW: OpenBW): Generator<number, void, unknown>;

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/units-buffer-view.ts

/** @internal */
declare function killedUnitIterator(openBW: OpenBW): Generator<number, void, unknown>;

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/units-buffer-view.ts

/** @internal */
declare class UnitsBufferViewIterator {
    #private;
    constructor(openBW: OpenBW);
    [Symbol.iterator](): Generator<UnitsBufferView, void, unknown>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/units-buffer-view.ts

/**
 * Maps to openbw unit_t
 */
/** @internal */
declare class UnitsBufferView extends FlingyBufferView implements UnitStruct {
    #private;
    getSprite(): SpritesBufferView | undefined;
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
    get subunit(): UnitsBufferView | null;
    get parentUnit(): UnitsBufferView | null;
    get subunitId(): number | null;
    get kills(): number;
    get energy(): number;
    get generation(): number;
    get remainingBuildTime(): number;
    get loadedUnitIds(): Uint32Array;
    get statusFlags(): number;
    get currentBuildUnit(): UnitStruct | null;
    isAttacking(): boolean;
    copyTo(dest: Partial<Unit>): void;
    copy(bufferView?: UnitsBufferView): UnitsBufferView;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/flingy-buffer-view.ts

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
    get currentSpeed(): number;
    get currentVelocityDirection(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/thingy-buffer-view.ts

/**
 * Maps to openbw thingy_t
 */
/** @internal */
declare class ThingyBufferView implements ThingyStruct {
    protected _address: number;
    protected _addr32: number;
    protected _addr8: number;
    _bw: OpenBW;
    get address(): number;
    get(address: number): this;
    constructor(bw: OpenBW);
    get hp(): number;
    get spriteIndex(): number;
    get spriteAddr(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/structs/thingy-struct.ts
/** @internal */
interface ThingyStruct {
    hp: number;
    /**
     * @internal
     */
    spriteIndex: number;
    spriteAddr: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/scene-composer.ts

/** @internal */
declare const createSceneComposer: (world: World, assets: Assets) => Promise<{
    images: ImageEntities;
    sprites: SpriteEntities;
    units: UnitEntities;
    imageQuadrants: SimpleQuadtree<ImageBase>;
    unitQuadrants: SimpleQuadtree<UnitStruct>;
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
    pxToWorldFlat: PxToWorld;
    startLocations: Vector3[];
    onFrame(delta: number, elapsed: number, renderMode3D: boolean): void;
    resetImageCache(): void;
    api: {
        readonly players: Players;
        toggleFogOfWarByPlayerId(playerId: number): void;
        pxToWorld: PxToWorld;
        pxToWorldFlat: PxToWorld;
        readonly units: IterableMap<number, Unit>;
        imageQuadtree: SimpleQuadtree<ImageBase>;
        unitQuadtree: SimpleQuadtree<UnitStruct>;
        scene: BaseScene;
        followedUnits: IterableSet<Unit>;
        startLocations: Vector3[];
        initialStartLocation: Vector3;
        getFollowedUnitsCenterPosition: () => Vector3 | undefined;
        selectedUnits: IterableSet<Unit>;
        createUnitQuadTree: (size: number) => SimpleQuadtree<UnitStruct>;
    };
}>;

//C:/Users/Game_Master/Projects/titan-reactor/src/image/assets.ts

/**
 * @public
 * Most game assets excepting sprites / images.
 */
export type Assets = Awaited<ReturnType<typeof initializeAssets>> & {
    envMap?: Texture;
    bwDat: BwDAT;
    wireframeIcons?: Blob[];
};

//C:/Users/Game_Master/Projects/titan-reactor/src/image/assets.ts

/** @internal */
declare const initializeAssets: () => Promise<{
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
    loader: ImageLoaderManager;
    skyBox: CubeTexture;
    refId: (id: number) => number;
    resetImagesCache: () => void;
    arrowIconsGPU: LegacyGRP;
    hoverIconsGPU: LegacyGRP;
    dragIconsGPU: LegacyGRP;
    openCascStorage: (url?: string) => Promise<boolean>;
    closeCascStorage: () => Promise<void>;
    readCascFile: (filepath: string) => Promise<Buffer>;
}>;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/image.ts

/** @internal */
declare enum UnitTileScale {
    SD = 1,
    HD2 = 2,
    HD = 4
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/image-loader-manager.ts

/** @internal */
declare class ImageLoaderManager {
    #private;
    maxDownloads: number;
    currentDownloads: number;
    imageLoaders: Map<number, ImageLoader>;
    constructor(refId: (id: number) => number);
    exists(imageId: number): boolean;
    getImage(imageId: number, useRefId?: boolean): AnimAtlas | null;
    loadImage(imageId: number, priority?: number): Promise<void> | undefined;
    loadImageImmediate(imageId: number): Promise<{
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
    } | null>;
    processQueue(): Promise<void>;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/image-loader.ts

/** @internal */
declare class ImageLoader {
    atlas: AnimAtlas | null;
    loader: ResourceLoader;
    imageId: number;
    priority: number;
    status: ResourceLoaderStatus;
    onLoaded: () => void;
    constructor(url: string, imageId: number, cache: IndexedDBCache);
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/atlas/load-anim-atlas.ts

/** @internal */
type AnimAtlas = ReturnType<typeof loadAnimAtlas>;

//C:/Users/Game_Master/Projects/titan-reactor/src/image/atlas/load-anim-atlas.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/resource-loader.ts

/** @internal */
declare class ResourceLoader {
    #private;
    url: string;
    key: string;
    buffer: Buffer | null;
    onStatusChange: (status: ResourceLoaderStatus) => void;
    protected cache?: IndexedDBCache;
    constructor(url: string, key?: string, cache?: IndexedDBCache);
    get status(): ResourceLoaderStatus;
    set status(status: ResourceLoaderStatus);
    fetch(): Promise<Buffer | null>;
    cancel(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/resource-loader-status.ts
/** @internal */
type ResourceLoaderStatus = "loading" | "loaded" | "error" | "idle" | "cancelled";

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/indexed-db-cache.ts

/** @internal */
declare class IndexedDBCache {
    #private;
    constructor(storeName: CacheDBStoreName);
    get enabled(): boolean;
    set enabled(value: boolean);
    clear(): Promise<unknown>;
    deleteValue(id: string): Promise<unknown>;
    setValue(value: SCAssetData): Promise<unknown>;
    getValue(id: string): Promise<Buffer | null>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/indexed-db-cache.ts

/** @internal */
type CacheDBStoreName = "general-casc-cache" | "image-cache";

//C:/Users/Game_Master/Projects/titan-reactor/src/image/loader/indexed-db-cache.ts
/// <reference types="node" />
/** @internal */
interface SCAssetData {
    id: string;
    buffer: ArrayBuffer;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/atlas/legacy-grp.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/image/atlas/legacy-grp.ts

/** @internal */
type Palettes = Uint8Array[] & {
    dark?: Buffer;
    light?: Buffer;
};

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
type IScriptAnimation = IScriptOperations[];

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/iscript.ts

/** @internal */
type IScriptOperations = [string, number[]];

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

//C:/Users/Game_Master/Projects/titan-reactor/src/common/bwdat/parse-lo.ts
/// <reference types="node" />
/**
 * @public
 */
export type LoDAT = number[][][];

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
type GrpSprite = {
    w: number;
    h: number;
    frames: AnimFrame[];
    maxFrameH: number;
    maxFramew: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/anim-grp.ts
/// <reference types="node" />
/** @internal */
type AnimFrame = {
    x: number;
    y: number;
    w: number;
    h: number;
    xoff: number;
    yoff: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-entities.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-base.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/image-utils.ts

/** @internal */
declare const isImageHd: (image: Object3D) => image is ImageHD;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-hd.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-hd-material.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-hd-instanced-material.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/image-utils.ts

/** @internal */
declare const isImage3d: (image: Object3D) => image is Image3D;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-3d.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/image/atlas/load-glb-atlas.ts

/** @internal */
interface GltfAtlas extends AnimAtlas {
    isGLTF: boolean;
    model: Object3D;
    mesh: Mesh<BufferGeometry, MeshStandardMaterial> | SkinnedMesh<BufferGeometry, MeshStandardMaterial>;
    animations: AnimationClip[];
    fixedFrames: number[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/audio/main-mixer.ts

/** @internal */
declare const mixer: Mixer;

//C:/Users/Game_Master/Projects/titan-reactor/src/audio/main-mixer.ts

/** @internal */
declare class Mixer {
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
    loadCascAudio(filename: string): Promise<AudioBuffer>;
    loadCascAudioById(id: number): Promise<AudioBuffer>;
    loadAudioBuffer(url: string): Promise<AudioBuffer>;
    connect(...args: AudioNode[]): () => void;
    createGain(value: number): GainNode;
    createDistortion(k?: number): WaveShaperNode;
    smoothStop(gain: GainNode, delta?: number, decay?: number): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/audio/music.ts

/** @internal */
declare const music: Music;

//C:/Users/Game_Master/Projects/titan-reactor/src/audio/music.ts

/** @internal */
declare class Music {
    #private;
    races: string[];
    constructor(listener: AudioListener);
    getAudio(): Audio<GainNode>;
    playGame(): Promise<() => void>;
    playMenu(): Promise<() => void>;
    stop(): void;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
type Settings = SettingsV6;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
interface SettingsV6 {
    version: 6;
    language: string;
    session: {
        type: "replay" | "map";
        sandbox: boolean;
        audioListenerDistance: number;
    };
    audio: {
        global: number;
        music: number;
        sound: number;
        playIntroSounds: boolean;
    };
    graphics: {
        pixelRatio: number;
        useHD: boolean;
        use3D: boolean;
        preloadMapSprites: boolean;
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
        vrController: string;
        dampingFactor: number;
        movementSpeed: number;
        rotateSpeed: number;
        cameraShakeStrength: number;
        zoomLevels: [number, number, number];
        unitSelection: boolean;
        cursorVisible: boolean;
    };
    utilities: {
        cacheLocally: boolean;
        sanityCheckReplayCommands: boolean;
        debugMode: boolean;
        detectMeleeObservers: boolean;
        detectMeleeObserversThreshold: number;
        alertDesynced: boolean;
        alertDesyncedThreshold: number;
        logLevel: LogLevel;
    };
    replayQueue: {
        alwaysClearReplayQueue: boolean;
        autoplay: boolean;
        show: boolean;
        goToHomeBetweenReplays: boolean;
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
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/logging.ts

/** @internal */
type LogLevel = "info" | "warn" | "error" | "debug";

//C:/Users/Game_Master/Projects/titan-reactor/src/core/image-3d-material.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/unit.ts

/**
 * @public
 * A unit (and its state) in the game.
 */
export interface Unit extends UnitStruct {
    isAttacking: boolean;
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
    groundWeaponCooldown: number;
    airWeaponCooldown: number;
    spellCooldown: number;
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
    currentSpeed: number;
    moveTargetX: number;
    moveTargetY: number;
    nextMovementWaypointX: number;
    nextMovementWaypointY: number;
    nextTargetWaypointX: number;
    nextTargetWaypointY: number;
    movementFlags: number;
    currentVelocityDirection: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/core/sprite-entities.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/unit-entities.ts

/** @internal */
declare class UnitEntities {
    freeUnits: Unit[];
    units: IterableMap<number, Unit>;
    externalOnCreateUnit?(unit: Unit): void;
    externalOnClearUnits?(): void;
    [Symbol.iterator](): IterableIterator<Unit>;
    get(unitId: number): Unit | undefined;
    getOrCreate(unitStruct: UnitsBufferView): Unit;
    free(unit: Unit): void;
    clear(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/data-structures/iteratible-map.ts
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

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/data-structures/simple-quadtree.ts

/**
 * @public
 */
export declare class SimpleQuadtree<T> {
    #private;
    get size(): number;
    constructor(size: number, scale?: Vector2, offset?: Vector2);
    add(x: number, y: number, item: T): void;
    getNearby(x: number, y: number, radius?: number): T[];
    clear(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/data-structures/iterable-set.ts
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
    get(index: number): T;
    [Symbol.iterator](): IterableIterator<T>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/render/base-scene.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/render/sunlight.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/terrain.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/image/generate-map/get-terrain-y.ts
/** @internal */
declare const getTerrainY: (image: {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}, scale: number, mapWidth: number, mapHeight: number, offset?: number) => (worldX: number, worldY: number) => number;

//C:/Users/Game_Master/Projects/titan-reactor/src/image/generate-map/get-terrain-y.ts

/** @internal */
type GetTerrainY = ReturnType<typeof getTerrainY>;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/terrain.ts

/** @internal */
type GeometryOptions = {
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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/creep/creep.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/simple-buffer-view.ts
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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/sprites-buffer-view.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/intrusive-list.ts
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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/images-buffer-view.ts

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
    copy(): ImageBufferView;
    copyTo(any: Partial<ImageStruct>): Partial<ImageStruct>;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/iscript-buffer-view.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/sprites-buffer-view-iterator.ts

/** @internal */
declare function deletedSpritesIterator(openBW: OpenBW): Generator<number, void, unknown>;

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/images-buffer-view.ts

/** @internal */
declare function deletedImageIterator(openBW: OpenBW): Generator<number, void, unknown>;

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/structs/sprites-buffer-view-iterator.ts

/** @internal */
declare class SpritesBufferViewIterator {
    #private;
    constructor(openBW: OpenBW);
    [Symbol.iterator](): Generator<SpritesBufferView, void, unknown>;
    getSprite(addr: number): SpritesBufferView;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/openbw.ts

/** @internal */
declare class OpenBWStructViews {
    image: ImageBufferView;
    constructor(openbw: OpenBW);
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/file.ts
/// <reference types="node" />
/** @internal */
type ReadFile = (filename: string) => Promise<Buffer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/settings-session-store.ts

/** @internal */
type SettingsSessionStore = ReturnType<typeof createSettingsSessionStore>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/settings-session-store.ts

/**
 * An api that allows the consumer to modify setting values and have the system respond, eg fog of war level.
 */
/** @internal */
declare const createSettingsSessionStore: (events: TypeEmitter<WorldEvents>) => {
    vars: SessionVariables;
    dispose: () => void;
    getState: () => {
        session: {
            type: "replay" | "map";
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
            vrController: string;
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
    setValue: (path: string[], value: unknown, silentUpdate?: boolean | undefined) => void;
    getValue: (path: string[]) => unknown;
    merge: (rhs: {
        session?: {
            type?: "replay" | "map" | undefined;
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
            vrController?: string | undefined;
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
    operate: (action: Operation, transformPath?: ((path: string[]) => string[]) | undefined, silentUpdate?: boolean | undefined) => void;
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
        $set: (value: any) => void;
        $inc: () => void;
        $incCycle: () => void;
        $dec: () => void;
        $decCycle: () => void;
        $min: () => void;
        $max: () => void;
        $reset: () => void;
        $toggle: () => void;
    };
    sourceOfTruth: SourceOfTruth<{
        session: {
            type: "replay" | "map";
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
            vrController: string;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/type-emitter.ts

/** @internal */
declare class TypeEmitter<T> {
    #private;
    on<K extends keyof T>(s: K, listener: Listener<T[K]>["fn"], priority?: number): () => void;
    off<K extends keyof T>(s: K, listener: Listener<T[K]>["fn"]): void;
    emit(s: keyof T, v?: T[keyof T]): undefined | boolean;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/type-emitter.ts

/**
 * @public
 */
type Listener<T> = {
    fn: (v: T) => any;
    priority: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/world-events.ts

/** @internal */
interface WorldEvents {
    "unit-completed": Unit;
    "unit-created": Unit;
    "unit-killed": Unit;
    "unit-updated": Unit;
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
    "pre-run:frame": {
        frame: number;
        commands: unknown[];
    };
    "pre-run:complete": void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/settings.ts

/** @internal */
type SessionSettingsData = Pick<Settings, "audio" | "input" | "minimap" | "postprocessing" | "postprocessing3d" | "session">;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/utils/deep-partial.ts
/** @internal */
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

//C:/Users/Game_Master/Projects/titan-reactor/src/render/game-surface.ts

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
    show(): HTMLCanvasElement;
    hide(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/image/canvas/surface.ts
/** @internal */
declare class Surface {
    #private;
    canvas: HTMLCanvasElement;
    constructor(canvas?: HTMLCanvasElement, styles?: Partial<ElementCSSInlineStyle["style"]>);
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

//C:/Users/Game_Master/Projects/titan-reactor/src/render/minimap-dimensions.ts
/** @internal */
interface MinimapDimensions {
    matrix: number[];
    minimapWidth: number;
    minimapHeight: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/input/mouse-input.ts

/** @internal */
type MouseEventDTO = {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    button: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/settings-session-store.ts

/**
 * @public
 */
export type SessionVariables = {
    [K in keyof SessionSettingsData]: {
        [T in keyof SessionSettingsData[K]]: MutationVariable;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/stores/operatable-store.ts

/** @internal */
type MutationVariable = ReturnType<ReturnType<typeof createMutationVariable>>;

//C:/Users/Game_Master/Projects/titan-reactor/src/stores/operatable-store.ts

/** @internal */
declare const createMutationVariable: (operate: OperationRequest, getValue: (path: string[]) => unknown) => (path: string[]) => ((value?: unknown) => unknown) & {
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
    $set: (value: any) => void;
    /**
     * Increase the value of the property.
     */
    $inc: () => void;
    /**
     * Increase the value of the property. Loop around if the value is greater than the maximum.
     */
    $incCycle: () => void;
    /**
     * Decrease the value of the property.
     */
    $dec: () => void;
    /**
     * Decrease the value of the property. Loop around if the value is less than the minimum.
     */
    $decCycle: () => void;
    /**
     * Set the value of the property to the minimum.
     */
    $min: () => void;
    /**
     * Set the value of the property to the maximum.
     */
    $max: () => void;
    /**
     * Reset the value of the property to the default.
     */
    $reset: () => void;
    /**
     * Reset the value of the property to the default.
     */
    $toggle: () => void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/stores/operatable-store.ts

/** @internal */
type OperationRequest = (action: Operation, transformPath?: (path: string[]) => string[], silentUpdate?: boolean) => void;

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/fields.ts

/** @internal */
interface Operation {
    operator: Operator;
    path: string[];
    value?: any;
}

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

//C:/Users/Game_Master/Projects/titan-reactor/src/stores/source-of-truth.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/scene-composer.ts

/** @internal */
type SceneComposer = Awaited<ReturnType<typeof createSceneComposer>>;

//C:/Users/Game_Master/Projects/titan-reactor/src/input/mouse-input.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/input/arrow-key-input.ts

/** @internal */
declare class ArrowKeyInput {
    #private;
    constructor(el: HTMLElement);
    get vector(): Vector2;
    dispose(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/input/create-unit-selection.ts

/** @internal */
declare enum UnitSelectionStatus {
    None = 0,
    Dragging = 1,
    Hovering = 2
}

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/view-controller-composer.ts

/** @internal */
type ViewControllerComposer = ReturnType<typeof createViewControllerComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/view-controller-composer.ts

/**
 * The Scene Controller plugin is responsible for managing the game viewports.
 * This composer helps activate those plugins, as well as update the viewports and their orbiting camera controls.
 *
 * @param world
 * @param param1
 * @returns
 */
/** @internal */
declare const createViewControllerComposer: (world: World, { gameSurface }: SurfaceComposer, initialStartLocation: Vector3) => {
    api: {
        readonly viewport: GameViewPort;
        readonly secondViewport: GameViewPort;
        viewports: GameViewPort[];
    };
    update(delta: number): void;
    readonly viewports: GameViewPort[];
    deactivate(): void;
    /**
     * Activates a scene controller plugin.
     * Runs events on the previous scene controller if it exists.
     * Resets all viewports.
     *
     * @param newController
     * @param globalData
     * @returns
     */
    activate(newController: SceneController): Promise<void>;
    /**
     * Primary viewport is necessary because audio will require a camera position, and depth of field will only apply in one viewport for performance.
     */
    readonly primaryViewport: GameViewPort;
    aspect: number;
    readonly sceneController: SceneController | null;
    readonly primaryCamera: PerspectiveCamera | import("three").OrthographicCamera;
    readonly primaryRenderMode3D: boolean;
    changeRenderMode(renderMode3D?: boolean): void;
    generatePrevData(): {
        target: Vector3;
        position: Vector3;
    };
    doShakeCalculation(explosionType: Explosion, damageType: DamageType, spritePos: Vector3): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/surface-composer.ts

/** @internal */
type SurfaceComposer = ReturnType<typeof createSurfaceComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/surface-composer.ts

/**
 * Creates the game canvases, listeners, and resizers.
 * @param world
 * @returns
 */
/** @internal */
declare const createSurfaceComposer: (map: Chk, events: TypeEmitter<WorldEvents>) => {
    gameSurface: GameSurface;
    resize: (immediate?: boolean) => void;
    mount(): void;
    api: {
        readonly surface: GameSurface | undefined;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/camera/game-viewport.ts

/**
 * @public
 * A "view" into the game. Every viewport contains it's own camera, dimensions, and additional properties.
 */
export declare class GameViewPort extends Sizeable {
    #private;
    camera: PerspectiveCamera | OrthographicCamera;
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
    protected surface: Surface;
    constrainToAspect: boolean;
    needsUpdate: boolean;
    rotateSprites: boolean;
    autoUpdateSmoothTime: boolean;
    audioType: "stereo" | "3d" | null;
    set renderMode3D(val: boolean);
    get renderMode3D(): boolean;
    get enabled(): boolean;
    set enabled(val: boolean);
    constructor(surface: Surface, enabled?: boolean);
    set orthographic(value: boolean);
    dispose(): void;
    generatePrevData(): {
        target: Vector3;
        position: Vector3;
    };
    shakeStart(elapsed: number, strength: number): void;
    shakeEnd(): void;
    update(targetSmoothTime: number, delta: number): void;
    get direction32(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/camera/sizeable.ts

/**
 * A class that can be used to set the size and location of a surface on the screen.
*/
/** @internal */
declare class Sizeable {
    #private;
    constructor(surface: Surface);
    set center(val: Vector2 | null);
    get center(): Vector2 | null;
    get height(): number | null;
    set height(val: number | null);
    set width(val: number | null);
    get width(): number | null;
    get left(): number | null;
    set left(val: number | null);
    set right(val: number | null);
    get right(): number | null;
    get top(): number | null;
    set top(val: number | null);
    set bottom(val: number | null);
    get bottom(): number | null;
    get aspect(): number;
    set aspect(val: number | null);
    getActualSize(): Vector4;
    fullScreen(): void;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/camera/projected-camera-view.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/camera/camera-shake.ts

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

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/scene-controller.ts

/**
 * @public
 */
export type PrevSceneData = {
    position: Vector3;
    target: Vector3;
    data?: any;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/type-emitter.ts

/**
 * @public
 */
export declare class TypeEmitterProxy<T> {
    #private;
    constructor(host: TypeEmitter<T>);
    on<K extends keyof T>(s: K, listener: Listener<T[K]>["fn"], priority?: number): () => void;
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
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/** @internal */
type PluginConfig = Record<string, FieldDefinition>;

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-base.ts

/** @internal */
type PluginSessionContext = {
    game: GameTimeApi;
    settings: SessionVariables;
    events: TypeEmitter<WorldEvents>;
    customEvents: TypeEmitter<unknown>;
};

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

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/scene-composer.ts

/** @internal */
type SceneComposerApi = SceneComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/surface-composer.ts

/** @internal */
type SurfaceComposerApi = SurfaceComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/postprocessing-composer.ts

/** @internal */
type PostProcessingComposerApi = PostProcessingComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/postprocessing-composer.ts

/** @internal */
type PostProcessingComposer = ReturnType<typeof createPostProcessingComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/postprocessing-composer.ts

/** @internal */
declare const createPostProcessingComposer: (world: World, { scene, images, sprites, terrain, ...sceneComposer }: SceneComposer, viewportsComposer: ViewControllerComposer, assets: Assets) => {
    precompile(camera: PerspectiveCamera | OrthographicCamera): void;
    api: {
        changeRenderMode(renderMode3D?: boolean): void;
    };
    startTransition(fn: () => void): void;
    readonly overlayScene: import("three").Scene;
    readonly overlayCamera: PerspectiveCamera;
    render(delta: number, elapsed: number): void;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/view-controller-composer.ts

/** @internal */
type ViewControllerComposerApi = ViewControllerComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/openbw-composer.ts

/** @internal */
type OpenBwComposerApi = OpenBwComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/openbw-composer.ts

/** @internal */
type OpenBwComposer = ReturnType<typeof createOpenBWComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/openbw-composer.ts

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
        openBW: {
            getOriginal(): OpenBW;
            readonly iterators: OpenBWIterators;
            readonly mapTiles: SimpleBufferView<Uint8Array>;
            skipForward: (gameSeconds?: number) => number;
            skipBackward: (gameSeconds?: number) => number;
            speedUp: () => number;
            speedDown: () => number;
            togglePause: (setPaused?: boolean) => boolean;
            readonly gameSpeed: number;
            /**
             * Sets the game speed clamped to REPLAY_MIN_SPEED and REPLAY_MAX_SPEED
             */
            setGameSpeed(value: number): void;
            gotoFrame: (frame: number) => void;
        };
        readonly frame: number;
        playSound(typeId: number, volumeOrX?: number | undefined, y?: number | undefined, unitTypeId?: number | undefined): void;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/game-loop-composer.ts

/** @internal */
type GameLoopComposerApi = GameLoopComposer["api"];

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/game-loop-composer.ts

/** @internal */
type GameLoopComposer = ReturnType<typeof createGameLoopComposer>;

//C:/Users/Game_Master/Projects/titan-reactor/src/core/world/game-loop-composer.ts

/** @internal */
declare const createGameLoopComposer: (events: TypeEmitter<WorldEvents>) => {
    readonly delta: number;
    start(): void;
    stop(): void;
    onUpdate(val: (delta: number, elapsed: number) => void): void;
    api: {
        readonly elapsed: number;
        readonly delta: number;
    };
};

//C:/Users/Game_Master/Projects/titan-reactor/src/openbw/sandbox-api.ts

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
            var THREE: typeof import("three");
var postprocessing: typeof import("postprocessing");
var CameraControls: typeof import("camera-controls");
var enums: any;
var Janitor: typeof import("three-janitor");
            

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-base.ts

export interface PluginBase extends NativePlugin, GameTimeApi {
}

//C:/Users/Game_Master/Projects/titan-reactor/src/utils/types/plugin-host-types.ts

export type context = any;

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/scene-controller.ts

/**
 * @public
 */
export interface SceneController extends Omit<NativePlugin, "config">, GameTimeApi {
    /**
     * When a scene is entered and nearly initialized.
     */
    onEnterScene(prevData: PrevSceneData): Promise<void> | void;
    /**
     * When a scene has exited. Dispose resources here.
     */
    onExitScene?(currentData: PrevSceneData): PrevSceneData | void;
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

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/scene-controller.ts

/**
 * @public
 */
export class SceneController extends PluginBase implements NativePlugin, SceneController {
    isSceneController: boolean;
    isWebXR: boolean;
    viewportsCount: number;
    parent: Group<import("three").Object3DEventMap>;
    onUpdateAudioMixerOrientation(): Quaternion;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-base.ts

export class PluginBase implements PluginBase {
    #private;
    readonly id: string;
    readonly name: string;
    isSceneController: boolean;
    game: GameTimeApi;
    settings: SessionVariables;
    events: TypeEmitterProxy<WorldEvents>;
    constructor(pluginPackage: PluginPackage, session: PluginSessionContext);
    dispose(): void;
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
    /**
     * Read from the normalized configuration.
     */
    get config(): Record<string, any>;
    /**
     * Set the config from unnormalized data (ie leva config schema).
     */
    set rawConfig(value: PluginConfig);
    get rawConfig(): PluginConfig;
    /**
     * @param key The configuration key.
     * @returns the leva configuration for a particular field
     */
    getFieldDefinition(key: string): FieldDefinition<unknown> | undefined;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/vr-controller.ts

/**
 * @public
 */
export class VRSceneController extends SceneController implements NativePlugin, SceneController {
    isSceneController: boolean;
    isWebXR: boolean;
    viewportsCount: number;
    xr: WebXRManager;
    baseReferenceSpace: XRReferenceSpace;
    controllerModelFactory: XRControllerModelFactory;
    controller1: XRTargetRaySpace;
    controller2: XRTargetRaySpace;
    input1?: XRInputSource;
    input2?: XRInputSource;
    lastWorldPosition: Vector3;
    viewerPosition: Group<import("three").Object3DEventMap>;
    constructor(...args: ConstructorParameters<typeof SceneController>);
    setupXR(xr: WebXRManager): void;
    moveLocal(targetPosition: Vector3): void;
    moveWorld(targetPosition: Vector3): void;
    getPoseWorldPosition(): Vector3;
    onUpdateAudioMixerLocation(): Vector3;
    onUpdateAudioMixerOrientation(): Quaternion;
}
        }
        