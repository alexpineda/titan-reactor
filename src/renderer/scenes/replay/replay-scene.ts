import { debounce } from "lodash";
import { Color, Group, MathUtils, PerspectiveCamera, Vector2, Vector3, Scene as ThreeScene, Scene } from "three";
import { easeCubicIn } from "d3-ease";
import type Chk from "bw-chk";
import { mixer } from "@audio"

import { BulletState, DamageType, drawFunctions, Explosion, imageTypes, orders, UnitFlags, unitTypes, WeaponType } from "common/enums";
import { Surface } from "@image";
import {
  UnitDAT, WeaponDAT, UpgradeDAT, TechDataDAT, SoundDAT, SpriteType, DeepPartial, SettingsMeta, PxToGameUnit
} from "common/types";
import { pxToMapMeter, floor32 } from "common/utils/conversions";
import { SpriteStruct, ImageStruct, UnitTileScale } from "common/types";
import type { Music, SoundChannels } from "@audio";

import {
  ImageBase,
  Players,
  Unit,
  ImageHD, Creep, FogOfWar, FogOfWarEffect, Image3D
} from "@core";

import {
  MinimapMouse, CameraMouse, CameraKeys
} from "@input";
import { getOpenBW } from "@openbw";

import { ImageBufferView, SpritesBufferView, TilesBufferView, IntrusiveList, UnitsBufferView, BulletsBufferView, StdVector } from "@buffer-view";
import * as log from "@ipc/log";

import {
  GameSurface, Layers, renderComposer, SimpleText, BaseScene
} from "@render";
import { CSS2DRenderer } from "@render/css-renderer";

import {
  useWorldStore,
} from "@stores";
import { imageHasDirectionalFrames, imageIsDoodad, imageIsFlipped, imageIsFrozen, imageIsHidden, imageNeedsRedraw, isGltfAtlas } from "@utils/image-utils";
import { getBwPanning, getBwVolume, MinPlayVolume as SoundPlayMinVolume } from "@utils/sound-utils";
import { spriteIsHidden, spriteSortOrder, updateSpritesForViewport } from "@utils/sprite-utils";
import { applyCameraDirectionToImageFrame, getDirection32 } from "@utils/camera-utils";

import Janitor from "@utils/janitor";

import { WeaponBehavior } from "common/enums";
import gameStore from "@stores/game-store";
import * as plugins from "@plugins";
import settingsStore, { useSettingsStore } from "@stores/settings-store";
import { Assets } from "common/types/assets";
import { Replay } from "@process-replay/parse-replay";
import CommandsStream from "@process-replay/commands/commands-stream";
import { HOOK_ON_FRAME_RESET, HOOK_ON_SCENE_READY, HOOK_ON_UNIT_CREATED, HOOK_ON_UNIT_KILLED, HOOK_ON_UPGRADE_COMPLETED, HOOK_ON_TECH_COMPLETED, HOOK_ON_UNITS_SELECTED } from "@plugins/hooks";
import { getAngle, unitIsFlying } from "@utils/unit-utils";
import { ipcRenderer, IpcRendererEvent } from "electron";
import { RELOAD_PLUGINS, SEND_BROWSER_WINDOW, SERVER_API_FIRE_MACRO } from "common/ipc-handle-names";
import selectedUnitsStore, { selectionObjects, updateSelectionGraphics, useSelectedUnitsStore } from "@stores/selected-units-store";
import FadingPointers from "@image/fading-pointers";
import { IndexedObjectPool } from "@utils/indexed-object-pool";
import range from "common/utils/range";
import { getPixelRatio, updatePostProcessingCamera } from "@utils/renderer-utils";
import { Macros } from "@macros/macros";
import { createCompartment } from "@utils/ses-util";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { EffectPass, RenderPass } from "postprocessing";
import { drawMinimap } from "@render/draw-minimap";
import { SendWindowActionPayload, SendWindowActionType } from "@ipc/relay";
import { createSession } from "@stores/session-store";
import { diff } from "deep-diff";
import set from "lodash.set";
import { Terrain } from "@core/terrain";
import { TerrainExtra } from "@image/generate-map/chk-to-terrain-mesh";
import { SceneState } from "../scene";
import { GameViewPort } from "../../camera/game-viewport";
import { GetTerrainY } from "@image/generate-map";
import { ReplayHeader, ReplayPlayer } from "@process-replay/parse-replay-header";

const { startLocation } = unitTypes;
const white = new Color(0xffffff);

export interface GameTimeApi {
  type: "replay",
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
  setPlayerNames(names: { name: string, id: number }[]): void;
  getOriginalNames(): { name: string, id: number }[];
  getPlayers(): ReplayPlayer[];
  replay: ReplayHeader;
  readonly followedUnitsPosition: Vector3 | undefined | null;
  selectUnits(units: number[]): void;
  selectedUnits: Unit[];
  playSound(typeId: number, volumeOrX?: number, y?: number, unitTypeId?: number): void;
  togglePointerLock(val: boolean): void;
  readonly pointerLockLost: boolean;
  mouseCursor: boolean;
  minimap: {
    enabled: boolean;
    scale: number;
  }
}
async function TitanReactorGame(
  map: Chk,
  terrain: Terrain,
  terrainExtra: TerrainExtra,
  scene: BaseScene,
  assets: Assets,
  janitor: Janitor,
  replay: Replay,
  soundChannels: SoundChannels,
  music: Music,
  commandsStream: CommandsStream
): Promise<SceneState> {
  const session = createSession();

  const preplacedMapUnits = map.units;
  const bwDat = assets.bwDat;

  const openBW = await getOpenBW();
  openBW.setGameSpeed(1);
  openBW.setPaused(false);

  selectedUnitsStore().clearSelectedUnits();

  enum UpgradeHDImageStatus {
    Loading,
    Loaded,
  }

  const _upgradeHDImageQueue = new Map<number, UpgradeHDImageStatus>();
  const createImage = (imageTypeId: number) => {
    const atlas = assets.grps[imageTypeId];
    if (!atlas) {
      // schedule properly
      assets.loadImageAtlas(imageTypeId, UnitTileScale.HD2);
      _upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loading);
      requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
        _upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
      }));
      return;
    } else {
      if (atlas.unitTileScale === UnitTileScale.HD2 && !_upgradeHDImageQueue.has(imageTypeId)) {
        requestIdleCallback(() => assets.loadImageAtlas(imageTypeId, UnitTileScale.HD).then(() => {
          _upgradeHDImageQueue.set(imageTypeId, UpgradeHDImageStatus.Loaded);
        }));
      }
    }

    const imageDef = bwDat.images[imageTypeId];

    freeImages.get(imageTypeId);
    // const freeImage = freeImages.get(imageTypeId);
    // if (freeImage) {
    //   freeImage.changeImage(atlas, imageDef);
    //   return freeImage;
    // }
    if (isGltfAtlas(atlas)) {
      return new Image3D(atlas, imageDef)
    } else {
      return new ImageHD(
        atlas,
        imageDef
      );
    }
  }

  const mapWidth = map.size[0];
  const mapHeight = map.size[1];

  const cssScene = new ThreeScene();
  const cssRenderer = new CSS2DRenderer();
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.pointerEvents = 'none';
  cssRenderer.domElement.style.top = '0px';
  cssRenderer.domElement.style.left = '0px';
  cssRenderer.domElement.style.zIndex = '100';
  document.body.appendChild(cssRenderer.domElement);
  janitor.callback(() => document.body.removeChild(cssRenderer.domElement));

  terrain.setAnisotropy(session.getState().graphics.anisotropy);
  terrainExtra.setCreepAnisotropy(session.getState().graphics.anisotropy);

  const gameSurface = new GameSurface(mapWidth, mapHeight);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight, getPixelRatio(session.getState().graphics.pixelRatio));
  document.body.appendChild(gameSurface.canvas);
  gameStore().setDimensions(gameSurface.getMinimapDimensions(session.getState().game.minimapSize));
  janitor.add(gameSurface);

  const minimapSurface = new Surface();
  minimapSurface.canvas.style.position = "absolute";
  minimapSurface.canvas.style.bottom = "0";
  minimapSurface.canvas.style.zIndex = "20";
  document.body.appendChild(minimapSurface.canvas);
  janitor.add(minimapSurface);

  const simpleText = new SimpleText();
  janitor.add(simpleText);

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const minimapMouse = new MinimapMouse(
    minimapSurface,
    mapWidth,
    mapHeight,
    () => {
      clearFollowedUnits();
    }
  );
  janitor.disposable(minimapMouse);

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  let followedUnits: Unit[] = [];
  let _followedUnitsPosition = new Vector3();
  const followUnits = (units: Unit[]) => {
    followedUnits = [...units];
  }

  const unfollowUnit = (unit: Unit) => {
    const idx = followedUnits.indexOf(unit);
    if (idx > -1) {
      followedUnits.splice(idx, 1);
    }
  }

  const clearFollowedUnits = () => {
    if (followedUnits.length > 0) {
      followedUnits.length = 0;
    }
  }
  const calculateFollowedUnitsTarget = debounce(() => {
    if (followedUnits.length === 0) {
      return;
    }

    _followedUnitsPosition.set(pxToGameUnit.x(followedUnits[0].x), 0, pxToGameUnit.y(followedUnits[0].y));

    for (let i = 1; i < followedUnits.length; i++) {
      _followedUnitsPosition.set(
        (_followedUnitsPosition.x + pxToGameUnit.x(followedUnits[i].x)) / 2,
        0,
        (_followedUnitsPosition.z + pxToGameUnit.y(followedUnits[i].y)) / 2
      )
    }
    return _followedUnitsPosition;
  }, 30);

  const cameraMouse = new CameraMouse(document.body);
  janitor.disposable(cameraMouse);

  const cameraKeys = new CameraKeys(document.body, () => {
    if (followedUnits.length) {
      clearFollowedUnits();
    } else if (selectedUnitsStore().selectedUnits.length) {
      followUnits(selectedUnitsStore().selectedUnits);
    }
  });
  janitor.disposable(cameraKeys);

  const units: Map<number, Unit> = new Map();
  const images: Map<number, ImageBase> = new Map();
  const freeImages = new IndexedObjectPool<ImageBase>();
  const unitsBySprite: Map<number, Unit> = new Map();
  const sprites: Map<number, SpriteType> = new Map();
  const spritesGroup = new Group();
  spritesGroup.name = "sprites";
  scene.add(spritesGroup);

  janitor.callback(() => {
    const _janitor = new Janitor();
    for (const image of freeImages.all()) {
      _janitor.object3d(image);
    }
    _janitor.mopUp();
  });

  const macros = new Macros(session);
  macros.deserialize(settingsStore().data.macros);

  const fogOfWarEffect = new FogOfWarEffect();
  const fogOfWar = new FogOfWar(mapWidth, mapHeight, openBW, fogOfWarEffect);
  const renderPass = new RenderPass(scene, new PerspectiveCamera());

  const gameViewportsDirector = new GameViewportsDirector(scene, gameSurface, minimapSurface, {
    fogOfWarEffect,
    renderPass,
    effects: [fogOfWarEffect],
    passes: [renderPass, new EffectPass(new PerspectiveCamera(), fogOfWarEffect)],
  },
    macros
  );
  janitor.add(gameViewportsDirector);

  gameViewportsDirector.beforeActivate = () => {
    gameTimeApi.minimap.enabled = true;
    gameTimeApi.minimap.scale = 1;
  }

  gameViewportsDirector.onActivate = (inputHandler) => {
    const rect = gameSurface.getMinimapDimensions(session.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: gameTimeApi.minimap.enabled === true ? rect.minimapHeight : 0,
    });

    if (!inputHandler.gameOptions.allowUnitSelection) {
      selectedUnitsStore().clearSelectedUnits();
    }

    plugins.setActiveInputHandler(inputHandler);

    // TODO: move rendering configuration to better settings other than rotateSprites
    // Do all render differences here?
    terrain.setHighDetailStyle(gameViewportsDirector.viewports[0].spriteRenderOptions.rotateSprites);
    scene.sunlight.shadow.needsUpdate = true;
    renderComposer.getWebGLRenderer().shadowMap.needsUpdate = true;

  }

  const gameTimeApi = ((): GameTimeApi => {
    const toggleFogOfWarByPlayerId = (playerId: number) => {
      const player = players.find(p => p.id === playerId);
      if (player) {
        player.vision = !player.vision;
        fogOfWar.forceInstantUpdate = true;
      }
    }

    const setPlayerColors = (colors: string[]) => {
      const replay = useWorldStore.getState().replay;

      if (replay) {
        replay.header.players.forEach((player, i) => {
          player.color = colors[i];
        });
        useWorldStore.setState({ replay: { ...replay } })
      }
    }

    const getOriginalColors = () => [...originalColors];

    const setPlayerNames = (players: { name: string, id: number }[]) => {
      const replay = useWorldStore.getState().replay;

      if (replay) {
        for (const player of players) {
          const replayPlayer = replay.header.players.find(p => p.id === player.id);
          if (replayPlayer) {
            replayPlayer.name = player.name;
          }
        }
        useWorldStore.setState({ replay: { ...replay } })
      }
    }

    const getOriginalNames = () => [...originalNames];

    const skipHandler = (dir: number, gameSeconds = 200) => {
      if (reset) return;
      const currentFrame = openBW.getCurrentFrame();
      openBW.setCurrentFrame(currentFrame + gameSeconds * 42 * dir);
      currentBwFrame = openBW.getCurrentFrame();
      reset = refreshScene;
      return currentBwFrame;
    }

    enum ChangeSpeedDirection {
      Up,
      Down
    }

    const MIN_SPEED = 0.25;
    const MAX_SPEED = 16;
    const speedHandler = (direction: ChangeSpeedDirection) => {
      const currentSpeed = openBW.getGameSpeed();
      let newSpeed = 0;

      // smaller increments/decrements between 1 & 2
      if (direction === ChangeSpeedDirection.Up && currentSpeed >= 1 && currentSpeed < 2) {
        newSpeed = currentSpeed + MIN_SPEED;
      } else if (direction === ChangeSpeedDirection.Down && currentSpeed <= 2 && currentSpeed > 1) {
        newSpeed = currentSpeed - MIN_SPEED;
      } else {
        newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, currentSpeed * (ChangeSpeedDirection.Up === direction ? 2 : 0.5)));
      }

      openBW.setGameSpeed(newSpeed);
      return openBW.getGameSpeed();
    }

    return {
      type: "replay",
      get viewport() {
        return gameViewportsDirector.primaryViewport;
      },
      get secondViewport() {
        return gameViewportsDirector.viewports[1];
      },
      get viewports() {
        return gameViewportsDirector.viewports;
      },
      simpleMessage(val: string) {
        console.log("simpleMessage", val);
        simpleText.set(val);
      },
      scene,
      cssScene,
      assets,
      toggleFogOfWarByPlayerId,
      unitsIterator,
      skipForward: (amount = 1) => skipHandler(1, amount),
      skipBackward: (amount = 1) => skipHandler(-1, amount),
      speedUp: () => speedHandler(ChangeSpeedDirection.Up),
      speedDown: () => speedHandler(ChangeSpeedDirection.Down),
      togglePause: (setPaused?: boolean) => {
        openBW.setPaused(setPaused ?? !openBW.isPaused());
        return openBW.isPaused();
      },
      get gameSpeed() {
        return openBW.getGameSpeed();
      },
      setGameSpeed(value: number) {
        openBW.setGameSpeed(MathUtils.clamp(value, MIN_SPEED, MAX_SPEED));
      },
      refreshScene: () => {
        reset = refreshScene;
      },
      pxToGameUnit,
      fogOfWar,
      mapWidth,
      mapHeight,
      tileset: map.tileset,
      tilesetName: map.tilesetName,
      getTerrainY: terrain.getTerrainY,
      get terrain() {
        return terrain;
      },
      get currentFrame() {
        return currentBwFrame;
      },
      get maxFrame() {
        return replay.header.frameCount
      },
      gotoFrame: (frame: number) => {
        openBW.setCurrentFrame(frame);
        reset = refreshScene;
      },
      exitScene: () => {
        gameViewportsDirector.activate(plugins.getSceneInputHandler(settingsStore().data.game.sceneController)!);
      },
      setPlayerColors,
      getPlayerColor: (id: number) => {
        return players.get(id)?.color ?? new Color(1, 1, 1);
      },
      getOriginalColors,
      setPlayerNames,
      getOriginalNames,
      getPlayers: () => [...replay.header.players.map(p => ({ ...p }))],
      get replay() { return { ...replay.header, players: [...replay.header.players.map(p => ({ ...p }))] } },
      get followedUnitsPosition() {
        if (followedUnits.length === 0) {
          return null;
        }
        return calculateFollowedUnitsTarget();
      },
      selectUnits: (ids: number[]) => {
        const selection = [];
        for (const id of ids) {
          const unit = units.get(id);
          if (unit) {
            selection.push(unit);
          }
        }
        selectedUnitsStore().setSelectedUnits(selection);
      },
      get selectedUnits() {
        return selectedUnitsStore().selectedUnits
      },
      // fadingPointers,
      playSound: (typeId: number, volumeOrX?: number, y?: number, unitTypeId = -1) => {
        if (y !== undefined && volumeOrX !== undefined) {
          buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId);
        } else {
          soundChannels.playGlobal(typeId, volumeOrX);
        }
      },
      togglePointerLock: (val: boolean) => {
        gameSurface.togglePointerLock(val);
      },
      get pointerLockLost() {
        return gameSurface.pointerLockLost;
      },
      get mouseCursor() {
        return gameViewportsDirector.mouseCursor;
      },
      set mouseCursor(val: boolean) {
        gameViewportsDirector.mouseCursor = val;
      },
      minimap: {
        get enabled() {
          return minimapSurface.canvas.style.display === "block";
        },
        set enabled(value: boolean) {
          minimapSurface.canvas.style.display = value ? "block" : "none";
          if (value) {
            minimapSurface.canvas.style.pointerEvents = "auto";
          }
        },
        set scale(value: number) {
          session.getState().merge({ game: { minimapSize: value } });
        }
      }
    }
  })();

  const makeThreeColors = (replay: Replay) => {
    return replay.header.players.map(
      ({ color }) =>
        new Color().setStyle(color).convertSRGBToLinear()
    );
  }

  janitor.callback(useWorldStore.subscribe(world => {
    if (world.replay) {
      const colors = makeThreeColors(world.replay);
      for (let i = 0; i < players.length; i++) {
        players[i].color = colors[i];
      }
    }
  }));

  const players = new Players(
    replay.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    makeThreeColors(replay)
  );

  music.playGame();

  let reset: (() => void) | null = null;
  let _wasReset = false;

  const refreshScene = () => {
    images.clear();
    units.clear();
    unitsBySprite.clear();
    sprites.clear();
    cmds = commandsStream.generate();
    cmd = cmds.next();
    selectedUnitsStore().clearSelectedUnits();
    clearFollowedUnits();
    fadingPointers.clear();

    const frame = openBW.getCurrentFrame();

    // remove any upgrade or tech that is no longer available
    for (let player = 0; player < 8; player++) {
      completedResearchReset[player] = completedResearchReset[player].filter(([_, techFrame]) => techFrame <= frame);
      completedResearch[player] = completedResearch.map(([techId]) => techId);
      completedUpgradesReset[player] = completedUpgradesReset[player].filter(([_, techFrame]) => techFrame <= frame);
      completedUpgrades[player] = completedUpgrades.map(([techId]) => techId);
    }

    plugins.callHook(HOOK_ON_FRAME_RESET, frame);
    previousBwFrame = -1;
    reset = null;
    _wasReset = true;
  }



  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight, getPixelRatio(session.getState().graphics.pixelRatio));

    const rect = gameSurface.getMinimapDimensions(session.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: minimapSurface.canvas.style.display === "block" ? rect.minimapHeight : 0,
    });

    renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);
    cssRenderer.setSize(gameSurface.width, gameSurface.height);


    minimapSurface.setDimensions(
      rect.minimapWidth,
      rect.minimapHeight,
    );

    gameViewportsDirector.aspect = gameSurface.aspect;
  };

  const sceneResizeHandler = debounce(() => {
    _sceneResizeHandler()
  }, 100);
  janitor.addEventListener(window, "resize", sceneResizeHandler, {
    passive: true,
  })

  let currentBwFrame = 0;
  let previousBwFrame = -1;

  // FIXME: merge these two, one is used for convenience in selection bars for energy hp testing
  const completedUpgrades = range(0, 8).map(() => [] as number[]);
  const completedResearch = range(0, 8).map(() => [] as number[]);
  const completedUpgradesReset = range(0, 8).map(() => [] as number[][]);
  const completedResearchReset = range(0, 8).map(() => [] as number[][]);
  const productionData = new StdVector(openBW.HEAP32, openBW._get_buffer(9) >> 2);

  const creep = new Creep(
    mapWidth,
    mapHeight,
    terrainExtra.creepTextureUniform.value,
    terrainExtra.creepEdgesTextureUniform.value
  );
  janitor.disposable(creep);

  const minimapUnitsImage = new ImageData(mapWidth, mapHeight);
  const minimapResourcesImage = new ImageData(mapWidth, mapHeight);
  const minimapFOWImage = new ImageData(mapWidth, mapHeight);
  const minimapTerrainBitmap = terrainExtra.minimapBitmap;

  const resourceColor = new Color(0, 55, 55);
  const flashColor = new Color(200, 200, 200);

  const _buildMinimap = (unit: Unit, unitType: UnitDAT) => {
    const isResourceContainer = unitType.isResourceContainer && unit.owner === 11;
    if (
      (!isResourceContainer &&
        !fogOfWar.isVisible(floor32(unit.x), floor32(unit.y)))
    ) {
      return;
    }
    if (unitType.index === unitTypes.scannerSweep) {
      return;
    }

    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unit.owner < 8) {
      color = unit.extras.recievingDamage & 1 ? flashColor : players.get(unit.owner).color;
    } else {
      return;
    }

    let w = Math.floor(unitType.placementWidth / 32);
    let h = Math.floor(unitType.placementHeight / 32);

    if (unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    const unitX = Math.floor(unit.x / 32);
    const unitY = Math.floor(unit.y / 32);
    const wX = Math.floor(w / 2);
    const wY = Math.floor(w / 2);

    const _out = isResourceContainer ? minimapResourcesImage : minimapUnitsImage;
    const alpha = isResourceContainer ? 150 : 255;

    for (let x = -wX; x < wX; x++) {
      for (let y = -wY; y < wY; y++) {
        if (unitY + y < 0) continue;
        if (unitX + x < 0) continue;
        if (unitX + x >= mapWidth) continue;
        if (unitY + y >= mapHeight) continue;

        const pos = ((unitY + y) * mapWidth + unitX + x) * 4;

        _out.data[pos] = Math.floor(color.r * 255);
        _out.data[pos + 1] = Math.floor(color.g * 255);
        _out.data[pos + 2] = Math.floor(color.b * 255);
        _out.data[pos + 3] = alpha;
      }
    }
  }

  const buildMinimap = (imageData: ImageData, resourceImageData: ImageData) => {
    imageData.data.fill(0);
    resourceImageData.data.fill(0);

    for (const unit of unitsIterator()) {
      const dat = bwDat.units[unit.typeId];

      const showOnMinimap =
        unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb;

      if (showOnMinimap) {
        _buildMinimap(unit, dat);
      }
    }
  }

  const freeUnits: Unit[] = [];

  const getUnit = (units: Map<number, Unit>, unitData: UnitsBufferView) => {
    const unit = units.get(unitData.id);
    if (unit) {
      return unit;
    } else {
      const unit = (freeUnits.pop() ?? { extras: {} }) as Unit;

      unitData.copyTo(unit)
      unit.extras.recievingDamage = 0;
      unit.extras.selected = false;
      unit.extras.dat = bwDat.units[unitData.typeId];
      unit.extras.turretLo = null;

      units.set(unitData.id, unit as unknown as Unit);
      plugins.callHook(HOOK_ON_UNIT_CREATED, unit);
      return unit as unknown as Unit;
    }
  }

  const unitBufferView = new UnitsBufferView(openBW);
  const unitList = new IntrusiveList(openBW.HEAPU32, 0, 43);

  function* unitsIterator() {
    const playersUnitAddr = openBW.getUnitsAddr();
    for (let p = 0; p < 12; p++) {
      unitList.addr = playersUnitAddr + (p << 3);
      for (const unitAddr of unitList) {
        const unitData = unitBufferView.get(unitAddr);
        const unit = units.get(unitData.id);
        if (unit) {
          yield unit;
        } else {
          log.error(`invalid access ${unitData.id}`);
        }
      }
    }
  }

  const buildUnits = (
    units: Map<number, Unit>,
    unitsBySprite: Map<number, Unit>
  ) => {
    const deletedUnitCount = openBW._counts(17);
    const deletedUnitAddr = openBW._get_buffer(5);

    for (let i = 0; i < deletedUnitCount; i++) {
      const unitId = openBW.HEAP32[(deletedUnitAddr >> 2) + i];
      const unit = units.get(unitId);
      if (!unit) continue;
      units.delete(unitId);
      freeUnits.push(unit);

      selectedUnitsStore().removeUnit(unit);
      unfollowUnit(unit);
      plugins.callHook(HOOK_ON_UNIT_KILLED, unit);
    }

    const playersUnitAddr = openBW.getUnitsAddr();

    for (let p = 0; p < 12; p++) {
      unitList.addr = playersUnitAddr + (p << 3);
      for (const unitAddr of unitList) {
        const unitData = unitBufferView.get(unitAddr);
        const unit = getUnit(units, unitData);

        unitsBySprite.set(unitData.spriteIndex, unit);

        //if receiving damage, blink 3 times, hold blink 3 frames
        if (
          !unit.extras.recievingDamage &&
          (unit.hp > unitData.hp || unit.shields > unitData.shields)
          && unit.typeId === unitData.typeId // ignore morphs
        ) {
          unit.extras.recievingDamage = 0b000111000111000111;
        } else if (unit.extras.recievingDamage) {
          unit.extras.recievingDamage = unit.extras.recievingDamage >> 1;
        }

        // unit morph
        if (unit.typeId !== unitData.typeId) {
          unit.extras.dat = bwDat.units[unitData.typeId];
        }

        unitData.copyTo(unit);

        if (unit.extras.selected &&
          (unit.order === orders.die ||
            unit.order === orders.harvestGas ||
            (unit.statusFlags & UnitFlags.Loaded) !== 0 ||
            (unit.statusFlags & UnitFlags.InBunker) !== 0)) {
          selectedUnitsStore().removeUnit(unit);
        }

        if (unit.typeId === unitTypes.siegeTankTankMode) {
          if (unit.extras.turretLo === null) {
            unit.extras.turretLo = new Vector2;
          }
          getImageLoOffset(unit.extras.turretLo, unitData.owSprite.mainImage, 0);
        } else {
          unit.extras.turretLo = null;
        }

      }
    }
  }

  const SoundPlayMaxDistance = 100;
  const _soundCoords = new Vector3;
  let _soundDat: SoundDAT;

  const buildSound = (elapsed: number, x: number, y: number, typeId: number, unitTypeId: number) => {
    if (!fogOfWar.isVisible(floor32(x), floor32(y)) || typeId === 0) {
      return;
    }
    _soundDat = assets.bwDat.sounds[typeId];

    pxToGameUnit.xyz(x, y, _soundCoords, terrain.getTerrainY);

    if (gameViewportsDirector.audio === "3d") {
      if (_soundDat.minVolume || mixer.position.distanceTo(_soundCoords) < (SoundPlayMaxDistance)) {
        soundChannels.play(elapsed, typeId, unitTypeId, _soundDat, _soundCoords, null, null);
      }
    }
    else if (gameViewportsDirector.audio === "stereo") {
      const volume = getBwVolume(
        _soundDat,
        _soundCoords,
        x,
        y,
        gameViewportsDirector.primaryViewport.projectedView.left,
        gameViewportsDirector.primaryViewport.projectedView.top,
        gameViewportsDirector.primaryViewport.projectedView.right,
        gameViewportsDirector.primaryViewport.projectedView.bottom,
      );

      const pan = getBwPanning(x, y, _soundCoords, gameViewportsDirector.primaryViewport.projectedView.left, gameViewportsDirector.primaryViewport.projectedView.width);
      if (volume > SoundPlayMinVolume) {
        soundChannels.play(elapsed, typeId, unitTypeId, _soundDat, _soundCoords, volume, pan);
      }
    }

  }
  const buildSounds = (elapsed: number) => {

    const soundsAddr = openBW.getSoundsAddress!();
    for (let i = 0; i < openBW.getSoundsCount!(); i++) {
      const addr = (soundsAddr >> 2) + (i << 2);
      const typeId = openBW.HEAP32[addr];
      const x = openBW.HEAP32[addr + 1];
      const y = openBW.HEAP32[addr + 2];
      const unitTypeId = openBW.HEAP32[addr + 3];

      buildSound(elapsed, x, y, typeId, unitTypeId);
    }
  };

  const _tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, openBW.HEAPU8);
  const buildCreep = (frame: number) => {
    _tiles.ptrIndex = openBW.getTilesPtr();
    _tiles.itemsCount = openBW.getTilesSize();
    creep.generate(_tiles, frame);
  };

  scene.add(...selectionObjects);

  const getImageLoOffset = (out: Vector2, image: ImageStruct, offsetIndex: number, useFrameIndexOffset = false) => {
    // size_t frame = use_frame_index_offset ? image->frame_index_offset : image->frame_index;

    //FIXME: apply to all camera angles
    const frameInfo = applyCameraDirectionToImageFrame(gameViewportsDirector.primaryViewport.camera, image);
    if (useFrameIndexOffset) {
      frameInfo.frame = frameInfo.frame % 17;
    }
    const dat = assets.bwDat.images[image.typeId];
    out.copy(bwDat.los[dat.specialOverlay - 1][frameInfo.frame][offsetIndex]);
    out.x = frameInfo.flipped ? -out.x : out.x;
    out.y = -out.y;
    return out;
  }

  const calcSpriteCoordsXY = (x: number, y: number, v: Vector3, v2: Vector2, isFlying?: boolean) => {
    const spriteX = pxToGameUnit.x(x);
    const spriteZ = pxToGameUnit.y(y);
    let spriteY = terrain.getTerrainY(spriteX, spriteZ);
    const flyingY = isFlying ? spriteY / terrain.geomOptions.maxTerrainHeight + terrain.geomOptions.maxTerrainHeight + 1 : spriteY;

    v2.set(spriteX, spriteZ);
    v.set(spriteX, flyingY, spriteZ);
  }
  const calcSpriteCoords = (sprite: SpritesBufferView, v: Vector3, v2: Vector2, isFlying?: boolean) => {
    calcSpriteCoordsXY(sprite.x, sprite.y, v, v2, isFlying);
  }
  const _spritePos = new Vector3();
  const _spritePos2d = new Vector2();
  const _targetSpritePos2d = new Vector2();
  const _targetSpritePos = new Vector3();
  const _ownerSpritePos = new Vector3();
  const _ownerSpritePos2d = new Vector2();

  // frequency, duration, strength multiplier
  const explosionFrequencyDuration = {
    [Explosion.Splash_Radial]: [6, 1.25, 1],
    [Explosion.Splash_Enemy]: [8, 1.25, 1],
    [Explosion.SplashAir]: [10, 1, 1],
    [Explosion.CorrosiveAcid]: [20, 0.75, 1],
    [Explosion.Normal]: [15, 0.75, 1],
    [Explosion.NuclearMissile]: [2, 3, 2],
    [Explosion.YamatoGun]: [4, 2, 1],
  };
  // strength, xyz index
  const bulletStrength = {
    [DamageType.Explosive]: [1, 0],
    [DamageType.Concussive]: [0.5, 1],
    [DamageType.Normal]: [0.25, 2],
  };
  const _spritePool: Group[] = [];

  const buildSprite = (spriteData: SpritesBufferView, _: number, bullet?: BulletsBufferView, weapon?: WeaponDAT) => {

    const unit = unitsBySprite.get(spriteData.index);
    let sprite = sprites.get(spriteData.index);
    if (!sprite) {
      if (_spritePool.length) {
        sprite = _spritePool.pop() as SpriteType;
      } else {
        sprite = new Group() as SpriteType;
        // sprite.matrixAutoUpdate = false;
        sprite.name = "sprite";
      }
      sprites.set(spriteData.index, sprite);
      spritesGroup.add(sprite);
      sprite.userData.typeId = spriteData.typeId;
      sprite.userData.needsMatrixUpdate = true;
      sprite.userData.renderTestCount = 0;
      delete sprite.userData.fixedY;
    } else {
      sprite.userData.needsMatrixUpdate = false;
    }

    // openbw recycled the id for the sprite, so we reset some things
    if (sprite.userData.typeId !== spriteData.typeId) {
      delete sprite.userData.fixedY;
      sprite.userData.typeId = spriteData.typeId;
    }

    const dat = bwDat.sprites[spriteData.typeId];
    if (spriteData.owner < 8) {
      sprite.layers.enable(Layers.Units);
    } else {
      sprite.layers.disable(Layers.Units);
    }

    // doodads and resources are always visible
    // show units as fog is lifting from or lowering to explored
    // show if a building has been explored
    let spriteIsVisible =
      spriteData.owner === 11 ||
      imageIsDoodad(dat.image) ||
      fogOfWar.isSomewhatVisible(floor32(spriteData.x), floor32(spriteData.y));

    // sprites may be hidden (eg training units, flashing effects, iscript tmprmgraphicstart/end)
    if (spriteIsHidden(spriteData) || (unit && gameViewportsDirector.onShouldHideUnit(unit))) {
      spriteIsVisible = false;
    }
    sprite.visible = spriteIsVisible;
    sprite.renderOrder = spriteSortOrder(spriteData as SpriteStruct) * 10;

    calcSpriteCoords(spriteData, _spritePos, _spritePos2d, unit && unitIsFlying(unit));
    let bulletY: number | undefined;

    // TODO: throttleSpriteUpdate, see #241

    const player = players.playersById[spriteData.owner];

    if (bullet && bullet.spriteIndex !== 0 && weapon && spriteIsVisible) {

      const exp = explosionFrequencyDuration[weapon.explosionType as keyof typeof explosionFrequencyDuration];
      const _bulletStrength = bulletStrength[weapon.damageType as keyof typeof bulletStrength];

      if (bullet.state === BulletState.Dying && _bulletStrength && !(exp === undefined || weapon.damageType === DamageType.IgnoreArmor || weapon.damageType === DamageType.Independent)) {
        for (const v of gameViewportsDirector.activeViewports()) {
          if (!v.cameraShake.enabled) {
            continue;
          }
          const distance = v.camera.position.distanceTo(_spritePos);
          if (distance < v.cameraShake.maxShakeDistance) {
            const calcStrength = _bulletStrength[0] * easeCubicIn(1 - distance / v.cameraShake.maxShakeDistance) * exp[2];
            if (calcStrength > v.shakeCalculation.strength.getComponent(_bulletStrength[1])) {
              v.shakeCalculation.strength.setComponent(_bulletStrength[1], calcStrength);
              v.shakeCalculation.duration.setComponent(_bulletStrength[1], exp[1] * 1000);
              v.shakeCalculation.frequency.setComponent(_bulletStrength[1], exp[0]);
              v.shakeCalculation.needsUpdate = true;
            }
          }
        }
      }

      if (weapon.weaponBehavior === WeaponBehavior.AppearOnTargetUnit && bullet.targetUnit) {
        calcSpriteCoords(bullet.targetUnit.owSprite, _targetSpritePos, _targetSpritePos2d, unitIsFlying(bullet.targetUnit));
        bulletY = _targetSpritePos.y;
        // appear on attacker: dark swarm/scarab/stasis field (visible?)
      } else if ((weapon.weaponBehavior === WeaponBehavior.AppearOnAttacker || weapon.weaponBehavior === WeaponBehavior.AttackTarget_3x3Area) && bullet.ownerUnit) {
        calcSpriteCoords(bullet.ownerUnit.owSprite, _ownerSpritePos, _ownerSpritePos2d, unitIsFlying(bullet.ownerUnit));
        bulletY = _ownerSpritePos.y;
      } else if (weapon.weaponBehavior === WeaponBehavior.FlyAndDontFollowTarget && bullet.targetUnit && bullet.ownerUnit) {
        calcSpriteCoordsXY(bullet.targetPosX, bullet.targetPosY, _targetSpritePos, _targetSpritePos2d, unitIsFlying(bullet.targetUnit));
        calcSpriteCoords(bullet.ownerUnit.owSprite, _ownerSpritePos, _ownerSpritePos2d, unitIsFlying(bullet.ownerUnit));

        const unitDistances = _ownerSpritePos2d.distanceTo(_targetSpritePos2d);
        const bulletDistanceToTarget = _spritePos2d.distanceTo(_targetSpritePos2d);

        bulletY = MathUtils.lerp(_targetSpritePos.y, _ownerSpritePos.y, bulletDistanceToTarget / unitDistances);
      }
      else if ((weapon.weaponBehavior === WeaponBehavior.FlyAndFollowTarget || weapon.weaponBehavior === WeaponBehavior.Bounce) && bullet.targetUnit) {
        const prevUnit = bullet.prevBounceUnit ?? bullet.ownerUnit;
        if (prevUnit) {
          calcSpriteCoords(bullet.targetUnit.owSprite, _targetSpritePos, _targetSpritePos2d, unitIsFlying(bullet.targetUnit));
          calcSpriteCoords(prevUnit.owSprite, _ownerSpritePos, _ownerSpritePos2d, unitIsFlying(prevUnit));

          const unitDistances = _ownerSpritePos2d.distanceTo(_targetSpritePos2d);
          const bulletDistanceToTarget = _spritePos2d.distanceTo(_targetSpritePos2d);

          bulletY = MathUtils.lerp(_targetSpritePos.y, _ownerSpritePos.y, bulletDistanceToTarget / unitDistances);
        }
      }
    }

    // update sprite y for easy comparison / assignment - beware of using spritePos.y for original values afterward!
    sprite.position.set(_spritePos.x, (sprite.userData.fixedY ?? bulletY ?? _spritePos.y), _spritePos.z);

    let imageCounter = 1;

    for (const imgAddr of spriteData.images.reverse()) {
      const imageData = imageBufferView.get(imgAddr);

      let image = images.get(imageData.index);
      if (!image) {
        image = createImage(imageData.typeId);
        if (!image) {
          continue;
        }
        images.set(imageData.index, image);
      }
      image.userData.typeId = imageData.typeId;

      //upgrade HD2 image to HD if loaded
      if (image instanceof ImageHD && image.unitTileScale === UnitTileScale.HD2 && assets.grps[imageData.typeId].unitTileScale === UnitTileScale.HD) {
        image.changeImageType(assets.grps[imageData.typeId], bwDat.images[imageData.typeId], true);
      }

      // always clear unit information since that can always change
      delete image.userData.unit;

      // only draw shadow if main image is not 3d
      const drawShadow = image.dat.drawFunction !== drawFunctions.rleShadow || !isGltfAtlas(assets.grps[spriteData.mainImage.typeId]) && image.dat.drawFunction === drawFunctions.rleShadow;

      image.visible = spriteIsVisible && !imageIsHidden(imageData as ImageStruct) && drawShadow;
      image.matrixWorldNeedsUpdate = false;

      if (image.visible) {
        image.matrixWorldNeedsUpdate = imageNeedsRedraw(imageData as ImageStruct);
        image.setTeamColor(player?.color ?? white);
        image.setModifiers(imageData.modifier, imageData.modifierData1, imageData.modifierData2);

        image.position.x = imageData.x / 32;
        // flying building or drone, don't use 2d offset
        image.position.y = imageIsFrozen(imageData) ? 0 : -imageData.y / 32;

        // tank turret needs to use different LO depending on camera angle
        // in order to handle this we need to set the LO to the correct frame
        // in addition, terran turret subunits are treated differently in bw so we accomodate that
        // by setting the lo from the main unit image and not the turret image 
        // as seen in `update_unit_movement`
        const subunitId = unit?.subunitId;
        if (subunitId !== null && subunitId !== undefined && (imageData.typeId === imageTypes.siegeTankTankTurret)) {
          const subunit = units.get(subunitId);
          // bw keeps parent unit in subunit as well, so in this case this is actually parent unit
          // ie base tank
          if (subunit && subunit.extras.turretLo) {
            image.position.x = subunit.extras.turretLo.x / 32;
            image.position.y = subunit.extras.turretLo.y / 32;
          }
        }

        image.position.z = 0;

        // if we're a shadow, we act independently from a sprite since our Y coordinate
        // needs to be in world space
        if (gameViewportsDirector.primaryViewport.spriteRenderOptions.rotateSprites && image.dat.drawFunction === drawFunctions.rleShadow && unit && unitIsFlying(unit)) {
          image.position.x = _spritePos.x;
          image.position.z = _spritePos.z;
          image.position.y = terrain.getTerrainY(_spritePos.x, _spritePos.z) - 0.1;

          image.rotation.copy(sprite.rotation);
          image.renderOrder = - 1;
          if (image.parent !== spritesGroup) {
            spritesGroup.add(image);
          }
          image.matrixWorldNeedsUpdate = true;
        } else {
          image.rotation.set(0, 0, 0);
          image.renderOrder = sprite.renderOrder + imageCounter;
          if (image.parent !== sprite) {
            sprite.add(image);
          }
        }

        // if it's directional we'll set it elsewhere relative to the viewport camera direction
        if (!imageHasDirectionalFrames(imageData as ImageStruct)) {
          image.setFrame(imageData.frameIndex, imageIsFlipped(imageData as ImageStruct));
        }

        if (imageData.index === spriteData.mainImageIndex) {
          image.userData.unit = unit;
          if (unit && image instanceof Image3D) {
            image.rotation.y = getAngle(unit.direction);
          }
        }
      }
      imageCounter++;
    }

  }

  const spriteBufferView = new SpritesBufferView(openBW);
  const imageBufferView = new ImageBufferView(openBW);
  const bulletBufferView = new BulletsBufferView(openBW);
  const _ignoreSprites: number[] = [];
  const bulletList = new IntrusiveList(openBW.HEAPU32, 0);

  const buildSprites = (delta: number) => {
    const deleteImageCount = openBW._counts(15);
    const deletedSpriteCount = openBW._counts(16);
    const deletedImageAddr = openBW._get_buffer(3);
    const deletedSpriteAddr = openBW._get_buffer(4);

    // avoid image flashing by clearing the group here when user is scrubbing through a replay
    if (_wasReset) {
      spritesGroup.clear();
      _wasReset = false;
    }

    for (let i = 0; i < deletedSpriteCount; i++) {
      const spriteIndex = openBW.HEAP32[(deletedSpriteAddr >> 2) + i];
      unitsBySprite.delete(spriteIndex);

      const sprite = sprites.get(spriteIndex);
      if (!sprite) continue;
      sprite.removeFromParent();
      sprites.delete(spriteIndex);
      _spritePool.push(sprite);
    }

    for (let i = 0; i < deleteImageCount; i++) {
      const imageIndex = openBW.HEAP32[(deletedImageAddr >> 2) + i];
      const image = images.get(imageIndex);
      if (!image) continue;
      image.removeFromParent();
      images.delete(imageIndex);
      freeImages.add(image.dat.index, image);
    }

    // build bullet sprites first since they need special Y calculations
    bulletList.addr = openBW.getBulletsAddress();
    _ignoreSprites.length = 0;
    for (const bulletAddr of bulletList) {
      if (bulletAddr === 0) continue;

      const bullet = bulletBufferView.get(bulletAddr);
      const weapon = bwDat.weapons[bullet.weaponTypeId];

      if (bullet.weaponTypeId === WeaponType.FusionCutter_Harvest || bullet.weaponTypeId === WeaponType.ParticleBeam_Harvest || bullet.weaponTypeId === WeaponType.Spines_Harvest || weapon.weaponBehavior === WeaponBehavior.AppearOnTargetPos) {
        continue;
      }

      buildSprite(bullet.owSprite, delta, bullet, weapon);
      _ignoreSprites.push(bullet.spriteIndex);
    }

    // build all remaining sprites
    const spriteList = new IntrusiveList(openBW.HEAPU32);
    const spriteTileLineSize = openBW.getSpritesOnTileLineSize();
    const spritetileAddr = openBW.getSpritesOnTileLineAddress();
    for (let l = 0; l < spriteTileLineSize; l++) {
      spriteList.addr = spritetileAddr + (l << 3)
      for (const spriteAddr of spriteList) {
        if (spriteAddr === 0) {
          continue;
        }

        const spriteData = spriteBufferView.get(spriteAddr);
        if (_ignoreSprites.includes(spriteData.index)) {
          continue;
        }

        buildSprite(spriteData, delta);
      }
    }

    // linked sprites are a psuedo link of sprites the create their own sprites in the iscript
    // eg. sprol, which openbw then calls create_thingy_at_image
    // the reason we need to track this link is because some bullets create trails
    // titan-reactor.h only sends us sprites of halo rocket trail and long bolt/gemini missile trail
    const linkedSpritesAddr = openBW.getLinkedSpritesAddress();
    for (let i = 0; i < openBW.getLinkedSpritesCount(); i++) {
      const addr = (linkedSpritesAddr >> 2) + (i << 1);
      const parent = sprites.get(openBW.HEAP32[addr]);
      const child = sprites.get(openBW.HEAP32[addr + 1]);
      if (!child || !parent) {
        break;
      }
      // keep a reference to the value so that we retain it in buildSprite() in future iterations
      child.position.y = child.userData.fixedY = parent.position.y;
    }
  };


  function* spriteIterator() {
    const spriteList = new IntrusiveList(openBW.HEAPU32);
    const spriteTileLineSize = openBW.getSpritesOnTileLineSize();
    const spritetileAddr = openBW.getSpritesOnTileLineAddress();
    for (let l = 0; l < spriteTileLineSize; l++) {
      spriteList.addr = spritetileAddr + (l << 3)
      for (const spriteAddr of spriteList) {
        if (spriteAddr === 0) {
          continue;
        }

        const spriteData = spriteBufferView.get(spriteAddr);
        yield spriteData;

        let sprite = sprites.get(spriteData.index);
        if (sprite) {
          yield sprite;
        }
      }
    }
  }

  function* spriteImageIterator(spriteData: SpritesBufferView) {
    for (const imgAddr of spriteData.images.reverse()) {
      const imageData = imageBufferView.get(imgAddr);
      yield imageData;

      let image = images.get(imageData.index);
      if (image) {
        yield image;
      }
    }
  }


  const _updateCompleted = (arr: number[], arrReset: number[][], size: number, dat: UpgradeDAT[] | TechDataDAT[], hook: string) => {
    let j = 0;
    let typeId = 0;
    let level = 0;
    for (const val of productionData) {
      if (j === 0) {
        typeId = val;
      } else if (j === size - 1) {
        if (val === 0 && !arr.includes(typeId)) {
          arr.push(typeId);
          arrReset.push([typeId, currentBwFrame]);
          plugins.callHook(hook, [typeId, level, dat[typeId]]);
        }
      } else if (j === 1) {
        level = val;
      }
      j++;
      if (j === size) {
        j = 0;
      }
    }
  }

  const updateCompletedUpgrades = () => {
    let addr32 = openBW._get_buffer(9) >> 2;
    for (let player = 0; player < 8; player++) {
      productionData.addr32 = addr32 + (player * 9) + 3;
      _updateCompleted(completedUpgrades[player], completedUpgradesReset[player], 3, bwDat.upgrades, HOOK_ON_UPGRADE_COMPLETED);
      productionData.addr32 += 3;
      _updateCompleted(completedResearch[player], completedResearchReset[player], 2, bwDat.tech, HOOK_ON_TECH_COMPLETED);
    }
  }


  // apply initial terrain shadow settings
  terrain.shadowsEnabled = session.getState().graphics.terrainShadows;
  renderComposer.getWebGLRenderer().shadowMap.needsUpdate = session.getState().graphics.terrainShadows;

  const _a = new Vector3;

  let delta = 0;
  let lastElapsed = 0;

  let cmds = commandsStream.generate();

  const _commandsThisFrame: any[] = [];

  let cmd = cmds.next();

  let _halt = false;
  renderComposer.targetSurface = gameSurface;

  const GAME_LOOP = (elapsed: number) => {
    if (_halt) return;
    delta = elapsed - lastElapsed;
    lastElapsed = elapsed;

    for (const viewport of gameViewportsDirector.viewports) {
      viewport.orbit.update(delta / 1000);
      viewport.orbit.getTarget(_a);
      viewport.projectedView.update(viewport.camera, _a);
    }

    cameraMouse.update(delta / 100, elapsed, gameViewportsDirector);
    cameraKeys.update(delta / 100, elapsed, gameViewportsDirector);
    minimapMouse.update(gameViewportsDirector);

    if (reset) {
      reset();
    }

    currentBwFrame = openBW.nextFrame(false);
    if (currentBwFrame !== previousBwFrame) {

      if (currentBwFrame % 42 === 0) {
        updateCompletedUpgrades();
      }
      buildSounds(elapsed);
      buildCreep(currentBwFrame);

      buildUnits(
        units,
        unitsBySprite
      );
      buildMinimap(minimapUnitsImage, minimapResourcesImage);
      buildSprites(delta);
      updateSelectionGraphics(gameViewportsDirector.primaryViewport.camera, completedUpgrades, sprites);

      fogOfWar.texture.needsUpdate = true;
      creep.creepValuesTexture.needsUpdate = true;
      creep.creepEdgesValuesTexture.needsUpdate = true;

      const audioPosition = gameViewportsDirector.onUpdateAudioMixerLocation(delta, elapsed);
      mixer.updateFromVector3(audioPosition as Vector3, delta);

      for (const v of gameViewportsDirector.activeViewports()) {
        if (v.cameraShake.enabled && v.shakeCalculation.needsUpdate) {
          v.cameraShake.shake(elapsed, v.shakeCalculation.duration, v.shakeCalculation.frequency, v.shakeCalculation.strength);
          v.shakeCalculation.needsUpdate = false;
          v.shakeCalculation.strength.setScalar(0);
        }
      }

      _commandsThisFrame.length = 0;
      while (cmd.done === false) {
        if (
          typeof cmd.value === "number"
        ) {
          if (cmd.value > currentBwFrame) {
            break;
          }
          // only include past 5 game seconds (in case we are skipping frames)
        } else if (currentBwFrame - cmd.value.frame < 120) {
          _commandsThisFrame.push(cmd.value);
        }
        cmd = cmds.next();
      }

      fadingPointers.update(currentBwFrame);

      plugins.onFrame(openBW, currentBwFrame, openBW._get_buffer(8), openBW._get_buffer(9), _commandsThisFrame);

      previousBwFrame = currentBwFrame;
    }


    {
      for (const v of gameViewportsDirector.activeViewports()) {
        const dir = v.spriteRenderOptions.rotateSprites ? getDirection32(v.projectedView.center, v.camera.position) : 0;
        if (dir != v.camera.userData.direction) {
          v.camera.userData.prevDirection = v.camera.userData.direction;
          v.camera.userData.direction = dir;
        }
      }
    }

    drawMinimap(minimapSurface, mapWidth, mapHeight, minimapUnitsImage, minimapResourcesImage, minimapFOWImage, creep.minimapImageData, minimapTerrainBitmap, fogOfWar.enabled, gameViewportsDirector);

    plugins.onBeforeRender(delta, elapsed);

    for (const v of gameViewportsDirector.activeViewports()) {
      updateSpritesForViewport(v.camera, v.spriteRenderOptions, spriteIterator, spriteImageIterator);
      v.cameraShake.update(elapsed, v.camera);
      fogOfWar.update(players.getVisionFlag(), v.camera, minimapFOWImage);
      updatePostProcessingCamera(v.postProcessing, v.camera, true);
      renderComposer.setBundlePasses(v.postProcessing);
      renderComposer.render(delta, v.viewport);
      v.cameraShake.restore(v.camera);
    }
    renderComposer.renderBuffer();

    let _cssItems = 0;
    for (const cssItem of cssScene.children) {
      _cssItems += cssItem.children.length;
      if (_cssItems > 0) {
        break;
      }
    }
    //TODO: remove css renderer from main thread
    if (_cssItems) {
      cssRenderer.render(cssScene, gameViewportsDirector.primaryViewport.camera);
    }

    plugins.onRender(delta, elapsed);

  };

  const originalColors = replay.header.players.map(player => player.color);
  const originalNames = replay.header.players.map(player => ({
    id: player.id,
    name: player.name
  }));

  janitor.callback(useSelectedUnitsStore.subscribe((state) => {
    plugins.callHook(HOOK_ON_UNITS_SELECTED, state.selectedUnits);
  }));

  let pluginsApiJanitor = new Janitor;

  const setupPlugins = async () => {
    const container = createCompartment(gameTimeApi);
    macros.setCreateCompartment((context?: any) => {
      container.globalThis.context = context;
      return container;
    });

    pluginsApiJanitor.add(plugins.injectApi(gameTimeApi, macros));
    await plugins.callHookAsync(HOOK_ON_SCENE_READY);
  }

  await setupPlugins();

  const _onReloadPlugins = async () => {
    _halt = true;
    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    pluginsApiJanitor.mopUp();
    await gameViewportsDirector.activate(null);
    await (settingsStore().load());
    await plugins.initializePluginSystem(true);
    await setupPlugins();
    await gameViewportsDirector.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!);
    renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);
    _halt = false;
  };

  janitor.on(ipcRenderer, RELOAD_PLUGINS, _onReloadPlugins);

  macros.setHostDefaults(settingsStore().data);
  plugins.setAllMacroDefaults(macros);

  janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, async (_: any, { type, payload: { pluginId, config } }: {
    type: SendWindowActionType.PluginConfigChanged
    payload: SendWindowActionPayload<SendWindowActionType.PluginConfigChanged>
  }) => {
    if (type === SendWindowActionType.PluginConfigChanged) {
      plugins.setMacroDefaults(macros, pluginId, config);
    }
  })

  janitor.callback(macros.listenForKeyCombos());

  janitor.on(ipcRenderer, SEND_BROWSER_WINDOW, (_: IpcRendererEvent, { type, payload }: {
    type: SendWindowActionType.ManualMacroTrigger,
    payload: SendWindowActionPayload<SendWindowActionType.ManualMacroTrigger>
  }) => {
    if (type === SendWindowActionType.ManualMacroTrigger) {
      macros.execMacroById(payload);
    }
  });

  janitor.on(ipcRenderer, SERVER_API_FIRE_MACRO, (_: IpcRendererEvent, macroId: string) => {
    macros.execMacroById(macroId);
  });

  janitor.add(useSettingsStore.subscribe((settings, prevSettings) => {

    const diffs = diff(prevSettings, settings);
    if (diffs === undefined)
      return;

    // update our session with the new user manipulated settings
    const mergeSettings: DeepPartial<SettingsMeta> = {
      data: {}
    };
    for (const d of diffs) {
      if (d.kind === "E" && d.path) {
        set(mergeSettings, d.path, d.rhs);
      }
    }
    session.getState().merge(mergeSettings.data!);
    if (settings.data.macros.revision !== macros.revision) {
      macros.deserialize(settings.data.macros);
    }
    macros.setHostDefaults(settings.data);

  }));

  janitor.add(session.subscribe((newSettings, prevSettings) => {
    if (!gameViewportsDirector.disabled && newSettings.game.sceneController !== gameViewportsDirector.name) {
      gameViewportsDirector.activate(plugins.getSceneInputHandler(newSettings.game.sceneController)!);
    }

    mixer.setVolumes(newSettings.audio);

    if (newSettings.graphics.terrainShadows !== terrain.shadowsEnabled) {
      terrain.shadowsEnabled = newSettings.graphics.terrainShadows;
      renderComposer.getWebGLRenderer().shadowMap.needsUpdate = newSettings.graphics.terrainShadows;
    }

    if (newSettings.graphics.anisotropy !== prevSettings.graphics.anisotropy) {
      terrain.setAnisotropy(session.getState().graphics.anisotropy);
      terrainExtra.setCreepAnisotropy(session.getState().graphics.anisotropy);
    }

    Object.assign(session, newSettings);
    _sceneResizeHandler();

  }));

  await gameViewportsDirector.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!, { target: pxToGameUnit.xyz(players[0].startLocation!.x, players[0].startLocation!.y, new Vector3, terrain.getTerrainY) });

  const precompileCamera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0, 1000);
  precompileCamera.updateProjectionMatrix();
  precompileCamera.position.setY(Math.max(mapWidth, mapHeight) * 4)
  precompileCamera.lookAt(scene.position);

  // precompile the scene for the first time
  // set game second to 1 so creep can be rendered since its slow to generate
  //TODO: get all scene controllers
  GAME_LOOP(0);
  renderComposer.getWebGLRenderer().render(scene, precompileCamera);
  _sceneResizeHandler();

  return {
    id: "@replay",
    dispose: () => {
      log.info("disposing replay viewer");
      _halt = true;
      renderComposer.getWebGLRenderer().setAnimationLoop(null);
      selectedUnitsStore().clearSelectedUnits();
      clearFollowedUnits();
      plugins.disposeGame();
      pluginsApiJanitor.mopUp();
      janitor.mopUp();
    }, start: () => renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP)
  }
}

export default TitanReactorGame;
