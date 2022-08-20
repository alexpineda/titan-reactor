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
    export class PluginBase implements NativePlugin {
        id: string;
        name: string;
        isSceneController = false;
        #config: any = {};
        /**
         * @internal
         * Same as config but simplified to [key] = value | [key] = value * factor
         */
        #normalizedConfig: any;
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
        setConfig(key: string, value: any) {
            if (!(key in this.#config)) {
                log.warning(`Plugin ${this.id} tried to set config key ${key} but it was not found`);
                return undefined;
            }
            // TODO: use leva detection algo here to determine if values are in bounds
            //@ts-ignore
            this.#config[key].value = value;
            updatePluginsConfig(this.id, this.#config);
        }
        /*
        * Generates the normalized config object.
        * Same as config but simplified to [key] = value | [key] = value * factor
        */
        refreshConfig() {
            this.#normalizedConfig = normalizePluginConfiguration(this.#config);
        }
        /**
         * Read from the normalized configuration.
         */
        get config() {
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
        getRawConfigComponent(key: string) {
            return this.#config[key];
        }
    }
    export interface GameTimeApi {
        type: "replay";
        readonly viewport: GameViewPort;
        readonly secondViewport: GameViewPort;
        readonly viewports: GameViewPort[];
        simpleMessage(message: string): void;
        scene: BaseScene;
        cssScene: Scene;
        assets: Assets;
        toggleFogOfWarByPlayerId(playerId: number): void;
        unitsIterator(): IterableIterator<Unit>;
        skipForward(seconds: number): void;
        skipBackward(seconds: number): void;
        speedUp(): number;
        speedDown(): number;
        togglePause(setPaused?: boolean): boolean;
        readonly gameSpeed: number;
        setGameSpeed(speed: number): void;
        refreshScene(): void;
        pxToGameUnit: PxToGameUnit;
        fogOfWar: FogOfWar;
        mapWidth: number;
        mapHeight: number;
        tileset: number;
        tilesetName: string;
        getTerrainY: GetTerrainY;
        terrain: Terrain;
        readonly currentFrame: number;
        readonly maxFrame: number;
        gotoFrame(frame: number): void;
        exitScene(): void;
        setPlayerColors(colors: string[]): void;
        getPlayerColor(playerId: number): Color;
        getOriginalColors(): string[];
        setPlayerNames(names: {
            name: string;
            id: number;
        }[]): void;
        getOriginalNames(): {
            name: string;
            id: number;
        }[];
        getPlayers(): ReplayPlayer[];
        replay: ReplayHeader;
        readonly followedUnitsPosition: Vector3 | undefined | null;
        selectUnits(units: number[]): void;
        selectedUnits: Unit[];
        playSound(typeId: number, volumeOrX?: number, y?: number, unitTypeId?: number): void;
        togglePointerLock(val: boolean): void;
        readonly pointerLockLost: boolean;
        mouseCursor: boolean;
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
        config: {
            [key: string]: any;
        };
        /**
         * Unprocessed configuration data from the package.json.
         * @internal
         */
        getRawConfigComponent(key: string): any;
        /**
         * Allows a plugin to update it's own config key/value store
         */
        setConfig: (key: string, value: any, persist: boolean) => any;
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
        specialAbilityFlags = 0;
        starEditGroupFlags = 0;
        name = "";
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
        constructor(data: UnitDATIncomingType) {
            Object.assign(this, data);
            const flag = (shift: number) => {
                return (this.specialAbilityFlags & (1 << shift)) !== 0;
            };
            const starEditGroupFlag = (bit: number) => {
                return !!(this.starEditGroupFlags & bit);
            };
            this.isBuilding = flag(0);
            this.isAddon = flag(1);
            this.isFlyer = flag(2);
            this.isResourceMiner = flag(3);
            this.isTurret = flag(4);
            this.isFlyingBuilding = flag(5);
            this.isHero = flag(6);
            this.regenerates = flag(7);
            this.animatedIdle = flag(8);
            this.cloakable = flag(9);
            this.twoUnitsInOneEgg = flag(10);
            this.singleEntity = flag(11);
            this.isResourceDepot = flag(12);
            this.isResourceContainer = flag(13);
            this.isRobotic = flag(14);
            this.isDetector = flag(15);
            this.isOrganic = flag(16);
            this.requiresCreep = flag(17);
            this.unusedFlag = flag(18);
            this.requiresPsi = flag(19);
            this.burrowable = flag(20);
            this.isSpellcaster = flag(21);
            this.permanentCloak = flag(22);
            this.pickupItem = flag(23);
            this.ignoreSupplyCheck = flag(24);
            this.useMediumOverlays = flag(25);
            this.useLargeOverlays = flag(26);
            this.battleReactions = flag(27);
            this.fullAutoAttack = flag(28);
            this.invincible = flag(29);
            this.isMechanical = flag(30);
            this.producesUnits = flag(31);
            this.isZerg = starEditGroupFlag(1);
            this.isTerran = starEditGroupFlag(2);
            this.isProtoss = starEditGroupFlag(4);
        }
    }
    export type ImageDAT = { index: number; grpFile: string; name: string; grp: number; gfxTurns: number; clickable: number; useFullIscript: number; drawIfCloaked: number; drawFunction: number; remapping: number; iscript: number; shieldOverlay: number; attackOverlay: number; damageOverlay: number; specialOverlay: number; landingDustOverlay: number; liftOffDustOverlay: number; }
    export type LoDAT = Vector2[][]
    export type SpriteDAT = { image: ImageDAT; name: string; index: number; healthBar: number; visible: number; selectionCircle: { size: number; index: number; }; selectionCircleOffset: number; }
    export type WeaponDAT = { index: number; name: string; flingy: FlingyDAT; targetFlags: number; minRange: number; maxRange: number; damageUpgrade: number; damageType: number; weaponBehavior: number; explosionType: number; innerSplashRange: number; mediumSplashRange: number; outerSplashRange: number; damageAmount: number; damageBonus: number; weaponCooldown: number; damageFactor: number; attackAngle: number; launchSpin: number; forwardOffset: number; upwardOffset: number; }
    export type GrpSprite = { w: number; h: number; frames: AnimFrame[]; maxFrameH: number; maxFramew: number; }
    export class GameViewPort {
        enabled = false;
        camera = new DirectionalCamera(15, 1, 0.1, 1000);
        projectedView = new ProjectedCameraView();
        orbit: CameraControls;
        viewport = new Vector4(0, 0, 300, 200);
        cameraShake = new CameraShake;
        shakeCalculation = {
            frequency: new Vector3(10, 20, 7.5),
            duration: new Vector3(1000, 1000, 1000),
            strength: new Vector3(),
            needsUpdate: false
        };
        #height = 300;
        #width = 300;
        #left?: number | null;
        #right?: number | null;
        #top?: number | null;
        #bottom?: number | null;
        #center?: Vector2 | null;
        #surface: Surface;
        constrainToAspect = true;
        spriteRenderOptions: SpriteRenderOptions;
        postProcessing: PostProcessingBundleDTO;
        constructor(surface: Surface, bundle: PostProcessingBundleDTO) {
            this.#surface = surface;
            this.camera = new DirectionalCamera(15, surface.aspect, 0.1, 500);
            this.orbit = new CameraControls(this.camera, this.#surface.canvas);
            this.orbit = this.reset();
            this.postProcessing = {
                ...bundle,
                passes: [...bundle.passes],
                effects: [...bundle.effects]
            };
            this.spriteRenderOptions = {
                unitScale: 1,
                rotateSprites: false,
            };
        }
        reset() {
            this.orbit?.dispose();
            this.orbit = new CameraControls(this.camera, this.#surface.canvas);
            this.orbit.mouseButtons.left = CameraControls.ACTION.NONE;
            this.orbit.mouseButtons.right = CameraControls.ACTION.NONE;
            this.orbit.mouseButtons.middle = CameraControls.ACTION.NONE;
            this.orbit.mouseButtons.wheel = CameraControls.ACTION.NONE;
            this.orbit.mouseButtons.shiftLeft = CameraControls.ACTION.NONE;
            this.orbit.setLookAt(0, 50, 0, 0, 0, 0, false);
            return this.orbit;
        }
        set center(val: Vector2 | undefined | null) {
            this.#center = val;
            this.update();
        }
        get center() {
            return this.#center;
        }
        set height(val: number) {
            this.#height = val <= 1 ? this.#surface.bufferHeight * val : val;
            if (this.constrainToAspect) {
                this.#width = this.#height * this.camera.aspect;
            }
            this.update();
        }
        set width(val: number) {
            this.#width = val <= 1 ? this.#surface.bufferWidth * val : val;
            if (this.constrainToAspect) {
                this.#height = this.#width / this.camera.aspect;
            }
            this.update();
        }
        get width() {
            return this.#width;
        }
        get height() {
            return this.#height;
        }
        get left() {
            return this.#left;
        }
        set left(val: number | undefined | null) {
            this.#left = val;
            if (typeof val === "number") {
                this.#left = val <= 1 ? this.#surface.bufferWidth * val : val;
            }
            this.update();
        }
        set right(val: number | undefined | null) {
            this.#right = val;
            if (typeof val === "number") {
                this.#right = val <= 1 ? this.#surface.bufferWidth * val : val;
            }
            this.update();
        }
        get right() {
            return this.#right;
        }
        get top() {
            return this.#top;
        }
        set top(val: number | undefined | null) {
            this.#top = val;
            if (typeof val === "number") {
                this.#top = val <= 1 ? this.#surface.bufferHeight * val : val;
            }
            this.update();
        }
        set bottom(val: number | undefined | null) {
            this.#bottom = val;
            if (typeof val === "number") {
                this.#bottom = val <= 1 ? this.#surface.bufferHeight * val : val;
            }
            this.update();
        }
        get bottom() {
            return this.#bottom;
        }
        update() {
            if (this.center) {
                const x = this.center.x - this.width / 2;
                const y = this.surfaceHeight - this.center.y - (this.height / 2);
                this.viewport.set(MathUtils.clamp(x, this.#width / 2, this.surfaceWidth - this.#width / 2), MathUtils.clamp(y, this.height / 2, this.surfaceHeight - this.height / 2), this.width, this.height);
            }
            else {
                let x = 0, y = 0;
                if (isNumber(this.left) && !isNumber(this.right)) {
                    x = this.left;
                }
                else if (isNumber(this.right) && !isNumber(this.left)) {
                    x = this.surfaceWidth - this.width - this.right;
                }
                else if (isNumber(this.left) && isNumber(this.right)) {
                    x = this.left;
                    this.width = this.surfaceWidth - this.left - this.right;
                }
                if (isNumber(this.bottom) && !isNumber(this.top)) {
                    y = this.bottom;
                }
                else if (isNumber(this.top) && !isNumber(this.bottom)) {
                    y = this.surfaceHeight - this.height - this.top;
                }
                else if (isNumber(this.bottom) && isNumber(this.top)) {
                    y = this.bottom;
                    this.height = this.surfaceWidth - this.bottom - this.top;
                }
                this.viewport.set(x, y, this.width, this.height);
            }
        }
        get surfaceWidth() {
            return this.#surface.bufferWidth;
        }
        get surfaceHeight() {
            return this.#surface.bufferHeight;
        }
        get aspect() {
            return this.camera.aspect;
        }
        set aspect(aspect: number) {
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();
            if (this.constrainToAspect) {
                this.height = this.#height;
            }
            else {
                this.update();
            }
        }
        dispose() {
            this.orbit?.dispose();
        }
        generatePrevData() {
            const target = new Vector3();
            const position = new Vector3();
            this.orbit!.getTarget(target);
            this.orbit!.getPosition(position);
            return {
                target: target,
                position: position
            };
        }
    }
    export class BaseScene extends ThreeScene {
        #mapWidth: number;
        #mapHeight: number;
        #janitor: Janitor;
        #borderTiles: Group;
        hemilight: HemisphereLight;
        sunlight: DirectionalLight;
        //@ts-ignore
        userData: {
            terrain: Terrain;
        };
        constructor(mapWidth: number, mapHeight: number, terrain: Terrain) {
            super();
            this.#mapHeight = mapHeight;
            this.#mapWidth = mapWidth;
            this.#janitor = new Janitor();
            this.autoUpdate = false;
            this.hemilight = new HemisphereLight(0xffffff, 0xffffff, 1);
            this.sunlight = sunlight(this.#mapWidth, this.#mapHeight);
            this.hemilight.layers.enableAll();
            this.sunlight.layers.enableAll();
            this.hemilight.updateMatrixWorld();
            this.sunlight.updateMatrixWorld();
            this.add(this.hemilight);
            this.add(this.sunlight);
            this.addTerrain(terrain);
            this.#borderTiles = new Group();
            this.#borderTiles.layers.enable(Layers.Terrain);
            this.add(this.#borderTiles);
            // this.overrideMaterial = new MeshBasicMaterial({ color: "white" });
            const tx = terrain.userData.tilesX;
            const ty = terrain.userData.tilesY;
            const qw = terrain.userData.quartileWidth;
            const qh = terrain.userData.quartileHeight;
            const createMesh = (q: TerrainQuartile, edgeMaterial: Material) => {
                const mesh = new Mesh();
                mesh.geometry = q.geometry;
                mesh.material = edgeMaterial;
                mesh.position.copy(q.position);
                return mesh;
            };
            for (let i = 0; i < terrain.children.length; i++) {
                const q = terrain.children[i];
                const qx = q.userData.qx;
                const qy = q.userData.qy;
                const edgeMaterial = new MeshBasicMaterial({
                    map: q.material.map,
                    color: new Color(0x999999)
                });
                if (qx === 0 && qy === 0) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y + qh);
                    mesh.position.setX(mesh.position.x - qw);
                    mesh.scale.setY(-1);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qx === tx - 1 && qy === 0) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y + qh);
                    mesh.position.setX(mesh.position.x + qw);
                    mesh.scale.setY(-1);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qx === tx - 1 && qy === ty - 1) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y - qh);
                    mesh.position.setX(mesh.position.x + qw);
                    mesh.scale.setY(-1);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qx === 0 && qy === ty - 1) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y - qh);
                    mesh.position.setX(mesh.position.x - qw);
                    mesh.scale.setY(-1);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qy === 0) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y + qh);
                    mesh.scale.setY(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qx === 0) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setX(mesh.position.x - qw);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qy === ty - 1) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setY(mesh.position.y - qh);
                    mesh.scale.setY(-1);
                    this.#borderTiles.add(mesh);
                }
                if (qx === tx - 1) {
                    const mesh = createMesh(q, edgeMaterial);
                    mesh.position.setX(mesh.position.x + qw);
                    mesh.scale.setX(-1);
                    this.#borderTiles.add(mesh);
                }
            }
            this.#borderTiles.rotation.x = -Math.PI / 2;
            this.#borderTiles.updateMatrixWorld();
        }
        setBorderTileOpacity(opacity: number) {
            this.#borderTiles.children.forEach((mesh) => {
                ((mesh as Mesh).material as MeshBasicMaterial).opacity = opacity;
            });
        }
        addTerrain(terrain: Terrain) {
            this.userData.terrain = terrain;
            this.add(terrain);
            terrain.updateMatrixWorld();
        }
        replaceTerrain(terrain: Terrain) {
            disposeObject3D(this.userData.terrain);
            this.remove(this.userData.terrain);
            this.addTerrain(terrain);
        }
        get terrain() {
            return this.userData.terrain;
        }
        dispose() {
            this.#janitor.mopUp();
        }
    }
    export interface Assets {
        bwDat: BwDAT;
        grps: Atlas[];
        selectionCirclesHD: Atlas[];
        gameIcons: ResourceIcons;
        cmdIcons: string[];
        raceInsetIcons: RaceInsetIcons;
        workerIcons: WorkerIcons;
        arrowIcons: string[];
        hoverIcons: CenteredCursorIcons;
        dragIcons: CenteredCursorIcons;
        wireframeIcons: string[];
        envMap: Texture;
        loadAnim: (imageID: number, res: UnitTileScale) => Promise<void>;
        skyBox: CubeTexture;
    }
    export type PxToGameUnit = { x: (v: number) => number; y: (v: number) => number; xy: (x: number, y: number, out?: Vector2 | undefined) => void; xyz: (x: number, y: number, out?: Vector3 | undefined, zFunction?: ((x: number, y: number) => number) | undefined) => void; }
    export class FogOfWar {
        #openBW: OpenBWAPI;
        texture: DataTexture;
        effect: FogOfWarEffect;
        #buffer = new Uint8Array();
        forceInstantUpdate = false;
        enabled = true;
        constructor(width: number, height: number, openBw: OpenBWAPI, effect: FogOfWarEffect) {
            this.#openBW = openBw;
            const texture = new DataTexture(new Uint8ClampedArray(width * height), width, height, RedFormat, UnsignedByteType);
            texture.wrapS = ClampToEdgeWrapping;
            texture.wrapT = ClampToEdgeWrapping;
            texture.magFilter = LinearFilter;
            texture.minFilter = LinearFilter;
            texture.needsUpdate = true;
            this.texture = texture;
            this.effect = effect;
            this.effect.fog = this.texture;
            this.effect.fogResolution = new Vector2(this.texture.image.width, this.texture.image.height);
            this.effect.fogUvTransform = new Vector4(0.5, 0.5, 0.99 / this.texture.image.height, 0.99 / this.texture.image.width);
        }
        update(playerVision: number, camera: Camera, minimapFOWImage: ImageData) {
            const tilesize = this.#openBW.getFowSize();
            const ptr = this.#openBW.getFowPtr(playerVision, this.forceInstantUpdate);
            this.#buffer = this.#openBW.HEAPU8.subarray(ptr, ptr + tilesize);
            this.texture.image.data.set(this.#buffer);
            this.texture.needsUpdate = true;
            this.effect.projectionInverse.copy(camera.projectionMatrixInverse);
            this.effect.viewInverse.copy(camera.matrixWorld);
            this.forceInstantUpdate = false;
            for (let i = 0; i < tilesize; i = i + 1) {
                minimapFOWImage.data[i * 4 - 1] = Math.max(50, 255 - this.#buffer[i]);
            }
        }
        isVisible(x: number, y: number) {
            return this.#buffer[y * this.texture.image.width + x] > 55;
        }
        isExplored(x: number, y: number) {
            return this.#buffer[y * this.texture.image.width + x] > 0;
        }
        isSomewhatVisible(x: number, y: number) {
            return this.#buffer[y * this.texture.image.width + x] > 55;
        }
        isSomewhatExplored(x: number, y: number) {
            return this.#buffer[y * this.texture.image.width + x] > 0;
        }
    }
    export type GetTerrainY = (x: number, y: number) => number
    export class Terrain extends Group {
        override children: TerrainQuartile[] = [];
        override userData: {
            quartileWidth: number;
            quartileHeight: number;
            tilesX: number;
            tilesY: number;
        } = {
                quartileWidth: 0,
                quartileHeight: 0,
                tilesX: 0,
                tilesY: 0,
            };
        readonly getTerrainY: GetTerrainY;
        readonly geomOptions: GeometryOptions;
        constructor({ geomOptions, mapHeight, mapWidth, displacementImage }: {
            geomOptions: GeometryOptions;
            mapWidth: number;
            mapHeight: number;
            displacementImage: ImageData;
        }) {
            super();
            this.geomOptions = geomOptions;
            this.getTerrainY = getTerrainY(displacementImage, geomOptions.maxTerrainHeight, mapWidth, mapHeight);
        }
        set shadowsEnabled(val: boolean) {
            this.traverse(o => {
                if (o instanceof Mesh) {
                    o.castShadow = val;
                    o.receiveShadow = val;
                }
            });
        }
        #applyToMaterial(fn: (mat: MeshStandardMaterial) => void) {
            for (const c of this.children) {
                if (c instanceof Mesh) {
                    const material = c.material as MeshStandardMaterial;
                    fn(material);
                }
            }
        }
        setAnisotropy(anisotropy: string) {
            const value = anisotropyOptions[anisotropy as keyof typeof anisotropyOptions];
            this.#applyToMaterial(mat => {
                mat.map!.anisotropy = value;
            });
        }
        setBumpScale(value: number | null) {
            this.#applyToMaterial(mat => {
                mat.bumpScale = value ?? this.geomOptions.bumpScale;
            });
        }
        setHighDetailStyle(value: boolean) {
            this.setBumpScale(value ? this.geomOptions.bumpScale : null);
            this.shadowsEnabled = value;
            // TODO: other things
        }
    }
    export type ReplayHeader = { isBroodwar: number; gameName: string; mapName: string; gameType: number; gameSubtype: number; players: ReplayPlayer[]; frameCount: number; randomSeed: number; ancillary: { campaignId: number; commandByte: number; playerBytes: Buffer; unk1: number; playerName: Buffer; gameFlags: number; mapWidth: number; mapHeight: number; activePlayerCount: number; slotCount: number; gameSpeed: number; gameState: number; unk2: number; tileset: number; replayAutoSave: number; computerPlayerCount: number; unk3: number; unk4: number; unk5: number; unk6: number; victoryCondition: number; resourceType: number; useStandardUnitStats: number; fogOfWarEnabled: number; createInitialUnits: number; useFixedPositions: number; restrictionFlags: number; alliesEnabled: number; teamsEnabled: number; cheatsEnabled: number; tournamentMode: number; victoryConditionValue: number; startingMinerals: number; startingGas: number; unk7: number; }; }
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
    export class Surface {
        ctx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        #pixelRatio = 1;
        #width = 0;
        #height = 0;
        #bufferWidth = 0;
        #bufferHeight = 0;
        constructor(defaultCanvas?: HTMLCanvasElement) {
            const canvas = defaultCanvas || document.createElement("canvas");
            canvas.addEventListener('contextmenu', e => {
                e.preventDefault();
            });
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Could not get canvas context");
            }
            this.ctx = ctx;
            this.canvas = canvas;
        }
        setDimensions(width: number, height: number, pixelRatio = 1) {
            this.#pixelRatio = pixelRatio;
            this.#width = width;
            this.#height = height;
            this.#bufferWidth = Math.floor(this.#width * pixelRatio);
            this.#bufferHeight = Math.floor(this.#height * pixelRatio);
            this.canvas.width = this.#bufferWidth;
            this.canvas.height = this.#bufferHeight;
            this.canvas.style.width = `${width}px`;
            this.canvas.style.height = `${height}px`;
        }
        get aspect() {
            return this.width / this.height;
        }
        get width() {
            return this.#width;
        }
        get height() {
            return this.#height;
        }
        get bufferWidth() {
            return this.#bufferWidth;
        }
        get bufferHeight() {
            return this.#bufferHeight;
        }
        get pixelRatio() {
            return this.#pixelRatio;
        }
        getContext() {
            return this.canvas.getContext("2d");
        }
        dispose() {
            this.canvas.remove();
        }
    }
    export type SpriteRenderOptions = { unitScale: number; rotateSprites: boolean; }
    export type PostProcessingBundleDTO = { fogOfWarEffect: Effect; renderPass: Pass; effects: Effect[]; passes: Pass[]; }
    export class Janitor {
        private _objects = new Set<Object3D>();
        private _disposable = new Set<Disposable>();
        private _callbacks = new Set<EmptyFn>();
        constructor(dispose?: SupportedJanitorTypes) {
            if (dispose) {
                this.add(dispose);
            }
        }
        addEventListener(element: {
            addEventListener: Function;
            removeEventListener: Function;
        }, event: string, callback: Function, options?: AddEventListenerOptions) {
            element.addEventListener(event, callback, options);
            this.add(() => element.removeEventListener(event, callback));
            return this;
        }
        on(nodeEventListener: NodeJS.EventEmitter, event: string, callback: (...args: any[]) => void) {
            nodeEventListener.on(event, callback);
            this.add(() => nodeEventListener.off(event, callback));
        }
        setInterval(callback: EmptyFn, interval: number): NodeJS.Timeout {
            const _i = setInterval(callback, interval);
            this.add(() => clearInterval(_i));
            return _i;
        }
        add<T extends SupportedJanitorTypes>(obj: T): T {
            if (obj instanceof Object3D) {
                this.object3d(obj);
            }
            else if ("dispose" in obj) {
                this.disposable(obj);
            }
            else if (typeof obj === "function") {
                this.callback(obj);
            }
            else {
                throw new Error("Unsupported type");
            }
            return obj;
        }
        callback(callback: EmptyFn) {
            this._callbacks.add(callback);
        }
        disposable(obj: Disposable) {
            this._disposable.add(obj);
        }
        object3d(obj: THREE.Object3D) {
            this._objects.add(obj);
        }
        mopUp() {
            if (this._objects.size) {
                for (const obj of this._objects) {
                    disposeObject3D(obj);
                    obj.removeFromParent();
                }
                this._objects.clear();
            }
            if (this._callbacks.size) {
                for (const cb of this._callbacks) {
                    cb();
                }
                this._callbacks.clear();
            }
            if (this._disposable.size) {
                for (const disposable of this._disposable) {
                    disposable.dispose();
                }
                this._disposable.clear();
            }
        }
    }
    export class TerrainQuartile extends Mesh<BufferGeometry, MeshStandardMaterial> {
        override userData = {
            qx: 0,
            qy: 0
        };
    }
    export type Atlas = { type: "anim"; textureWidth: number; textureHeight: number; spriteWidth: number; spriteHeight: number; imageIndex: number; frames: AnimFrame[]; diffuse: Texture; teammask?: Texture | undefined; unitTileScale: number; grp: GrpSprite; hdLayers?: HDLayers | undefined; mipmap?: HDLayers | undefined; }
    export interface OpenBWAPI extends OpenBWWasm {
        running: boolean;
        files: OpenBWFileList;
        callbacks: {
            beforeFrame: () => void;
            afterFrame: () => void;
        };
        getFowSize: () => number;
        getFowPtr: (visibility: number, instant: boolean) => number;
        getTilesPtr: () => number;
        getTilesSize: () => number;
        getSoundObjects: () => SoundStruct[];
        getSpritesOnTileLineSize: () => number;
        getSpritesOnTileLineAddress: () => number;
        getUnitsAddr: () => number;
        getBulletsAddress: () => number;
        getBulletsDeletedCount: () => number;
        getBulletsDeletedAddress: () => number;
        getLinkedSpritesAddress: () => number;
        getLinkedSpritesCount: () => number;
        getSoundsAddress: () => number;
        getSoundsCount: () => number;
        setGameSpeed: (speed: number) => void;
        getGameSpeed: () => number;
        setCurrentFrame: (frame: number) => void;
        getCurrentFrame: () => number;
        isPaused: () => boolean;
        setPaused: (paused: boolean) => void;
        nextFrame: (debug: boolean) => number;
        tryCatch: (callback: () => void) => void;
        loadReplay: (buffer: Buffer) => void;
        start: (readFile: ReadFile) => void;
    }
    export class FogOfWarEffect extends Effect {
        constructor() {
            super("FogOfWarEffect", fragmentShader, {
                attributes: EffectAttribute.DEPTH,
                blendFunction: BlendFunction.ALPHA,
                uniforms: new Map([
                    ["fog", new Uniform(null)],
                    ["fogResolution", new Uniform(new Vector2())],
                    ["viewInverse", new Uniform(new Matrix4())],
                    ["projectionInverse", new Uniform(new Matrix4())],
                    ["color", new Uniform(new Color(0, 0, 0))],
                    ["fogUvTransform", new Uniform(new Vector4())],
                ]),
            });
        }
        get fog() {
            return this.uniforms.get("fog").value;
        }
        set fog(value) {
            this.uniforms.get("fog").value = value;
        }
        get fogResolution() {
            return this.uniforms.get("fogResolution").value;
        }
        set fogResolution(value) {
            this.uniforms.get("fogResolution").value = value;
        }
        get viewInverse() {
            return this.uniforms.get("viewInverse").value;
        }
        set viewInverse(value) {
            this.uniforms.get("viewInverse").value = value;
        }
        get projectionInverse() {
            return this.uniforms.get("projectionInverse").value;
        }
        set projectionInverse(value) {
            this.uniforms.get("projectionInverse").value = value;
        }
        get color() {
            return this.uniforms.get("color").value;
        }
        set color(value) {
            this.uniforms.get("color").value = value;
        }
        get fogUvTransform() {
            return this.uniforms.get("fogUvTransform").value;
        }
        set fogUvTransform(value) {
            this.uniforms.get("fogUvTransform").value = value;
        }
    }
    export type GeometryOptions = { elevationLevels: number[]; ignoreLevels: number[]; normalizeLevels: boolean; textureDetail: number; meshDetail: number; blendNonWalkableBase: boolean; firstPass: boolean; secondPass: boolean; processWater: boolean; maxTerrainHeight: number; drawMode: { value: number; }; detailsMix: number; bumpScale: number; firstBlur: number; }
    export interface FlingyStruct extends ThingyStruct {
        x: number;
        y: number;
        direction: number;
    }
    export type IscriptOperations = opGoto | opPlayFrame | opPlayframtile | opSetHorPos | opSetVertPos | opSetPos | opWait | opWaitRand | opSwitchUlt | opSetFlSpeed | opMove | opPowerupCondJmp | opSigOrder | opOrderDone | opSetSpawnFrame | opUflUnstable | op__0c | op__2d | op__3e | op__43 | opImgol | opImgul | opImgolUselo | opImgulUselo | opSprol | opHighSprol | opLowSprul | opSprulUselo | opSprul | opSprolUselo | opImgOlOrig | opSwitchUl | opEnd | opSetFlipState | opPlaySnd | opPlaySndRand | opPlaySndBtwn | opDoMissileDmg | opAttackMelee | opFollowMainGraphic | opRandCondJmp | opTurnCCWise | opTurnCWise | opTurn1CWise | opTurnRand | opAttackWith | opAttack | opCastSpell | opUseWeapon | opGotoRepeatAttk | opEngFrame | opEngSet | opNoBrkCodeStart | opNoBrkCodeEnd | opIgnoreRest | opTmprmGraphicStart | opTmprmGraphicEnd | opReturn | opAttkShiftProj | opSetFlDirect | opCall | opCreateGasOverlays | opTargetRangeCondJmp | opTargetArcCondJmp | opCurDirectCondJump | opImgulNextId | opLiftOffCondJmp | opWarpOverlay | opGrdSprol | opDoGrdDamage
    export interface Disposable {
        dispose: () => void;
    }
    export type EmptyFn = () => void
    export type SupportedJanitorTypes = Disposable | EmptyFn | Object3D<Event> | EventEmitter
    export type HDLayers = { brightness?: CompressedTexture | undefined; normal?: CompressedTexture | undefined; specular?: CompressedTexture | undefined; aoDepth?: CompressedTexture | undefined; emissive?: CompressedTexture | undefined; }
    // A wrapper around file buffers that openbw wasm needs
    export class OpenBWFileList {
        private buffers: Int8Array[] = [];
        private index: Record<string, number> = {};
        unused: number[] = [];
        private _cleared = false;
        normalize(path: string) {
            return path.toLowerCase().replace(/\//g, "\\");
        }
        constructor(openBw: any, callbacks: Callbacks) {
            openBw.setupCallbacks({
                js_fatal_error: (ptr: any) => {
                    throw new Error(openBw.UTF8ToString(ptr));
                },
                js_pre_main_loop: callbacks.beforeFrame,
                js_post_main_loop: callbacks.afterFrame,
                js_file_size: (index: number) => {
                    return this.buffers[index].byteLength; // get file size: ;
                },
                js_read_data: (index: number, dst: number, offset: number, size: number) => {
                    var data = this.buffers[index];
                    for (var i2 = 0; i2 != size; ++i2) {
                        openBw.HEAP8[dst + i2] = data[offset + i2];
                    }
                },
                js_load_done: () => {
                    this.clear(); // done loading, openbw has its own memory now
                    log.verbose("@openbw-filelist: complete");
                    log.verbose(`@openbw-filelist: ${this.unused.length} unused assets`);
                },
                js_file_index: (ptr: any) => {
                    const filepath = openBw.UTF8ToString(ptr);
                    if (filepath === undefined) {
                        throw new Error("Filename is undefined");
                    }
                    const index = this.index[this.normalize(filepath)];
                    this.unused.splice(this.unused.indexOf(index), 1);
                    return index >= 0 ? index : 9999;
                }
            });
        }
        async loadBuffers(readFile: (filename: string) => Promise<Buffer | Uint8Array>) {
            if (this._cleared) {
                throw new Error("File list already cleared");
            }
            for (const filepath of filepaths) {
                const buffer = await readFile(filepath);
                let int8 = new Int8Array();
                if (settingsStore().isCascStorage) {
                    //FIXME: why is casclib returning unit8array?
                    int8 = Int8Array.from(buffer.subarray(0, buffer.byteLength / 8));
                }
                else {
                    int8 = new Int8Array(buffer.buffer, buffer.byteOffset, buffer.length);
                }
                this.buffers.push(int8);
                this.index[this.normalize(filepath)] = this.buffers.length - 1;
                this.unused.push(this.buffers.length - 1);
            }
        }
        // utility
        async dumpFileList() {
            const paths: string[] = [];
            for (const filename of filelist) {
                const _paths = (await findFiles(filename)).filter((n: string) => !n.includes("Carbot"));
                paths.push(..._paths);
            }
            fs.writeFileSync("filelist.json", ["export default", JSON.stringify(paths)].join(" "));
        }
        clear() {
            this.buffers = [];
            this._cleared = true;
        }
    }
    export interface SoundStruct {
        typeId: number;
        unitTypeId: number | null;
        x: number;
        y: number;
        volume?: number;
        pan?: number;
    }
    export type ReadFile = (filename: string) => Promise<Buffer>
    export interface OpenBWWasm {
        _reset: () => void;
        _load_replay: (buffer: number, length: number) => void;
        _next_frame: () => number;
        _counts: (index: number) => number;
        _get_buffer: (index: number) => number;
        _replay_get_value: (index: number) => number;
        _replay_set_value: (index: number, value: number) => void;
        _get_fow_ptr: (visiblity: number, instant: boolean) => number;
        get_util_funcs: () => ({
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
        });
        callMain: () => void;
        HEAP8: Int8Array;
        HEAPU8: Uint8Array;
        HEAP16: Int16Array;
        HEAPU16: Uint16Array;
        HEAP32: Int32Array;
        HEAPU32: Uint32Array;
        getExceptionMessage: (e: unknown) => string;
        allocate: (buffer: ArrayBuffer, flags: number) => number;
        _free: (buffer: number) => void;
        ALLOC_NORMAL: number;
    }
    export interface ThingyStruct {
        hp: number;
        /**
         * @internal
         */
        owSprite: SpritesBufferView;
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
    export interface Callbacks {
        beforeFrame: () => void;
        afterFrame: () => void;
    }
    export type opArgOne = [number]
    export type opArgTwo = [number, number]
    export type opArgNone = []
    export type opArgThree = [number, number, number]

}