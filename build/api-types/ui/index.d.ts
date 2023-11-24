
        
        import React from "react"
import Chk from "bw-chk"
import { Replay } from "process-replay";
import { CompressedTexture, BufferAttribute, DataArrayTexture, CubeTexture, DataTexture, Texture } from "three";



//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/** @internal */
declare function chunk(arr: Int32Array, n: number): Int32Array[];

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/** @internal */
interface Component {
    pluginId: string;
    id: number;
    order: number | undefined;
    messageHandler: EventTarget;
    JSXElement: React.FC<any>;
    snap: string;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/** @internal */
type StateMessage = Partial<PluginStateMessage>;

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-system-ui.ts

/**
 * @resolve
 */
/** @internal */
interface PluginStateMessage {
    language: string;
    [UI_STATE_EVENT_DIMENSIONS_CHANGED]: MinimapDimensions;
    [UI_STATE_EVENT_SCREEN_CHANGED]: {
        screen: TRSceneID | undefined;
        error: string | undefined;
    };
    [UI_STATE_EVENT_WORLD_CHANGED]: ReturnType<typeof worldPartial>;
    [UI_STATE_EVENT_ON_FRAME]: number;
    [UI_STATE_EVENT_PRODUCTION]: {
        playerData: Int32Array;
        unitProduction: Int32Array[];
        research: Int32Array[];
        upgrades: Int32Array[];
    };
    [UI_STATE_EVENT_UNITS_SELECTED]: DumpedUnit[] | DeepPartial<Unit>[];
}

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_DIMENSIONS_CHANGED = "dimensions";

//C:/Users/Game_Master/Projects/titan-reactor/src/render/minimap-dimensions.ts
/** @internal */
interface MinimapDimensions {
    matrix: number[];
    minimapWidth: number;
    minimapHeight: number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_SCREEN_CHANGED = "screen";

//C:/Users/Game_Master/Projects/titan-reactor/src/scenes/scene.ts
/// <reference types="react" />
/** @internal */
type TRSceneID = "@home" | "@loading" | "@replay" | "@map" | "@iscriptah" | "@interstitial" | "@auth";

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_WORLD_CHANGED = "world";

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-system-ui.ts

/** @internal */
declare const worldPartial: (world: ReplayAndMapStore) => {
    map: {
        title: string;
        description: string;
        width: number;
        height: number;
        tileset: number;
        tilesetName: string;
    } | undefined;
    replay: {
        isBroodwar: number;
        gameName: string;
        mapName: string;
        gameType: number;
        gameSubtype: number;
        players: import("process-replay").ReplayPlayer[];
        frameCount: number;
        randomSeed: number;
        ancillary: {
            campaignId: number;
            commandByte: number;
            playerBytes: Buffer;
            unk1: number;
            playerName: Buffer;
            gameFlags: number;
            mapWidth: number;
            mapHeight: number;
            activePlayerCount: number;
            slotCount: number;
            gameSpeed: number;
            gameState: number;
            unk2: number;
            tileset: number;
            replayAutoSave: number;
            computerPlayerCount: number;
            unk3: number;
            unk4: number;
            unk5: number;
            unk6: number;
            victoryCondition: number;
            resourceType: number;
            useStandardUnitStats: number;
            fogOfWarEnabled: number;
            createInitialUnits: number;
            useFixedPositions: number;
            restrictionFlags: number;
            alliesEnabled: number;
            teamsEnabled: number;
            cheatsEnabled: number;
            tournamentMode: number;
            victoryConditionValue: number;
            startingMinerals: number;
            startingGas: number;
            unk7: number;
        };
    } | undefined;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/stores/replay-and-map-store.ts

/** @internal */
interface ReplayAndMapStore {
    type: "map" | "replay" | "live";
    live: boolean;
    map?: Chk;
    replay?: ValidatedReplay;
    mapImage?: HTMLCanvasElement;
    reset: () => void;
    totalGameTime: number;
    replayIndex: number;
    addToTotalGameTime: (t: number) => void;
    replayQueue: ValidatedReplay[];
    getNextReplay: (this: void) => ValidatedReplay | undefined;
    getDeltaReplay: (d: number) => ValidatedReplay | undefined;
    addReplaysToQueue: (replays: ValidatedReplay[]) => void;
    addReplayToQueue: (replay: ValidatedReplay) => void;
    deleteReplayQueueItem: (replay: ValidatedReplay) => void;
    clearReplayQueue: () => void;
    flushWatchedReplays: () => void;
    updateNextReplay: () => void;
    loadNextReplay: () => Promise<void>;
    loadMap: (fileBuffer: ArrayBuffer) => Promise<void>;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/scenes/load-and-validate-replay.ts

/** @internal */
type ValidatedReplay = Replay & {
    buffer: Buffer;
    uid: number;
};

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_ON_FRAME = "frame";

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_PRODUCTION = "production";

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/events.ts

/** @internal */
declare const UI_STATE_EVENT_UNITS_SELECTED = "units";

//C:/Users/Game_Master/Projects/titan-reactor/src/core/unit.ts

/**
 * @public
 * Extended unit information.
 */
export interface DumpedUnit extends Partial<Unit> {
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
    loaded?: {
        id: number;
        typeId: number;
        hp: number;
    }[];
    buildQueue?: number[];
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

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/utils/deep-partial.ts
/** @internal */
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Use the translation function to translate a string
 */
export declare const useLocale: () => string | undefined;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * The replay header information.
 */
export declare const useReplay: () => {
    isBroodwar: number;
    gameName: string;
    mapName: string;
    gameType: number;
    gameSubtype: number;
    players: import("process-replay").ReplayPlayer[];
    frameCount: number;
    randomSeed: number;
    ancillary: {
        campaignId: number;
        commandByte: number;
        playerBytes: Buffer;
        unk1: number;
        playerName: Buffer;
        gameFlags: number;
        mapWidth: number;
        mapHeight: number;
        activePlayerCount: number;
        slotCount: number;
        gameSpeed: number;
        gameState: number;
        unk2: number;
        tileset: number;
        replayAutoSave: number;
        computerPlayerCount: number;
        unk3: number;
        unk4: number;
        unk5: number;
        unk6: number;
        victoryCondition: number;
        resourceType: number;
        useStandardUnitStats: number;
        fogOfWarEnabled: number;
        createInitialUnits: number;
        useFixedPositions: number;
        restrictionFlags: number;
        alliesEnabled: number;
        teamsEnabled: number;
        cheatsEnabled: number;
        tournamentMode: number;
        victoryConditionValue: number;
        startingMinerals: number;
        startingGas: number;
        unk7: number;
    };
} | undefined;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * The map information.
 */
export declare const useMap: () => {
    title: string;
    description: string;
    width: number;
    height: number;
    tileset: number;
    tilesetName: string;
} | undefined;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * The current frame of the replay.
 */
export declare const useFrame: () => number | undefined;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * All players in the current replay.
 */
export declare const usePlayers: () => import("process-replay").ReplayPlayer[];

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Returns a function getPlayerInfo that can be used to get resource information about a player.
 */
export declare const usePlayerFrame: () => (id: number) => PlayerInfo;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Player information.
 */
export declare class PlayerInfo {
    _struct_size: number;
    playerId: number;
    playerData: Required<StateMessage>["production"]["playerData"];
    get _offset(): number;
    get minerals(): number;
    get vespeneGas(): number;
    get supply(): number;
    get supplyMax(): number;
    get workerSupply(): number;
    get armySupply(): number;
    get apm(): number;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Returns a function that can be used to get player information.
 */
export declare const usePlayer: () => (playerId: number) => import("process-replay").ReplayPlayer | undefined;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Returns user selected units (if any).
 */
export declare const useSelectedUnits: () => {
    extras: {
        dat: UnitDAT;
    };
    isAttacking?: boolean | undefined;
    id?: number | undefined;
    typeId?: number | undefined;
    owner?: number | undefined;
    energy?: number | undefined;
    shields?: number | undefined;
    statusFlags?: number | undefined;
    remainingBuildTime?: number | undefined;
    resourceAmount?: number | undefined;
    order?: number | null | undefined;
    kills?: number | undefined;
    orderTargetAddr?: number | undefined;
    orderTargetX?: number | undefined;
    orderTargetY?: number | undefined;
    orderTargetUnit?: number | undefined;
    groundWeaponCooldown?: number | undefined;
    airWeaponCooldown?: number | undefined;
    spellCooldown?: number | undefined;
    subunit?: {
        id?: number | undefined;
        typeId?: number | undefined;
        owner?: number | undefined;
        energy?: number | undefined;
        shields?: number | undefined;
        statusFlags?: number | undefined;
        remainingBuildTime?: number | undefined;
        resourceAmount?: number | undefined;
        order?: number | null | undefined;
        kills?: number | undefined;
        orderTargetAddr?: number | undefined;
        orderTargetX?: number | undefined;
        orderTargetY?: number | undefined;
        orderTargetUnit?: number | undefined;
        groundWeaponCooldown?: number | undefined;
        airWeaponCooldown?: number | undefined;
        spellCooldown?: number | undefined;
        subunit?: any | null | undefined;
        subunitId?: number | null | undefined;
        x?: number | undefined;
        y?: number | undefined;
        direction?: number | undefined;
        currentSpeed?: number | undefined;
        moveTargetX?: number | undefined;
        moveTargetY?: number | undefined;
        nextMovementWaypointX?: number | undefined;
        nextMovementWaypointY?: number | undefined;
        nextTargetWaypointX?: number | undefined;
        nextTargetWaypointY?: number | undefined;
        movementFlags?: number | undefined;
        currentVelocityDirection?: number | undefined;
        hp?: number | undefined;
        spriteIndex?: number | undefined;
        spriteAddr?: number | undefined;
    } | null | undefined;
    subunitId?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;
    direction?: number | undefined;
    currentSpeed?: number | undefined;
    moveTargetX?: number | undefined;
    moveTargetY?: number | undefined;
    nextMovementWaypointX?: number | undefined;
    nextMovementWaypointY?: number | undefined;
    nextTargetWaypointX?: number | undefined;
    nextTargetWaypointY?: number | undefined;
    movementFlags?: number | undefined;
    currentVelocityDirection?: number | undefined;
    hp?: number | undefined;
    spriteIndex?: number | undefined;
    spriteAddr?: number | undefined;
}[];

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Get the icon id for a particular unit type.
 */
export declare const getUnitIcon: (unit: DumpedUnit) => any;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Returns three functions that can be used to get player production information.
 * Units, Upgrades and Research.
 */
export declare const useProduction: () => (((playerId: number) => ({
    typeId: number;
    icon: number;
    count: number;
    progress: number;
    isUnit: boolean;
} | null)[]) | ((playerId: number) => {
    typeId: number;
    icon: number;
    level: number;
    isUpgrade: boolean;
    progress: number;
}[]) | ((playerId: number) => {
    typeId: number;
    icon: number;
    progress: number;
    isResearch: boolean;
}[]))[];

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Converts a frame numer to a time string eg 01:00.
 */
export declare const getFriendlyTime: (frame: number) => string;

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

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/image.ts

/** @internal */
declare enum UnitTileScale {
    SD = 1,
    HD2 = 2,
    HD = 4
}

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 */
export declare const openUrl: (url: string) => void;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Images and game data.
 */
export type RuntimeAssets = Pick<SystemReadyMessage["assets"], "bwDat">;

//C:/Users/Game_Master/Projects/titan-reactor/src/plugins/plugin-system-ui.ts

/** @internal */
interface SystemReadyMessage {
    initialStore: PluginStateMessage;
    plugins: PluginMetaData[];
    assets: Pick<Assets, "bwDat"> & {
        url: string;
        imagesUrl: string;
    };
    enums: any;
}

//C:/Users/Game_Master/Projects/titan-reactor/src/common/types/plugin.ts

/**
 * A plugin's metadata based off it's package.json file and surrounding plugin files.
 */
/** @internal */
interface PluginMetaData extends PluginPackage {
    path: string;
    date?: Date;
    readme?: string;
    isSceneController: boolean;
    apiVersion: string;
    url: string;
    config: PluginConfig;
    urls: {
        host: string | null;
        ui: string | null;
    };
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

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Enums and data for game types.
 */
export declare const enums: any;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Images and game data.
 */
export declare const assets: RuntimeAssets;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * A number that rolls up and down quickly like a casino slot.
 */
export declare const RollingNumber: ({ value, upSpeed, downSpeed, ...props }: {
    value: number;
    upSpeed: number | undefined;
    downSpeed: number | undefined;
}) => JSX.Element;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Receive ipc messages from your native plugin.
 */
export declare const useMessage: (cb?: ((event: any) => void) | undefined, deps?: unknown[]) => void;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Send ipc messages to your native plugin.
 */
export declare const useSendMessage: () => (message: unknown) => void;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Get your users plugin configuration.
 */
export declare const usePluginConfig: () => object;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 * Set a global stylesheet.
 */
export declare const useStyleSheet: (content: string, deps?: never[]) => void;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/**
 * @public
 */
export declare const proxyFetch: (url: string) => Promise<Response>;

//C:/Users/Game_Master/Projects/titan-reactor/src/runtime.tsx

/** @internal */
declare const _rc: (pluginId: string, component: Component, JSXElement: React.FC<any>) => void;
        declare global {
            var registerComponent: ( component: Partial<Pick<Component, "order" | "snap" | "screen">>, JSXElement: React.FC<any> ) => void;
            
        }
        