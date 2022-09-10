import { debounce } from "lodash";
import { Color, MathUtils, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, SphereBufferGeometry, Vector2, Vector3 } from "three";
import type Chk from "bw-chk";
import { mixer, Music } from "@audio"
import { drawFunctions, imageTypes, orders, UnitFlags, unitTypes } from "common/enums";
import { Surface } from "@image";
import {
  OpenBW,
  Settings,
  UnitTileScale,
} from "common/types";
import { makePxToWorld, floor32 } from "common/utils/conversions";
import { SpriteStruct, ImageStruct } from "common/types";
import { SoundChannels } from "@audio";
import {
  Players,
  ImageHD, Creep, FogOfWar, FogOfWarEffect, Image3D, Unit, BasePlayer
} from "@core";
import {
  MinimapMouse, CameraMouse, CameraKeys, createUnitSelection
} from "@input";
import { getOpenBW } from "@openbw";
import { ImageBufferView, SpritesBufferView, TilesBufferView, IntrusiveList, UnitsBufferView, SpritesBufferViewIterator } from "@buffer-view";
import * as log from "@ipc/log";
import {
  GameSurface, renderComposer, SimpleText, BaseScene
} from "@render";
import { getImageLoOffset, imageIsDoodad, imageIsFrozen, imageIsHidden, imageNeedsRedraw } from "@utils/image-utils";
import { buildSound } from "@utils/sound-utils";
import { spriteIsHidden, spriteSortOrder } from "@utils/sprite-utils";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import * as plugins from "@plugins";
import settingsStore from "@stores/settings-store";
import CommandsStream from "@process-replay/commands/commands-stream";
import { HOOK_ON_FRAME_RESET, HOOK_ON_SCENE_READY, HOOK_ON_UNITS_SELECTED } from "@plugins/hooks";
import { canSelectUnit, unitIsFlying } from "@utils/unit-utils";
import { ipcRenderer } from "electron";
import { CLEAR_ASSET_CACHE, RELOAD_PLUGINS } from "common/ipc-handle-names";
import selectedUnitsStore, { useSelectedUnitsStore } from "@stores/selected-units-store";
import { selectionObjects as selectionMarkers, updateSelectionGraphics } from "./selection-objects";
import { Macros } from "@macros/macros";
import { createCompartment } from "@utils/ses-util";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { MinimapGraphics } from "@render/minimap-graphics";
import { createSession, listenForNewSettings } from "@stores/session-store";
import { chkToTerrainMesh } from "@image/generate-map/chk-to-terrain-mesh";
import { calculateFollowedUnitsTarget, clearFollowedUnits, followUnits, hasFollowedUnits } from "./followed-units";
import { resetCompletedUpgrades, updateCompletedUpgrades } from "./completed-upgrades";
import { ImageEntities } from "./image-entities";
import { SpriteEntities } from "./sprite-entities";
import { CssScene } from "./css-scene";
import { listenToEvents } from "@utils/macro-utils";
import { UnitEntities } from "./unit-entities";
import { GameTimeApi } from "./game-time-api";
import { SpeedDirection, REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, speedHandler } from "./speed-controls";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { applyOverlayEffectsToImageHD, applyModelEffectsOnImage3d, applyViewportToFrameOnImageHD, overlayEffectsMainImage } from "@core/model-effects";
import { EffectivePasses, GlobalEffects } from "@render/global-effects";
import { createImageSelection } from "@input/create-image-selection";
import { createSandboxApi } from "./sandbox-api";
import { RaycastHelper } from "@core/terrain-intersection";
import { AudioListener } from "three";
import { setDumpUnitCall } from "@plugins/plugin-system-ui";
import readCascFile from "@utils/casclib";

export async function makeGameScene(
  map: Chk,
  janitor: Janitor,
  commandsStream: CommandsStream,
  onOpenBWReady: (openBW: OpenBW) => BasePlayer[],
) {

  const assets = gameStore().assets!;


  const { terrain, terrainExtra } = await chkToTerrainMesh(
    map, UnitTileScale.HD,
  );

  const openBW = await getOpenBW();

  setDumpUnitCall((id) => openBW.get_util_funcs().dump_unit(id));

  await openBW.start(readCascFile);

  const basePlayers = onOpenBWReady(openBW);

  openBW.uploadHeightMap(terrainExtra.heightMaps.singleChannel, terrainExtra.heightMaps.displacementImage.width, terrainExtra.heightMaps.displacementImage.height);

  openBW.setGameSpeed(1);
  openBW.setPaused(false);

  const session = createSession(settingsStore().data, basePlayers, openBW);

  const macros = new Macros(session);
  macros.deserialize(settingsStore().data.macros);

  const soundChannels = new SoundChannels();
  const music = janitor.mop(new Music(mixer as unknown as AudioListener));
  music.playGame();


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
  const pxToWorld = makePxToWorld(mapWidth, mapHeight, terrain.getTerrainY);

  const minimapMouse = janitor.mop(new MinimapMouse(
    minimapSurface,
    mapWidth,
    mapHeight,
    () => {
      clearFollowedUnits();
    }
  ));

  const cameraMouse = janitor.mop(new CameraMouse(document.body));

  const cameraKeys = janitor.mop(new CameraKeys(document.body, () => {
    if (hasFollowedUnits()) {
      clearFollowedUnits();
    } else if (selectedUnitsStore().selectedUnits.length) {
      followUnits(selectedUnitsStore().selectedUnits);
    }
  }));

  const scene = janitor.mop(new BaseScene(map.size[0], map.size[1], terrain));

  scene.background = assets.skyBox;
  scene.environment = assets.envMap;

  const units = new UnitEntities

  const sprites = new SpriteEntities();
  scene.add(sprites.group);

  const images = janitor.mop(new ImageEntities);
  ipcRenderer.on(CLEAR_ASSET_CACHE, () => {
    assets.resetAssetCache();
    images.dispose();
    reset = refreshScene;
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
    if (globalEffectsBundle.debugSelection)
      globalEffectsBundle.debugSelection.delete(image);
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

  const _imageDebug: Partial<ImageStruct> = {};
  const imageSelection = janitor.mop(createImageSelection(scene, gameSurface, minimapSurface, (objects) => {

    if (globalEffectsBundle.debugSelection) {
      globalEffectsBundle.debugSelection!.clear();

      for (const object of objects) {
        if (object instanceof ImageHD || object instanceof Object3D) {
          console.log(object, imageBufferView.get(object.userData.imageAddress).copy(_imageDebug));
          globalEffectsBundle.debugSelection!.add(object);
        }
      }

    }

  }));


  const unitSelection = janitor.mop(createUnitSelection(scene, gameSurface, minimapSurface, (object) => _getSelectionUnit(object)));

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
    unitSelection.onSelectedUnitsChange = (units) => {
      console.log(units)
    }

    imageSelection.selectionBox.camera = sceneController.viewports[0].camera;
    _sceneResizeHandler();
  }

  const _mouseXY = new Vector2();
  viewports.onCameraMouseUpdateCallback = (delta, elapsed, scrollY, screenDrag, lookAt, mouse, clientX, clientY, clicked) => {
    if (viewports.primaryViewport && clicked?.z === 0) {
      _mouseXY.set(clicked.x, clicked.y);
      const intersections = RaycastHelper.intersectObject(terrain, true, viewports.primaryViewport.camera, _mouseXY);
      if (intersections.length) {
        console.log(intersections)
        scene.add(
          new Mesh(
            new SphereBufferGeometry(0.5).translate(intersections[0].point.x, intersections[0].point.y, intersections[0].point.z),
            new MeshBasicMaterial({ color: 0xff0000 })));
        console.log(intersections[0].point);
      }
    }
  };

  const startLocations = map.units.filter((u) => u.unitId === unitTypes.startLocation);
  const players = janitor.mop(new Players(
    basePlayers,
    startLocations,
  ));

  const sandbox = createSandboxApi(openBW, makePxToWorld(mapWidth, mapHeight, terrain.getTerrainY, true));
  window.sandbox = sandbox;

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
      get sandbox() {
        return sandbox;
      },
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
      speedUp: () => speedHandler(SpeedDirection.Up, openBW),
      speedDown: () => speedHandler(SpeedDirection.Down, openBW),
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
      pxToGameUnit: pxToWorld,
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
      getPlayers: () => [...basePlayers.map(p => ({ ...p }))],
      get followedUnitsPosition() {
        if (!hasFollowedUnits()) {
          return null;
        }
        return calculateFollowedUnitsTarget(pxToWorld);
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
      deselectUnits() {
        selectedUnitsStore().setSelectedUnits([]);
      },
      get selectedUnits() {
        return selectedUnitsStore().selectedUnits
      },

      // fadingPointers,
      playSound: (typeId: number, volumeOrX?: number, y?: number, unitTypeId = -1) => {
        if (y !== undefined && volumeOrX !== undefined) {
          buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, pxToWorld, viewports.audio, viewports.primaryViewport.projectedView, soundChannels, mixer);
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
    globalEffectsBundle.clearBloomSelection();

    const frame = openBW.getCurrentFrame();

    // remove any upgrade or tech that is no longer available
    resetCompletedUpgrades(frame);
    plugins.callHook(HOOK_ON_FRAME_RESET, frame);
    previousBwFrame = -1;
    reset = null;
    _wasReset = true;
  }

  janitor.mop(() => resetCompletedUpgrades(0));


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

  const buildUnit = (unitData: UnitsBufferView) => {
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
        buildUnit(unitBufferView.get(unitAddr));
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
        buildSound(elapsed, x, y, typeId, unitTypeId, pxToWorld, viewports.audio, viewports.primaryViewport.projectedView, soundChannels, mixer);
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

  scene.add(...selectionMarkers);

  let _spriteY = 0;

  const buildSprite = (spriteData: SpritesBufferView, _: number) => {

    const unit = sprites.getUnit(spriteData.index);
    let sprite = sprites.getOrCreate(spriteData.index, spriteData.typeId);

    const dat = assets.bwDat.sprites[spriteData.typeId];
    const player = players.playersById[spriteData.owner];

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
    sprite.renderOrder = viewports.primaryViewport.renderMode3D ? 0 : spriteSortOrder(spriteData as SpriteStruct);

    _spriteY = spriteData.extYValue + (spriteData.extFlyOffset * 1);
    _spriteY = _spriteY * terrain.geomOptions.maxTerrainHeight + 0.1;

    if (sprite.userData.isNew || !unit || !unitIsFlying(unit)) {
      sprite.position.set(pxToWorld.x(spriteData.x), _spriteY, pxToWorld.y(spriteData.y))
      sprite.userData.isNew = false;
    } else {
      _spriteY = MathUtils.damp(sprite.position.y, _spriteY, 0.001, delta);
      sprite.position.set(pxToWorld.x(spriteData.x), _spriteY, pxToWorld.y(spriteData.y))
    }

    sprite.updateMatrix();
    sprite.matrixWorld.copy(sprite.matrix);

    let imageCounter = 1;
    overlayEffectsMainImage.image = null

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

      // if (image.visible) {
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

      image.renderOrder = imageCounter;

      // if we're a shadow, we act independently from a sprite since our Y coordinate
      // needs to be in world space
      if (image.isInstanced) {
        if (image.parent !== sprites.group) {
          sprites.group.add(image);
        }
      } else {
        if (image.parent !== sprite) {
          sprite.add(image);
        }
      }

      if (imageData.index === spriteData.mainImageIndex) {

        if (image instanceof Image3D) {
          overlayEffectsMainImage.image = image;
        }

        if (unit) {
          // only rotate if we're 3d and the frame is part of a frame set
          images.setUnit(image, unit);
        }

      }

      //debug
      image.userData.imageAddress = imageData._address;

      if (image instanceof ImageHD) {

        applyViewportToFrameOnImageHD(imageData, image, viewports.primaryViewport);
        applyOverlayEffectsToImageHD(imageData, image);

      } else if (image instanceof Image3D) {

        applyModelEffectsOnImage3d(imageData, image, unit);

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

  const spritesIterator = new SpritesBufferViewIterator(openBW);
  const imageBufferView = new ImageBufferView(openBW);

  const buildSprites = (delta: number) => {
    const deleteImageCount = openBW._counts(15);
    const deletedSpriteCount = openBW._counts(16);
    const deletedImageAddr = openBW._get_buffer(3);
    const deletedSpriteAddr = openBW._get_buffer(4);

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

    for (const sprite of spritesIterator) {

      buildSprite(sprite, delta);

    }

  };

  const minimapGraphics = new MinimapGraphics(mapWidth, mapHeight, terrainExtra.minimapBitmap);

  renderComposer.targetSurface = gameSurface;

  const _target = new Vector3;

  let delta = 0;
  let lastElapsed = 0;

  let cmds = commandsStream.generate();
  const _commandsThisFrame: any[] = [];
  let cmd = cmds.next();

  const GAME_LOOP = (elapsed: number) => {

    delta = elapsed - lastElapsed;
    lastElapsed = elapsed;
    if (!viewports.primaryViewport) return;

    for (const viewport of viewports.activeViewports()) {

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

    currentBwFrame = openBW.nextFrame();

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

      } else {
        // iterate all images again and update image frames according to different view camera
        //TODO: iterate over image objects and add image address to get buffer view
        for (const spriteBuffer of spritesIterator) {

          const object = sprites.get(spriteBuffer.index);
          if (!object || object.visible === false) continue;

          object.renderOrder = v.renderMode3D ? 0 : spriteSortOrder(spriteBuffer as SpriteStruct);

          for (const imgAddr of spriteBuffer.images.reverse()) {

            const imageBuffer = imageBufferView.get(imgAddr);
            const image = images.get(imageBuffer.index);

            if (image instanceof ImageHD) {
              applyViewportToFrameOnImageHD(imageBuffer, image, v);
            }

          }
        }
      }

      v.updateCamera(session.getState().game.dampingFactor, delta);
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
    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    pluginsApiJanitor.dispose();
    await viewports.activate(null);
    await (settingsStore().load());
    await plugins.initializePluginSystem(true);
    await setupPlugins();
    await viewports.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!);
    renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);
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
      sceneResizeHandler()
    }

    if (mergeSettings?.data?.audio) {
      mixer.setVolumes(settings.data.audio);
    }

  }));

  janitor.mop(session.subscribe((newSettings) => {
    if (!viewports.disabled && viewports.activeSceneController && newSettings.game.sceneController !== viewports.activeSceneController?.name) {
      viewports.activate(plugins.getSceneInputHandler(newSettings.game.sceneController)!);
    }
  }));

  await viewports.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!, { target: pxToWorld.xyz(startLocations[0].x, startLocations[0].y, new Vector3) });

  GAME_LOOP(0);
  //TODO: compile all scene postprocessing bundles
  renderComposer.compileScene(scene);
  _sceneResizeHandler();

  renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP)

  return () => {

    log.info("disposing replay viewer");
    janitor.dispose();
    plugins.disposeGame();
    pluginsApiJanitor.dispose();

    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    renderComposer.getWebGLRenderer().physicallyCorrectLights = false;

  }
}