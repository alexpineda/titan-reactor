import { Assets, OpenBW, SessionSettingsData, UnitTileScale } from "common/types";
import { Macros } from "@macros";
import settingsStore, { useSettingsStore } from "../stores/settings-store";
import Janitor from "@utils/janitor";
import { createPluginSession } from "@plugins/create-plugin-session";
import { PluginSystemNative, SceneController } from "@plugins/plugin-system-native";
import { createReactiveSessionVariables } from "@stores/session/reactive-session-variables";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { CLEAR_ASSET_CACHE, SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { createCompartment } from "@utils/ses-util";
import { HOOK_ON_SCENE_READY, HOOK_ON_UNITS_SELECTED, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED } from "@plugins/hooks";
import { mix } from "@utils/object-utils";
import { GameTimeApi } from "./game-time-api";
import { chkToTerrainMesh, TerrainExtra } from "@image/generate-map/chk-to-terrain-mesh";
import Chk from "bw-chk";
import { Terrain } from "@core/terrain";
import BaseScene from "@render/base-scene";
import { UnitEntities } from "./unit-entities";
import { SpriteEntities } from "./sprite-entities";
import { ImageEntities } from "./image-entities";
import { SimpleText } from "@render/simple-text";
import { Surface } from "@image/canvas";
import MinimapMouse from "@input/minimap-mouse";
import { CameraMouse } from "@input/camera-mouse";
import { CameraKeys } from "@input/camera-keys";
import { makePxToWorld, PxToWorld } from "common/utils/conversions";
import { CssScene } from "../scenes/game-scene/css-scene";
import { SoundChannels } from "@audio/sound-channels";
import GameSurface from "@render/game-surface";
import { createSandboxApi, SandboxAPI } from "@openbw/sandbox-api";
import gameStore from "@stores/game-store";
import { createUnitSelectionBox } from "@input/create-unit-selection";
import { Object3D } from "three";
import { Unit } from "@core/unit";
import { ImageHD } from "@core/image-hd";
import { Image3D } from "@core/image-3d";
import { canSelectUnit } from "@utils/unit-utils";
import { IterableSet } from "@utils/iterable-set";

export type Session = {

    onFrame: (
        currentFrame: number,
        commands: any[]
    ) => void;
    onBeforeRender: (delta: number,
        elapsed: number) => void;
    onRender: (delta: number, elapsed: number) => void;
    sessionApi: ReturnType<typeof createReactiveSessionVariables>,
    dispose: () => void;
    getSceneInputHandler: (name: string) => SceneController | undefined;
    callHook: (
        ...args: Parameters<PluginSystemNative["callHook"]>) => void;
    callHookAsync: (
        ...args: Parameters<PluginSystemNative["callHookAsync"]>
    ) => Promise<void>,
    initializeContainer(gameTimeApi: GameTimeApi): void;
    onEnterScene(sceneController: SceneController): void;
    onExitScene(sceneController: string | undefined): void;
    onSceneReady(): Promise<void>;
    reloadPlugins: () => Promise<void>;
    terrain: Terrain;
    terrainExtra: TerrainExtra;
    units: UnitEntities;
    selectedUnits: IterableSet<Unit>;
    unitSelectionBox: ReturnType<typeof createUnitSelectionBox>
    sprites: SpriteEntities;
    images: ImageEntities;
    scene: BaseScene;
    simpleText: SimpleText;
    pxToWorld: PxToWorld;
    minimapMouse: MinimapMouse;
    cameraMouse: CameraMouse;
    cameraKeys: CameraKeys;
    cssScene: CssScene;
    soundChannels: SoundChannels;
    gameSurface: GameSurface;
    minimapSurface: Surface;
    sandboxApi: SandboxAPI;
}

export type SessionStore = SessionSettingsData;

/**
 * Creates a session for a game.
 * Assembles all objects interacting with OpenBW and input/output this includes:
 * Plugins, Macros, THREE Scene Objects, Sounds, Input Handlers, etc.
 */
export const createSession = async (openBW: OpenBW, assets: Assets, map: Chk): Promise<Session> => {

    const janitor = new Janitor();

    // available to plugins, macros, and sandbox
    const sessionApi = janitor.mop(createReactiveSessionVariables());

    // configure macro system
    const macros = new Macros();
    macros.deserialize(settingsStore().data.macros);

    janitor.mop(macros.listenForKeyCombos());

    macros.doSessionAction = sessionApi.doAction;
    macros.getSessionProperty = sessionApi.getRawValue;


    janitor.on(ipcRenderer, SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => {
        macros.execMacroById(macroId);
    });

    // a macro was triggered manually or via web server
    janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
        type: SendWindowActionType.ManualMacroTrigger,
        payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
    }) => {
        if (type === SendWindowActionType.ManualMacroTrigger) {
            macros.execMacroById(payload);
        }
    });

    useSettingsStore.subscribe((settings) => {

        if (settings.data.macros.revision !== macros.revision) {

            macros.deserialize(settings.data.macros);

        }

    })

    let plugins = await createPluginSession(macros);


    const { terrain, terrainExtra } = await chkToTerrainMesh(
        map, UnitTileScale.HD,
    );

    janitor.mop(terrain);

    openBW.uploadHeightMap(terrainExtra.heightMaps.singleChannel, terrainExtra.heightMaps.displacementImage.width, terrainExtra.heightMaps.displacementImage.height);

    openBW.setGameSpeed(1);
    openBW.setPaused(false);


    const scene = janitor.mop(new BaseScene(map.size[0], map.size[1], terrain));

    scene.background = assets.skyBox;
    scene.environment = assets.envMap;



    const _getSelectionUnit = (object: Object3D): Unit | null => {

        if (object instanceof ImageHD || object instanceof Image3D) {
            return canSelectUnit(images.getUnit(object));
        } else if (object.parent) {
            return _getSelectionUnit(object.parent);
        }

        return null;

    };

    const followedUnits = new IterableSet<Unit>();
    const selectedUnits = new IterableSet<Unit>();

    const unitSelectionBox = createUnitSelectionBox(scene, selectedUnits, {
        onGetUnit: _getSelectionUnit
    });

    selectedUnits.externalOnChange = (units) => {
        plugins.nativePlugins.callHook(HOOK_ON_UNITS_SELECTED, units);
        plugins.uiPlugins.onUnitsSelected(units);
    }

    const units = new UnitEntities();
    //TODO: clear units hook
    units.externalOnClearUnits = () => {
        selectedUnits.clear();
        followedUnits.clear();
    };
    units.externalOnCreateUnit = (unit) => plugins.nativePlugins.callHook(HOOK_ON_UNIT_CREATED, unit);
    //TODO: killed vs destroyed
    units.externalOnFreeUnit = (unit) => {
        plugins.nativePlugins.callHook(HOOK_ON_UNIT_KILLED, unit);
        selectedUnits.delete(unit);
        followedUnits.delete(unit);
    }


    const sprites = new SpriteEntities();
    scene.add(sprites.group);

    const images = janitor.mop(new ImageEntities());
    janitor.on(ipcRenderer, CLEAR_ASSET_CACHE, () => {
        assets.resetAssetCache();
        images.dispose();
        // reset = refreshScene;
    });


    const soundChannels = new SoundChannels();

    const [mapWidth, mapHeight] = map.size;

    const cssScene = new CssScene;

    const gameSurface = janitor.mop(new GameSurface(mapWidth, mapHeight));
    gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);
    janitor.mop(document.body.appendChild(gameSurface.canvas));
    gameStore().setDimensions(gameSurface.getMinimapDimensions(settingsStore().data.game.minimapSize));

    const minimapSurface = janitor.mop(new Surface({
        position: "absolute",
        bottom: "0",
        zIndex: "20"
    }));

    janitor.mop(document.body.appendChild(minimapSurface.canvas));

    const simpleText = janitor.mop(new SimpleText());
    const pxToWorld = makePxToWorld(mapWidth, mapHeight, terrain.getTerrainY);

    const minimapMouse = janitor.mop(new MinimapMouse(
        minimapSurface,
        mapWidth,
        mapHeight,
    ));

    janitor.addEventListener(minimapSurface.canvas, "mousedown", () => {
        followedUnits.clear();
    });


    const cameraMouse = janitor.mop(new CameraMouse(document.body));


    //TODO: re-implement as macro
    // () => {
    //     if (hasFollowedUnits()) {
    //         clearFollowedUnits();
    //     } else if (selectedUnits.length) {
    //         followUnits(selectedUnits);
    //     }
    // }

    janitor.mop(unitSelectionBox.listen(gameSurface, minimapSurface));

    const cameraKeys = janitor.mop(new CameraKeys(document.body));

    const sandboxApi = createSandboxApi(openBW, makePxToWorld(scene.mapWidth, scene.mapHeight, terrain.getTerrainY, true));


    return {
        sessionApi,
        sandboxApi,
        terrain,
        terrainExtra,
        images,
        sprites,
        units,
        selectedUnits,
        unitSelectionBox,
        scene,
        simpleText,
        pxToWorld,
        minimapMouse,
        cameraMouse,
        cameraKeys,
        soundChannels,
        cssScene,
        gameSurface,
        minimapSurface,
        dispose: () => {
            plugins.dispose();
            janitor.dispose()
        },
        onFrame: (
            currentFrame: number,
            commands: any[]
        ) => {

            plugins.uiPlugins.onFrame(openBW, currentFrame, openBW._get_buffer(8), openBW._get_buffer(9), selectedUnits.values());
            plugins.nativePlugins.hook_onFrame(
                currentFrame,
                commands
            );

        },
        onBeforeRender: (
            delta: number,
            elapsed: number,
        ) => {
            plugins.nativePlugins.hook_onBeforeRender(delta, elapsed);
        },
        onRender: (delta: number, elapsed: number) => {
            plugins.nativePlugins.hook_onRender(delta, elapsed);
        },
        onEnterScene(sceneController) {
            plugins.nativePlugins.setActiveSceneController(sceneController);
        },
        onExitScene(sceneController) {
            macros.callFromHook("onExitScene", sceneController);
        },
        async onSceneReady() {
            await plugins.nativePlugins.callHookAsync(HOOK_ON_SCENE_READY);
        },
        getSceneInputHandler: (name: string) => {
            return plugins.nativePlugins.getSceneInputHandlers().find((handler) => handler.name === name);
        },
        callHook: (
            ...args: Parameters<PluginSystemNative["callHook"]>
        ) => {
            plugins.nativePlugins.callHook(...args);
        },
        callHookAsync: async (
            ...args: Parameters<PluginSystemNative["callHookAsync"]>
        ) => {
            await plugins.nativePlugins.callHookAsync(...args);
        },
        initializeContainer(gameTimeApi: GameTimeApi) {

            const safeAPI = mix({ settings: sessionApi.sessionVars }, gameTimeApi);

            // unsafe api additionally allows access to plugin configurations
            // which is not allowed WITHIN plugins since they are 3rd party, but ok in user macros and sandbox
            const unSafeAPI = mix({ plugins: plugins.reactiveApi.pluginVars, settings: sessionApi.sessionVars }, gameTimeApi);

            const container = createCompartment(unSafeAPI);
            macros.setCreateCompartment((context?: any) => {
                container.globalThis.context = context;
                return container;
            });

            plugins.nativePlugins.injectApi(safeAPI);

        },
        async reloadPlugins() {
            plugins.dispose();
            plugins = await createPluginSession(macros);
        }
    };
};
