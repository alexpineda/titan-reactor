declare module "titan-reactor/host" {
    type Vector2 = { x: number, y: number }

    export const UI_SYSTEM_READY = "system:ready";
    export const UI_SYSTEM_PLUGIN_CONFIG_CHANGED = "system:plugin-config-changed";
    export const UI_SYSTEM_MOUSE_CLICK = "system:mouse-click";
    export const UI_SYSTEM_CUSTOM_MESSAGE = "system:custom-message";
    export const UI_SYSTEM_FIRST_INSTALL = "system:first-install";
    export const UI_SYSTEM_OPEN_URL = "system:open-url";
    export const UI_SYSTEM_RUNTIME_READY = "system:runtime-ready";
    export const UI_SYSTEM_PLUGIN_DISABLED = "system:plugin-disabled";
    export const UI_SYSTEM_PLUGINS_ENABLED = "system:plugins-enabled";

    export const UI_STATE_EVENT_ON_FRAME = "frame";
    export const UI_STATE_EVENT_DIMENSIONS_CHANGED = "dimensions";
    export const UI_STATE_EVENT_SCREEN_CHANGED = "screen";
    export const UI_STATE_EVENT_WORLD_CHANGED = "world";
    export const UI_STATE_EVENT_UNITS_SELECTED = "units";
    export const UI_STATE_EVENT_PROGRESS = "progress";

    export type SceneInputHandler = NativePlugin & Partial<UserInputCallbacks> & { dispose: () => void; gameOptions: { allowUnitSelection: boolean; audio: "stereo" | "3d"; }; onEnterScene: (prevData: any) => Promise<void>; onExitScene?: ((currentData: any) => any) | undefined; onPostProcessingBundle: (renderPass: any, fogOfWarEffect: any) => { passes?: any[] | undefined; effects?: any[] | undefined; }; }
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
    export type MinimapDimensions = { minimapWidth: number; minimapHeight: number; }
    export type ReplayPlayer = { id: number; name: string; race: "zerg" | "terran" | "protoss" | "unknown"; team: number; color: string; isComputer: boolean; isHuman: boolean; isActive: boolean; }
    export type PluginStateMessage = { language: string; dimensions: MinimapDimensions; screen: { screen: SceneStateID | undefined; error: string | undefined; }; world: { map: { title: string; description: string; width: number; height: number; tileset: number; tilesetName: string; } | undefined; replay: { isBroodwar: number; gameName: string; mapName: string; gameType: number; gameSubtype: number; players: ReplayPlayer[]; frameCount: number; randomSeed: number; ancillary: { campaignId: number; commandByte: number; playerBytes: Buffer; unk1: number; playerName: Buffer; gameFlags: number; mapWidth: number; mapHeight: number; activePlayerCount: number; slotCount: number; gameSpeed: number; gameState: number; unk2: number; tileset: number; replayAutoSave: number; computerPlayerCount: number; unk3: number; unk4: number; unk5: number; unk6: number; victoryCondition: number; resourceType: number; useStandardUnitStats: number; fogOfWarEnabled: number; createInitialUnits: number; useFixedPositions: number; restrictionFlags: number; alliesEnabled: number; teamsEnabled: number; cheatsEnabled: number; tournamentMode: number; victoryConditionValue: number; startingMinerals: number; startingGas: number; unk7: number; }; } | undefined; }; frame: { frame: number; playerData: Int32Array; unitProduction: Int32Array[]; research: Int32Array[]; upgrades: Int32Array[]; }; progress: number; units: DumpedUnit[]; }
    export class PluginProto implements NativePlugin {

    }
    export type SceneStateID = "@home" | "@loading" | "@replay" | "@map" | "@iscriptah" | "@interstitial"
    export type UIStateAssets = { bwDat: BwDAT; gameIcons: ResourceIcons; cmdIcons: string[]; raceInsetIcons: RaceInsetIcons; workerIcons: WorkerIcons; wireframeIcons: string[]; }
    export interface WorkerIcons extends RaceInsetIcons {
        apm: string;
    }
    export interface RaceInsetIcons {
        terran: string;
        zerg: string;
        protoss: string;
    }
    export interface CenteredCursorIcons {
        icons: string[];
        offX: number;
        offY: number;
    }
    export interface ResourceIcons extends RaceInsetIcons {
        minerals: string;
        vespeneZerg: string;
        vespeneTerran: string;
        vespeneProtoss: string;
        energy: string;
    }
    export interface Unit extends UnitStruct {
        extras: {
            recievingDamage: number;
            selected?: boolean;
            dat: UnitDAT;
            /** @internal */
            turretLo: Vector2 | null;
        };
    }
    export interface DumpedUnit extends Unit {
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
    export interface NativePlugin extends PluginPrototype {
        /**
         * Package name
         */
        name: string;
        /**
         * @internal
         */
        $$meta: {
            hooks: string[];
            methods: string[];
            indexFile: string;
            isSceneController: boolean;
        };
        /**
         * Send a message to your plugin UI.
         */
        sendUIMessage: (message: any) => void;
        /**
         * Call your custom hook. Must be defined in the package.json first.
         */
        callCustomHook: (hook: string, ...args: any[]) => any;
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
        context?: any;
        /**
         * When a game has been loaded and the game loop is about to begin
         */
        onSceneReady?: () => void;
        /**
         * When the scene is being disposed
         */
        onSceneDisposed?: () => void;
        /**
         * When a unit is created, but not necessarily fully trained.
         */
        onUnitCreated?: () => void;
        /**
         * When a unit is destroyed, not necessarily killed.
         */
        onUnitDestroyed?: () => void;
        /**
         * When the scene objects have been reset due to replay forwarding or rewinding.
         */
        onFrameReset?: () => void;
        /**
         * When an upgrade has been completed
         */
        onUpgradeCompleted?: () => void;
        /**
         * When research has been completed
         */
        onTechCompleted?: () => void;
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
        onCameraMouseUpdate: (delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, mouse: Vector3, clientX: number, clientY: number, clicked?: Vector3) => void;
        /**
         * Updates every frame with the current keyboard data.
         *
         * @param delta - Time in milliseconds since last frame
         * @param elapsed - Time in milliseconds since the game started
         * @param truck - x,y movement deltas
         */
        onCameraKeyboardUpdate: (delta: number, elapsed: number, truck: Vector2) => void;
        /**
         * Whether or not a unit should be drawn.
         */
        onShouldHideUnit: (unit: any) => boolean | undefined;
        /**
         * You must return a Vector3 with a position for the audio listener.
         *
         * @param delta - Time in milliseconds since last frame
         * @param elapsed - Time in milliseconds since the game started
         * @param target - Vector3 of the current camera target
         * @param position - Vector 3 of the current camera position
         */
        onUpdateAudioMixerLocation: (delta: number, elapsed: number, target: Vector3, position: Vector3) => Vector3;
        /**
         * Updates when the minimap is clicked and dragged.
         *
         * @param pos - Vector3 of the map coordinates.
         * @param isDragStart - Did the user just start dragging
         * @param mouseButton - The button the user is using.
         */
        onMinimapDragUpdate: (pos: Vector3, isDragStart: boolean, mouseButton?: number) => void;
        /**
         * Called every frame to draw the minimap.
         */
        onDrawMinimap: (ctx: CanvasRenderingContext2D) => void;
    }
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
        repository?: string | {
            type?: string;
            url?: string;
        };
        peerDependencies?: {
            [key: string]: string;
        };
        config?: {
            system?: {
                permissions?: string[];
                deprecated?: boolean;
            };
            [key: string]: any;
        };
    }
    export type IScriptDATType = { iscripts: Record<number, IScriptRawType>; animationBlocks: Record<number, AnimationBlockType>; }
    export type SoundDAT = { file: string; priority: number; flags: number; race: number; minVolume: number; }
    export type TechDataDAT = { mineralCost: number; vespeneCost: number; researchTime: number; energyRequired: number; researchRequirements: number; useRequirements: number; icon: number; name: string; race: number; researched: number; }
    export type UpgradeDAT = { mineralCostBase: number; mineralCostFactor: number; vespeneCostFactor: number; vespeneCostBase: number; researchTimeBase: number; researchTimeFactor: number; requirements: number; icon: number; name: string; maxRepeats: number; race: number; }
    export type OrderDAT = { name: string; }
    //eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface UnitDAT extends UnitDATIncomingType {
    }
    export class UnitDAT implements UnitDAT {
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
    export type ImageDAT = { index: number; grpFile: string; name: string; grp: number; gfxTurns: number; clickable: number; useFullIscript: number; drawIfCloaked: number; drawFunction: number; remapping: number; iscript: number; shieldOverlay: number; attackOverlay: number; damageOverlay: number; specialOverlay: number; landingDustOverlay: number; liftOffDustOverlay: number; }
    export type LoDAT = Vector2[][]
    export type SpriteDAT = { image: ImageDAT; name: string; index: number; healthBar: number; visible: number; selectionCircle: { size: number; index: number; }; selectionCircleOffset: number; }
    export type WeaponDAT = { index: number; name: string; flingy: FlingyDAT; targetFlags: number; minRange: number; maxRange: number; damageUpgrade: number; damageType: number; weaponBehavior: number; explosionType: number; innerSplashRange: number; mediumSplashRange: number; outerSplashRange: number; damageAmount: number; damageBonus: number; weaponCooldown: number; damageFactor: number; attackAngle: number; launchSpin: number; forwardOffset: number; upwardOffset: number; }
    export type GrpSprite = { w: number; h: number; frames: AnimFrame[]; maxFrameH: number; maxFramew: number; }
    export interface UnitStruct extends FlingyStruct {
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
    export interface PluginPrototype {
        id: string;
        config?: {
            [key: string]: any;
        };
        /**
         *Special permissions specified in the package.json.
         * @internal
         */
        $$permissions: {
            [key: string]: boolean;
        };
        /**
         * Unprocessed configuration data from the package.json.
         * @internal
         */
        $$config: {
            [key: string]: any;
        };
        /**
         * Allows a plugin to update it's own config key/value store
         */
        setConfig: (key: string, value: any, persist: boolean) => any;
    }
    export type IScriptRawType = { id: number; type: number; offset: number; offsets: number[]; }
    export type AnimationBlockType = IscriptOperations[]
    export interface UnitDATIncomingType {
        index: number;
        flingy: any;
        subUnit1: number;
        subUnit2: number;
        infestation: number[];
        constructionAnimation: any;
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
    export type FlingyDAT = { sprite: SpriteDAT; speed: number; acceleration: number; haltDistance: number; turnRadius: number; }
    export type AnimFrame = { x: number; y: number; w: number; h: number; xoff: number; yoff: number; }
    export interface FlingyStruct extends ThingyStruct {
        x: number;
        y: number;
        direction: number;
    }
    export type IscriptOperations = opGoto | opPlayFrame | opPlayframtile | opSetHorPos | opSetVertPos | opSetPos | opWait | opWaitRand | opSwitchUlt | opSetFlSpeed | opMove | opPowerupCondJmp | opSigOrder | opOrderDone | opSetSpawnFrame | opUflUnstable | op__0c | op__2d | op__3e | op__43 | opImgol | opImgul | opImgolUselo | opImgulUselo | opSprol | opHighSprol | opLowSprul | opSprulUselo | opSprul | opSprolUselo | opImgOlOrig | opSwitchUl | opEnd | opSetFlipState | opPlaySnd | opPlaySndRand | opPlaySndBtwn | opDoMissileDmg | opAttackMelee | opFollowMainGraphic | opRandCondJmp | opTurnCCWise | opTurnCWise | opTurn1CWise | opTurnRand | opAttackWith | opAttack | opCastSpell | opUseWeapon | opGotoRepeatAttk | opEngFrame | opEngSet | opNoBrkCodeStart | opNoBrkCodeEnd | opIgnoreRest | opTmprmGraphicStart | opTmprmGraphicEnd | opReturn | opAttkShiftProj | opSetFlDirect | opCall | opCreateGasOverlays | opTargetRangeCondJmp | opTargetArcCondJmp | opCurDirectCondJump | opImgulNextId | opLiftOffCondJmp | opWarpOverlay | opGrdSprol | opDoGrdDamage
    export interface ThingyStruct {
        hp: number;
        spriteIndex: number;
    }
    export type opGoto = ["goto", opArgOne]
    export type opPlayFrame = ["playfram", opArgOne]
    export type opPlayframtile = ["playframtile", opArgOne]
    export type opSetHorPos = ["sethorpos", opArgOne]
    export type opSetVertPos = ["setvertpos", opArgOne]
    export type opSetPos = ["setpos", opArgTwo]
    export type opWait = ["wait", opArgOne]
    export type opWaitRand = ["waitrand", opArgTwo]
    export type opSwitchUlt = ["switchul", []]
    export type opSetFlSpeed = ["setflspeed", opArgOne]
    export type opMove = ["move", []]
    export type opPowerupCondJmp = ["pwrupcondjmp", []]
    export type opSigOrder = ["sigorder", []]
    export type opOrderDone = ["orderdone", []]
    export type opSetSpawnFrame = ["setspawnframe", []]
    export type opUflUnstable = ["uflunstable", []]
    export type op__0c = ["__0c", []]
    export type op__2d = ["__2d", []]
    export type op__3e = ["__3e", []]
    export type op__43 = ["__43", []]
    export type opImgol = ["imgol", opArgThree]
    export type opImgul = ["imgul", opArgThree]
    export type opImgolUselo = ["imgoluselo", opArgThree]
    export type opImgulUselo = ["imguluselo", opArgThree]
    export type opSprol = ["sprol", opArgThree]
    export type opHighSprol = ["highsprol", opArgThree]
    export type opLowSprul = ["lowsprul", opArgThree]
    export type opSprulUselo = ["spruluselo", opArgThree]
    export type opSprul = ["sprul", opArgThree]
    export type opSprolUselo = ["sproluselo", opArgTwo]
    export type opImgOlOrig = ["imgolorig", opArgOne]
    export type opSwitchUl = ["switchul", opArgOne]
    export type opEnd = ["end", opArgOne]
    export type opSetFlipState = ["setflipstate", opArgOne]
    export type opPlaySnd = ["playsnd", opArgOne]
    export type opPlaySndRand = ["playsndrand", opArgTwo]
    export type opPlaySndBtwn = ["playsndbtwn", opArgTwo]
    export type opDoMissileDmg = ["domissiledmg", []]
    export type opAttackMelee = ["attackmelee", opArgTwo]
    export type opFollowMainGraphic = ["followmaingraphic", []]
    export type opRandCondJmp = ["randcondjmp", opArgTwo]
    export type opTurnCCWise = ["turnccwise", opArgOne]
    export type opTurnCWise = ["turncwise", opArgOne]
    export type opTurn1CWise = ["turn1cwise", []]
    export type opTurnRand = ["turnrand", opArgOne]
    export type opAttackWith = ["attackwith", opArgOne]
    export type opAttack = ["attack", []]
    export type opCastSpell = ["castspell", []]
    export type opUseWeapon = ["useweapon", opArgOne]
    export type opGotoRepeatAttk = ["gotorepeatattk", []]
    export type opEngFrame = ["engframe", opArgOne]
    export type opEngSet = ["engset", opArgOne]
    export type opNoBrkCodeStart = ["nobrkcodestart", []]
    export type opNoBrkCodeEnd = ["nobrkcodeend", []]
    export type opIgnoreRest = ["ignorerest", []]
    export type opTmprmGraphicStart = ["tmprmgraphicstart", []]
    export type opTmprmGraphicEnd = ["tmprmgraphicend", []]
    export type opReturn = ["return", []]
    export type opAttkShiftProj = ["attkshiftproj", opArgOne]
    export type opSetFlDirect = ["setfldirect", opArgOne]
    export type opCall = ["call", opArgOne]
    export type opCreateGasOverlays = ["creategasoverlays", opArgOne]
    export type opTargetRangeCondJmp = ["trgtrangecondjmp", opArgTwo]
    export type opTargetArcCondJmp = ["trgtarccondjmp", opArgThree]
    export type opCurDirectCondJump = ["curdirectcondjmp", opArgThree]
    export type opImgulNextId = ["imgulnextid", opArgTwo]
    export type opLiftOffCondJmp = ["liftoffcondjmp", [number]]
    export type opWarpOverlay = ["warpoverlay", [number]]
    export type opGrdSprol = ["grdsprol", [number, number, number]]
    export type opDoGrdDamage = ["dogrddamage", []]
    export type opArgOne = [number]
    export type opArgTwo = [number, number]
    export type opArgNone = []
    export type opArgThree = [number, number, number]

}