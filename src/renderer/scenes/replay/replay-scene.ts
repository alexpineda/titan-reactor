import { debounce } from "lodash";
import { Color, MathUtils, Object3D, PerspectiveCamera, Vector2, Vector3 } from "three";
import type Chk from "bw-chk";
import { mixer } from "@audio"
import { BulletState, drawFunctions, imageTypes, orders, UnitFlags, unitTypes } from "common/enums";
import { Surface } from "@image";
import {
  Settings,
  SpriteType,
  WeaponDAT
} from "common/types";
import { pxToMapMeter, floor32 } from "common/utils/conversions";
import { SpriteStruct, ImageStruct } from "common/types";
import type { SoundChannels } from "@audio";
import {
  Players,
  ImageHD, Creep, FogOfWar, FogOfWarEffect, ImageBase, Image3D, Unit
} from "@core";
import {
  MinimapMouse, CameraMouse, CameraKeys, createUnitSelection
} from "@input";
import { getOpenBW } from "@openbw";
import { ImageBufferView, SpritesBufferView, TilesBufferView, IntrusiveList, UnitsBufferView, BulletsBufferView } from "@buffer-view";
import * as log from "@ipc/log";
import {
  GameSurface, renderComposer, SimpleText, BaseScene
} from "@render";
import { getImageLoOffset, imageHasDirectionalFrames, imageIsDoodad, imageIsFlipped, imageIsFrozen, imageIsHidden, imageNeedsRedraw } from "@utils/image-utils";
import { buildSound } from "@utils/sound-utils";
import { spriteIsHidden, spriteSortOrder, updateSpritesForViewport } from "@utils/sprite-utils";
import Janitor from "@utils/janitor";
import { WeaponBehavior } from "common/enums";
import gameStore from "@stores/game-store";
import * as plugins from "@plugins";
import settingsStore from "@stores/settings-store";
import { Assets } from "common/types/assets";
import { Replay } from "@process-replay/parse-replay";
import CommandsStream from "@process-replay/commands/commands-stream";
import { HOOK_ON_FRAME_RESET, HOOK_ON_SCENE_READY, HOOK_ON_UNITS_SELECTED } from "@plugins/hooks";
import { canSelectUnit, getAngle, unitIsFlying } from "@utils/unit-utils";
import { ipcRenderer } from "electron";
import { CLEAR_ASSET_CACHE, RELOAD_PLUGINS } from "common/ipc-handle-names";
import selectedUnitsStore, { useSelectedUnitsStore } from "@stores/selected-units-store";
import { selectionObjects, updateSelectionGraphics } from "./selection-objects";
import FadingPointers from "@image/fading-pointers";
import { Macros } from "@macros/macros";
import { createCompartment } from "@utils/ses-util";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { MinimapGraphics } from "@render/minimap-graphics";
import { createSession, listenForNewSettings } from "@stores/session-store";
import { Terrain } from "@core/terrain";
import { TerrainExtra } from "@image/generate-map/chk-to-terrain-mesh";
import { SceneState } from "../scene";
import { calculateFollowedUnitsTarget, clearFollowedUnits, followUnits, hasFollowedUnits } from "./followed-units";
import { resetCompletedUpgrades, updateCompletedUpgrades } from "./completed-upgrades";
import { ImageEntities } from "./image-entities";
import { SpriteEntities } from "./sprite-entities";
import { CssScene } from "./css-scene";
import { listenToEvents } from "@utils/macro-utils";
import { UnitEntities } from "./unit-entities";
import { GameTimeApi } from "./game-time-api";
import { ReplayChangeSpeedDirection, REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, speedHandler } from "./replay-controls";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { applyOverlayEffectsToImage3D, applyOverlayEffectsToImageHD, overlayEffectsMainImage } from "@core/model-effects";
import { EffectivePasses, GlobalEffects } from "@render/global-effects";
import { FreeMap } from "@utils/free-map";

export async function replayScene(
  map: Chk,
  terrain: Terrain,
  terrainExtra: TerrainExtra,
  scene: BaseScene,
  assets: Assets,
  janitor: Janitor,
  replay: Replay,
  soundChannels: SoundChannels,
  commandsStream: CommandsStream
): Promise<SceneState> {

  const session = createSession(settingsStore().data);
  const macros = new Macros(session);
  macros.deserialize(settingsStore().data.macros);

  const players = janitor.mop(new Players(
    replay.header.players,
    map.units.filter((u) => u.unitId === unitTypes.startLocation),
  ));

  const openBW = await getOpenBW();
  openBW.setGameSpeed(1);
  openBW.setPaused(false);

  const [mapWidth, mapHeight] = map.size;
  renderComposer.getWebGLRenderer().physicallyCorrectLights = true;


  const cssScene = new CssScene;

  const gameSurface = janitor.mop(new GameSurface(mapWidth, mapHeight));
  gameSurface.setDimensions(window.innerWidth, window.innerHeight, session.getState().graphics.pixelRatio);
  janitor.mop(document.body.appendChild(gameSurface.canvas));
  gameStore().setDimensions(gameSurface.getMinimapDimensions(session.getState().game.minimapSize));

  const minimapSurface = janitor.mop(new Surface({
    position: "absolute",
    bottom: "0",
    zIndex: "20"
  }));
  janitor.mop(document.body.appendChild(minimapSurface.canvas));

  const simpleText = janitor.mop(new SimpleText());
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const minimapMouse = janitor.mop(new MinimapMouse(
    minimapSurface,
    mapWidth,
    mapHeight,
    () => {
      clearFollowedUnits();
    }
  ));

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  const cameraMouse = janitor.mop(new CameraMouse(document.body));

  const cameraKeys = janitor.mop(new CameraKeys(document.body, () => {
    if (hasFollowedUnits()) {
      clearFollowedUnits();
    } else if (selectedUnitsStore().selectedUnits.length) {
      followUnits(selectedUnitsStore().selectedUnits);
    }
  }));

  const units = new UnitEntities

  const sprites = new SpriteEntities(openBW);
  scene.add(sprites.group);

  const images = janitor.mop(new ImageEntities);
  ipcRenderer.on(CLEAR_ASSET_CACHE, () => {
    assets.resetAssetCache();
    images.dispose();
  })

  const fogOfWarEffect = janitor.mop(new FogOfWarEffect());
  const fogOfWar = new FogOfWar(mapWidth, mapHeight, openBW, fogOfWarEffect);

  const globalEffectsBundle = janitor.mop(
    new GlobalEffects(
      new PerspectiveCamera,
      scene,
      session.getState().postprocessing,
      fogOfWarEffect));

  //tank base, minerals
  const ignoreRecieveShadow = [250, 253, 347, 349, 351];
  const ignoreCastShadow = [347, 349, 351];
  images.onCreateImage = (image) => {
    globalEffectsBundle.addBloomSelection(image);
    if (image instanceof Image3D && globalEffectsBundle.options3d) {
      image.material.envMapIntensity = globalEffectsBundle.options3d.envMap;
      image.castShadow = !ignoreCastShadow.includes(assets.refId(image.dat.index));
      image.receiveShadow = !ignoreRecieveShadow.includes(assets.refId(image.dat.index));;
    }
  }

  images.onFreeImage = (image) => {
    globalEffectsBundle.removeBloomSelection(image);
  }

  const initializeGlobalEffects = (options: Settings["postprocessing"] | Settings["postprocessing3d"]) => {

    globalEffectsBundle.camera = viewports.primaryViewport.camera;
    globalEffectsBundle.scene = scene;
    globalEffectsBundle.options = options;
    globalEffectsBundle.needsUpdate = true;

    // do this after changing render mode as Extended differs
    globalEffectsBundle.effectivePasses = viewports.numActiveViewports > 1 ? EffectivePasses.Standard : EffectivePasses.Extended;

    if (globalEffectsBundle.options3d) {
      for (const image of images) {
        if (image instanceof Image3D) {
          image.material.envMapIntensity = globalEffectsBundle.options3d.envMap;
        }
      }


      if (globalEffectsBundle.options3d.shadowQuality !== scene.sunlight.shadowQuality) {
        scene.createSunlight();
        scene.sunlight.shadowQuality = globalEffectsBundle.options3d.shadowQuality;
      }
      scene.sunlight.shadowIntensity = globalEffectsBundle.options3d.shadowIntensity;
      scene.sunlight.setPosition(globalEffectsBundle.options3d.sunlightDirection[0], globalEffectsBundle.options3d.sunlightDirection[1], globalEffectsBundle.options3d.sunlightDirection[2]);
      scene.sunlight.intensity = globalEffectsBundle.options3d.sunlightIntensity;
      scene.sunlight.setColor(globalEffectsBundle.options3d.sunlightColor);
      scene.sunlight.needsUpdate();

      terrain.envMapIntensity = globalEffectsBundle.options3d.envMap;

    }

  }

  janitor.mop(session.subscribe(data => {
    if (viewports.primaryViewport) {
      initializeGlobalEffects(viewports.primaryViewport.renderMode3D ? data.postprocessing3d : data.postprocessing);
    }
  }))

  const initializeRenderMode = (renderMode3D: boolean) => {
    const postprocessing = renderMode3D ? session.getState().postprocessing3d : session.getState().postprocessing;

    terrain.setTerrainQuality(renderMode3D, postprocessing.anisotropy);
    scene.setBorderTileColor(renderMode3D ? 0xffffff : 0x999999);
    scene.sunlight.enabled = renderMode3D;
    images.use3dImages = renderMode3D;

    reset = refreshScene;

    initializeGlobalEffects(postprocessing);
  }

  const viewports = janitor.mop(new GameViewportsDirector(gameSurface,
    macros
  ));

  const _getSelectionUnit = (object: Object3D): Unit | null => {
    if (object instanceof ImageHD || object instanceof Image3D) {
      return canSelectUnit(images.getUnit(object));
    } else if (object.parent) {
      return _getSelectionUnit(object.parent);
    }
    return null;
  }

  const unitSelection = createUnitSelection(scene, gameSurface, minimapSurface, (object) => _getSelectionUnit(object));

  viewports.beforeActivate = () => {
    gameTimeApi.minimap.enabled = true;
    gameTimeApi.minimap.scale = 1;
  }

  viewports.onActivate = (sceneController) => {
    const rect = gameSurface.getMinimapDimensions(session.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: gameTimeApi.minimap.enabled === true ? rect.minimapHeight : 0,
    });

    if (!sceneController.gameOptions.allowUnitSelection) {
      selectedUnitsStore().clearSelectedUnits();
    }

    plugins.setSceneController(sceneController);

    unitSelection.enabled = sceneController.gameOptions?.allowUnitSelection;
    unitSelection.selectionBox.camera = sceneController.viewports[0].camera;
    _sceneResizeHandler();
  }

  const gameTimeApi = ((): GameTimeApi => {

    const skipHandler = (dir: number, gameSeconds = 200) => {
      const currentFrame = openBW.getCurrentFrame();
      openBW.setCurrentFrame(currentFrame + gameSeconds * 42 * dir);
      currentBwFrame = openBW.getCurrentFrame();
      reset = refreshScene;
      return currentBwFrame;
    }

    return {
      type: "replay",
      simpleMessage(val: string) {
        simpleText.set(val);
      },
      get viewport() {
        return viewports.viewports[0];
      },
      get secondViewport() {
        return viewports.viewports[1];
      },
      scene,
      cssScene,
      assets,
      toggleFogOfWarByPlayerId(playerId: number) {
        if (players.toggleFogOfWarByPlayerId(playerId)) {
          fogOfWar.forceInstantUpdate = true;
        }
      },
      get cameraMovementSpeed() {
        return session.getState().game.movementSpeed;
      },
      get cameraRotateSpeed() {
        return session.getState().game.rotateSpeed;
      },
      get cameraZoomLevels() {
        return session.getState().game.zoomLevels;
      },
      unitsIterator,
      skipForward: (amount = 1) => skipHandler(1, amount),
      skipBackward: (amount = 1) => skipHandler(-1, amount),
      speedUp: () => speedHandler(ReplayChangeSpeedDirection.Up, openBW),
      speedDown: () => speedHandler(ReplayChangeSpeedDirection.Down, openBW),
      togglePause: (setPaused?: boolean) => {
        openBW.setPaused(setPaused ?? !openBW.isPaused());
        return openBW.isPaused();
      },
      get gameSpeed() {
        return openBW.getGameSpeed();
      },
      setGameSpeed(value: number) {
        openBW.setGameSpeed(MathUtils.clamp(value, REPLAY_MIN_SPEED, REPLAY_MAX_SPEED));
      },
      refreshScene: () => {
        reset = refreshScene;
      },
      pxToGameUnit,
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
        // so we don't do it in the middle of the game loop
        setTimeout(() => {
          session.getState().merge({
            game: {
              sceneController: settingsStore().data.game.sceneController
            }
          });
        }, 0);

      },
      setPlayerColors(colors: string[]) {
        players.setPlayerColors(colors);
      },
      getPlayerColor: (id: number) => {
        return players.get(id)?.color ?? new Color(1, 1, 1);
      },
      getOriginalColors() {
        return players.originalColors;
      },
      setPlayerNames(...args: Parameters<Players["setPlayerNames"]>) {
        players.setPlayerNames(...args);
      },
      getOriginalNames() {
        return players.originalNames;
      },
      getPlayers: () => [...replay.header.players.map(p => ({ ...p }))],
      get replay() { return { ...replay.header, players: [...replay.header.players.map(p => ({ ...p }))] } },
      get followedUnitsPosition() {
        if (!hasFollowedUnits()) {
          return null;
        }
        return calculateFollowedUnitsTarget(pxToGameUnit);
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
          buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, pxToGameUnit, terrain, viewports.audio, viewports.primaryViewport.projectedView, soundChannels, mixer);
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
        return viewports.mouseCursor;
      },
      set mouseCursor(val: boolean) {
        viewports.mouseCursor = val;
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
      },
      changeRenderMode: (renderMode3D?: boolean) => {
        viewports.primaryViewport.renderMode3D = renderMode3D ?? !viewports.primaryViewport.renderMode3D;
        initializeRenderMode(viewports.primaryViewport.renderMode3D)
      }
    }
  })();

  let reset: (() => void) | null = null;
  let _wasReset = false;

  const refreshScene = () => {
    images.clear();
    units.clear();
    sprites.clear();
    cmds = commandsStream.generate();
    cmd = cmds.next();
    fadingPointers.clear();
    globalEffectsBundle.clearBloomSelection();

    const frame = openBW.getCurrentFrame();

    // remove any upgrade or tech that is no longer available
    resetCompletedUpgrades(frame);
    plugins.callHook(HOOK_ON_FRAME_RESET, frame);
    previousBwFrame = -1;
    reset = null;
    _wasReset = true;
  }

  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight, session.getState().graphics.pixelRatio);

    const rect = gameSurface.getMinimapDimensions(session.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: minimapSurface.canvas.style.display === "block" ? rect.minimapHeight : 0,
    });

    renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);
    cssScene.setSize(gameSurface.width, gameSurface.height);

    minimapSurface.setDimensions(
      rect.minimapWidth,
      rect.minimapHeight,
    );

    viewports.aspect = gameSurface.aspect;
  };

  const sceneResizeHandler = debounce(() => {
    _sceneResizeHandler()
  }, 100);
  janitor.addEventListener(window, "resize", sceneResizeHandler, {
    passive: true,
  })

  let currentBwFrame = 0;
  let previousBwFrame = -1;

  const creep = janitor.mop(new Creep(
    mapWidth,
    mapHeight,
    terrainExtra.creepTextureUniform.value,
    terrainExtra.creepEdgesTextureUniform.value
  ));

  const ignoreOnMinimap = [unitTypes.darkSwarm, unitTypes.disruptionWeb];
  const buildMinimap = () => {
    minimapGraphics.resetUnitsAndResources();
    for (const unit of unitsIterator()) {
      if (!ignoreOnMinimap.includes(unit.typeId)) {
        minimapGraphics.buildUnitMinimap(unit, assets.bwDat.units[unit.typeId], fogOfWar, players)
      }
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
  ) => {
    const deletedUnitCount = openBW._counts(17);
    const deletedUnitAddr = openBW._get_buffer(5);

    for (let i = 0; i < deletedUnitCount; i++) {
      units.free(openBW.HEAP32[(deletedUnitAddr >> 2) + i]);
    }

    const playersUnitAddr = openBW.getUnitsAddr();

    for (let p = 0; p < 12; p++) {
      unitList.addr = playersUnitAddr + (p << 3);
      for (const unitAddr of unitList) {
        const unitData = unitBufferView.get(unitAddr);
        const unit = units.getOrCreate(unitData);

        sprites.setUnit(unitData.spriteIndex, unit);
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
          unit.extras.dat = assets.bwDat.units[unitData.typeId];
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
          getImageLoOffset(unit.extras.turretLo, viewports.primaryViewport.camera.userData.direction, unitData.owSprite.mainImage, 0);
        } else {
          unit.extras.turretLo = null;
        }

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

      if (fogOfWar.isVisible(floor32(x), floor32(y)) && typeId !== 0) {
        buildSound(elapsed, x, y, typeId, unitTypeId, pxToGameUnit, terrain, viewports.audio, viewports.primaryViewport.projectedView, soundChannels, mixer);
      }
    }

  };

  const _tiles = new TilesBufferView(TilesBufferView.STRUCT_SIZE, 0, 0, openBW.HEAPU8);
  const buildCreep = (frame: number) => {
    _tiles.ptrIndex = openBW.getTilesPtr();
    _tiles.itemsCount = openBW.getTilesSize();
    creep.generate(_tiles, frame);
    creep.creepValuesTexture.needsUpdate = true;
    creep.creepEdgesValuesTexture.needsUpdate = true;
  };

  scene.add(...selectionObjects);

  class DeadTargetSource {
    x = 0;
    y = 0;
    statusFlags = 0;
    copy(b: { x: number, y: number, statusFlags: number }) {
      this.x = b.x;
      this.y = b.y;
      this.statusFlags = b.statusFlags;
    }
  }

  // track bullet targets because they can die and that makes us sad :(
  const deadTargetSource = new FreeMap<number, { sourceUnit: DeadTargetSource, targetUnit: DeadTargetSource }>(() => ({
    sourceUnit: new DeadTargetSource,
    targetUnit: new DeadTargetSource,
  }));

  const getWorldYPosition = (worldX: number, worldZ: number, isFlying?: boolean) => {
    let y = terrain.getTerrainY(worldX, worldZ);
    return isFlying ? y / terrain.geomOptions.maxTerrainHeight + terrain.geomOptions.maxTerrainHeight + 1 : y
  }

  const getWorldSpriteY = (sprite: { x: number, y: number }, isFlying?: boolean) => {
    const worldX = pxToGameUnit.x(sprite.x);
    const worldZ = pxToGameUnit.y(sprite.y);
    return getWorldYPosition(worldX, worldZ, isFlying);
  }

  const getWorldSpriteVectorsFromXY = (x: number, y: number, v: Vector3, isFlying?: boolean) => {
    const worldX = pxToGameUnit.x(x);
    const worldZ = pxToGameUnit.y(y);
    v.set(worldX, getWorldYPosition(worldX, worldZ, isFlying), worldZ);
  }
  const getWorldSpriteVectors = (sprite: { x: number, y: number }, v: Vector3, isFlying?: boolean) => {
    getWorldSpriteVectorsFromXY(sprite.x, sprite.y, v, isFlying);
  }

  const staticTargetYBullets = [WeaponBehavior.AppearOnTargetUnit, WeaponBehavior.AppearOnTargetPosition, WeaponBehavior.PersistOnTargetPos];
  const staticSourceYBullets = [WeaponBehavior.AppearOnSourceUnit, WeaponBehavior.SelfDestruct];
  const dynamicYBullets = [WeaponBehavior.Fly, WeaponBehavior.ExtendToMaxRange, WeaponBehavior.FollowTarget, WeaponBehavior.Bounce]

  const _spriteVector3 = new Vector3();
  const _spriteVector2 = new Vector2();
  const _destBulletVector2 = new Vector2();
  const _destBulletVector3 = new Vector3();
  const _sourceBulletVector3 = new Vector3();
  const _sourceBulletVector2 = new Vector2();
  let _bulletTargetUnit: UnitsBufferView | DeadTargetSource | undefined;
  let _bulletSourceUnit: UnitsBufferView | DeadTargetSource | undefined;
  let _bulletTargetPos = new Vector2();

  const buildSprite = (spriteData: SpritesBufferView, _: number, bullet?: BulletsBufferView, weapon?: WeaponDAT) => {

    const unit = sprites.getUnit(spriteData.index);
    let sprite = sprites.getOrCreate(spriteData.index, spriteData.typeId);

    const dat = assets.bwDat.sprites[spriteData.typeId];

    // doodads and resources are always visible
    // show units as fog is lifting from or lowering to explored
    // show if a building has been explored
    let spriteIsVisible =
      spriteData.owner === 11 ||
      imageIsDoodad(dat.image) ||
      fogOfWar.isSomewhatVisible(floor32(spriteData.x), floor32(spriteData.y));

    // sprites may be hidden (eg training units, flashing effects, iscript tmprmgraphicstart/end)
    if (spriteIsHidden(spriteData) || (unit && viewports.onShouldHideUnit(unit))) {
      spriteIsVisible = false;
    }
    sprite.visible = spriteIsVisible;
    sprite.userData.renderOrder = spriteSortOrder(spriteData as SpriteStruct);

    getWorldSpriteVectors(spriteData, _spriteVector3, unit && unitIsFlying(unit));
    let bulletY: number | undefined;

    const player = players.playersById[spriteData.owner];

    if (bullet && bullet.spriteIndex !== 0 && weapon && spriteIsVisible) {

      if (bullet.state === BulletState.Dying) {
        viewports.doShakeCalculation(weapon.explosionType, weapon.damageType, _spriteVector3);
      }

      _bulletSourceUnit = bullet.ownerUnit ?? bullet.prevBounceUnit ?? deadTargetSource.maybe(bullet.index)?.sourceUnit;
      _bulletTargetUnit = bullet.targetUnit ?? deadTargetSource.maybe(bullet.index)?.targetUnit;
      _bulletTargetPos.set(bullet.targetPosX, bullet.targetPosY);

      if (bullet.ownerUnit || bullet.prevBounceUnit) {
        deadTargetSource.get(bullet.index).sourceUnit.copy(bullet.ownerUnit ?? bullet.prevBounceUnit!);
      }

      if (bullet.targetUnit) {
        deadTargetSource.get(bullet.index).targetUnit.copy(bullet.targetUnit);
      }

      // do this based on state instead? Since we probably want to use
      // flingy move target instead of bullet target in some cases
      if (staticSourceYBullets.includes(weapon.weaponBehavior)) {
        bulletY = _bulletSourceUnit ? getWorldSpriteY(_bulletSourceUnit, unitIsFlying(_bulletSourceUnit)) : _spriteVector3.y;
      } else if (dynamicYBullets.includes(weapon.weaponBehavior) || staticTargetYBullets.includes(weapon.weaponBehavior)) {

        // if (_bulletTargetUnit) {
        //   _bulletTargetPos.set(_bulletTargetUnit.x, _bulletTargetUnit.y);
        // }

        bulletY = getWorldSpriteY(_bulletTargetPos, _bulletTargetUnit ? unitIsFlying(_bulletTargetUnit) : false);

        if (dynamicYBullets.includes(weapon.weaponBehavior) && _bulletSourceUnit) {

          getWorldSpriteVectors(_bulletTargetPos.set(bullet.nextMovementWaypointX, bullet.nextMovementWaypointY), _destBulletVector3, _bulletTargetUnit ? unitIsFlying(_bulletTargetUnit) : false);

          getWorldSpriteVectors(_bulletSourceUnit, _sourceBulletVector3, unitIsFlying(_bulletSourceUnit));

          _destBulletVector2.set(_destBulletVector3.x, _destBulletVector3.z);
          _sourceBulletVector2.set(_sourceBulletVector3.x, _sourceBulletVector3.z);

          const sourceToTargetDistance = _sourceBulletVector2.distanceTo(_destBulletVector2);
          const bulletToTargetDistance = pxToGameUnit.xy(bullet.x, bullet.y, _spriteVector2).distanceTo(_destBulletVector2);

          //TODO: figure out why bulletToTargetDistance > sourceToTargetDistance in some cases, which is why we need the Math.min hack
          bulletY = MathUtils.lerp(_destBulletVector3.y, _sourceBulletVector3.y, Math.min(1, bulletToTargetDistance / sourceToTargetDistance));

        }

      } else {
        console.warn("Unknown bullet behavior", weapon.weaponBehavior);
      }

    }

    sprite.position.set(_spriteVector3.x, (sprites.getParent(spriteData.index)?.position.y ?? bulletY ?? _spriteVector3.y), _spriteVector3.z);
    sprite.updateMatrix();
    sprite.matrixWorld.copy(sprite.matrix);
    // sprite.updateMatrixWorld();

    let imageCounter = 1;
    overlayEffectsMainImage.setEmissive = null
    overlayEffectsMainImage.is3dAsset = false;

    for (const imgAddr of spriteData.images.reverse()) {
      const imageData = imageBufferView.get(imgAddr);

      let image = images.getOrCreate(imageData.index, imageData.typeId);
      if (!image) {
        continue;
      }

      // only draw shadow if main image is not 3d
      const drawShadow = image.dat.drawFunction !== drawFunctions.rleShadow || image.dat.drawFunction === drawFunctions.rleShadow && !viewports.primaryViewport?.renderMode3D;

      image.visible = spriteIsVisible && !imageIsHidden(imageData as ImageStruct) && drawShadow;
      image.matrixWorldNeedsUpdate = false;

      if (image.visible) {
        image.matrixWorldNeedsUpdate = imageNeedsRedraw(imageData as ImageStruct);
        image.setTeamColor(player?.color);
        image.setModifiers(imageData.modifier, imageData.modifierData1, imageData.modifierData2);
        image.position.set(0, 0, 0)
        image.rotation.set(0, 0, 0);

        //overlay offsets typically
        if (image instanceof ImageHD) {
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
        }

        // if we're a shadow, we act independently from a sprite since our Y coordinate
        // needs to be in world space
        image.renderOrder = imageCounter;
        if (image.isInstanced) {
          if (image.parent !== sprites.group) {
            sprites.group.add(image);
          }
        } else {
          if (image.parent !== sprite) {
            sprite.add(image);
          }
        }

        // if it's directional we'll set it elsewhere relative to the viewport camera direction
        if (!imageHasDirectionalFrames(imageData as ImageStruct)) {
          image.setFrame(imageData.frameIndex, imageIsFlipped(imageData as ImageStruct));
        }

        if (imageData.index === spriteData.mainImageIndex) {
          if (image instanceof Image3D) {
            //TODO: change this since its creating a function object every frame
            overlayEffectsMainImage.setEmissive = image.setEmissive.bind(image);
            overlayEffectsMainImage.is3dAsset = true;
          }

          if (unit) {
            // only rotate if we're 3d and the frame is part of a frame set
            image.rotation.y = image instanceof Image3D && !image.isLooseFrame ? getAngle(unit.direction) : 0;
            images.setUnit(image, unit);
          }
        }
      }


      if (image instanceof ImageHD) {

        applyOverlayEffectsToImageHD(imageBufferView, image);

      } else if (image instanceof Image3D) {

        applyOverlayEffectsToImage3D(imageBufferView, image);

      }

      if (image instanceof ImageHDInstanced) {
        image.updateInstanceMatrix(sprite.matrixWorld);
      } else if (image instanceof ImageHD) {
        image.updateMatrixPosition(sprite.position);
      } else if (image instanceof Image3D) {
        image.updateMatrix();
        image.updateMatrixWorld();
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

    sprites.updateLinkedSprites();

    // avoid image flashing 
    // we clear the group here rather than on the reset event
    if (_wasReset) {
      sprites.group.clear();
      _wasReset = false;
    }

    for (let i = 0; i < deletedSpriteCount; i++) {
      sprites.free(openBW.HEAP32[(deletedSpriteAddr >> 2) + i]);
    }

    for (let i = 0; i < deleteImageCount; i++) {
      images.free(openBW.HEAP32[(deletedImageAddr >> 2) + i]);
    }

    for (let i = 0; i < openBW.getBulletsDeletedCount(); i++) {
      deadTargetSource.delete(openBW.HEAP32[(openBW.getBulletsDeletedAddress() >> 2) + i]);
    }

    // build bullet sprites first since they need special Y calculations
    bulletList.addr = openBW.getBulletsAddress();
    _ignoreSprites.length = 0;
    for (const bulletAddr of bulletList) {
      if (bulletAddr === 0) continue;

      const bullet = bulletBufferView.get(bulletAddr);
      const weapon = assets.bwDat.weapons[bullet.weaponTypeId];

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

  };


  let _spriteIteratorResult: {
    bufferView: SpritesBufferView,
    object: SpriteType
  }

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
        const bufferView = spriteBufferView.get(spriteAddr);
        const object = sprites.get(bufferView.index);

        if (object) {
          if (!_spriteIteratorResult) {
            _spriteIteratorResult = {
              bufferView,
              object
            }
          } else {
            _spriteIteratorResult.bufferView = bufferView;
            _spriteIteratorResult.object = object;
          }
          yield _spriteIteratorResult;
        }
      }
    }
  }

  let _imageIteratorResult: {
    bufferView: ImageBufferView,
    object: ImageBase
  }

  function* spriteImageIterator(spriteData: SpritesBufferView) {
    for (const imgAddr of spriteData.images.reverse()) {
      const bufferView = imageBufferView.get(imgAddr);
      const object = images.get(bufferView.index);

      if (object) {
        if (!_imageIteratorResult) {
          _imageIteratorResult = {
            bufferView,
            object
          }
        } else {
          _imageIteratorResult.bufferView = bufferView;
          _imageIteratorResult.object = object;
        }
        yield _imageIteratorResult;
      }
    }
  }

  const minimapGraphics = new MinimapGraphics(mapWidth, mapHeight, terrainExtra.minimapBitmap);

  renderComposer.targetSurface = gameSurface;

  const _target = new Vector3;

  let delta = 0;
  let lastElapsed = 0;

  let cmds = commandsStream.generate();
  const _commandsThisFrame: any[] = [];
  let cmd = cmds.next();

  let _halt = false;

  const GAME_LOOP = (elapsed: number) => {
    delta = elapsed - lastElapsed;
    lastElapsed = elapsed;
    if (_halt || !viewports.primaryViewport) return;

    for (const viewport of viewports.viewports) {
      if (!viewport.freezeCamera) {
        viewport.orbit.update(delta / 1000);
      }
      viewport.orbit.getTarget(_target);
      viewport.projectedView.update(viewport.camera, _target);
    }

    cameraMouse.update(delta / 100, elapsed, viewports);
    cameraKeys.update(delta / 100, elapsed, viewports);
    minimapMouse.update(viewports);

    if (reset) {
      reset();
    }

    currentBwFrame = openBW.nextFrame(false);
    if (currentBwFrame !== previousBwFrame) {

      if (currentBwFrame % 24 === 0) {
        updateCompletedUpgrades(openBW, assets.bwDat, currentBwFrame);
      }
      buildSounds(elapsed);
      buildCreep(currentBwFrame);
      buildUnits();
      buildMinimap();
      buildSprites(delta);
      updateSelectionGraphics(viewports.primaryViewport.camera, sprites);

      fogOfWar.texture.needsUpdate = true;

      const audioPosition = viewports.onUpdateAudioMixerLocation(delta, elapsed);
      mixer.updateFromVector3(audioPosition as Vector3, delta);

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

      minimapGraphics.drawMinimap(minimapSurface, mapWidth, mapHeight, creep.minimapImageData, !fogOfWar.enabled ? 0 : fogOfWarEffect.opacity, viewports);
    }

    plugins.onBeforeRender(delta, elapsed);
    fogOfWar.update(players.getVisionFlag());

    // global won't use camera so we can set it to any
    for (const v of viewports.activeViewports()) {

      if (v === viewports.primaryViewport) {

        minimapGraphics.syncFOWBuffer(fogOfWar.buffer)
        if (v.needsUpdate) {
          initializeRenderMode(v.renderMode3D);
          v.needsUpdate = false;
        }

        v.orbit.getTarget(_target);
        _target.setY(terrain.getTerrainY(_target.x, _target.z));
        globalEffectsBundle.updateExtended(v.camera, _target)

      }

      v.updateCamera(session.getState().game.dampingFactor, delta);
      updateSpritesForViewport(v.camera.userData.direction, v.renderMode3D, spriteIterator, spriteImageIterator);
      v.shakeStart(elapsed, session.getState().game.cameraShakeStrength);
      globalEffectsBundle.updateCamera(v.camera)
      renderComposer.setBundlePasses(globalEffectsBundle);
      renderComposer.render(delta, v.viewport);
      v.shakeEnd();

    }

    renderComposer.renderBuffer();
    cssScene.render(viewports.primaryViewport.camera);
    plugins.onRender(delta, elapsed);

  };

  janitor.mop(useSelectedUnitsStore.subscribe((state) => {
    plugins.callHook(HOOK_ON_UNITS_SELECTED, state.selectedUnits);
  }));

  let pluginsApiJanitor = new Janitor;

  const setupPlugins = async () => {
    const container = createCompartment(gameTimeApi);
    macros.setCreateCompartment((context?: any) => {
      container.globalThis.context = context;
      return container;
    });

    pluginsApiJanitor.mop(plugins.injectApi(gameTimeApi, macros));
    await plugins.callHookAsync(HOOK_ON_SCENE_READY);
  }

  await setupPlugins();

  const _onReloadPlugins = async () => {
    _halt = true;
    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    pluginsApiJanitor.dispose();
    await viewports.activate(null);
    await (settingsStore().load());
    await plugins.initializePluginSystem(true);
    await setupPlugins();
    await viewports.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!);
    renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);
    _halt = false;
  };

  janitor.on(ipcRenderer, RELOAD_PLUGINS, _onReloadPlugins);
  janitor.mop(listenToEvents(macros));

  janitor.mop(listenForNewSettings((mergeSettings, settings) => {
    session.getState().merge(mergeSettings.data!);
    if (settings.data.macros.revision !== macros.revision) {
      macros.deserialize(settings.data.macros);
    }
    macros.setHostDefaults(settings.data);

    if (mergeSettings.data?.graphics?.pixelRatio || mergeSettings.data?.game?.minimapSize) {
      _sceneResizeHandler()
    }
  }));

  janitor.mop(session.subscribe((newSettings) => {
    if (!viewports.disabled && viewports.activeSceneController && newSettings.game.sceneController !== viewports.activeSceneController?.name) {
      viewports.activate(plugins.getSceneInputHandler(newSettings.game.sceneController)!);
    }

    mixer.setVolumes(newSettings.audio);

    // Object.assign(session, newSettings);

  }));

  await viewports.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!, { target: pxToGameUnit.xyz(players[0].startLocation!.x, players[0].startLocation!.y, new Vector3, terrain.getTerrainY) });

  GAME_LOOP(0);
  //TODO: compile all scene postprocessing bundles
  renderComposer.compileScene(scene);
  _sceneResizeHandler();

  return {
    id: "@replay",
    dispose: () => {
      log.info("disposing replay viewer");
      _halt = true;
      renderComposer.getWebGLRenderer().setAnimationLoop(null);
      renderComposer.getWebGLRenderer().physicallyCorrectLights = false;
      resetCompletedUpgrades(0);
      plugins.disposeGame();
      pluginsApiJanitor.dispose();
      janitor.dispose();
    }, start: () => renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP)
  }
}