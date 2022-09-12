import { debounce } from "lodash";
import { Color, MathUtils, Object3D, PerspectiveCamera, Vector2, Vector3 } from "three";
import type Chk from "bw-chk";
import { mixer, Music } from "@audio"
import { drawFunctions, imageTypes, unitTypes } from "common/enums";
import {
  OpenBW,
  Settings,
} from "common/types";
import { floor32 } from "common/utils/conversions";
import { SpriteStruct, ImageStruct } from "common/types";
import {
  Players,
  ImageHD, Creep, FogOfWar, FogOfWarEffect, Image3D, BasePlayer
} from "@core";
import { getOpenBW } from "@openbw";
import { ImageBufferView, SpritesBufferView, TilesBufferView, IntrusiveList, UnitsBufferView, SpritesBufferViewIterator } from "@buffer-view";
import * as log from "@ipc/log";
import {
  renderComposer
} from "@render";
import { getImageLoOffset, imageIsDoodad, imageIsFrozen, imageIsHidden, imageNeedsRedraw } from "@utils/image-utils";
import { buildSound } from "@utils/sound-utils";
import { spriteIsHidden, spriteSortOrder } from "@utils/sprite-utils";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import settingsStore from "@stores/settings-store";
import CommandsStream from "@process-replay/commands/commands-stream";
import { unitIsFlying } from "@utils/unit-utils";
import { ipcRenderer } from "electron";
import { RELOAD_PLUGINS } from "common/ipc-handle-names";
import { selectionObjects as selectionMarkers, updateSelectionGraphics } from "../../core/selection-objects";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { MinimapGraphics } from "@render/minimap-graphics";
import { createSession } from "@core/session";
import { GameTimeApi } from "@core/game-time-api";
import { SpeedDirection, REPLAY_MAX_SPEED, REPLAY_MIN_SPEED, speedHandler } from "../../openbw/speed-controls";
import { ImageHDInstanced } from "@core/image-hd-instanced";
import { applyOverlayEffectsToImageHD, applyModelEffectsOnImage3d, applyViewportToFrameOnImageHD, overlayEffectsMainImage } from "@core/model-effects";
import { EffectivePasses, GlobalEffects } from "@render/global-effects";
import { createImageSelection } from "@input/create-image-selection";
import { AudioListener } from "three";
import { setDumpUnitCall } from "@plugins/plugin-system-ui";
import readCascFile from "@utils/casclib";
import { SessionChangeEvent } from "@stores/session/reactive-session-variables";
import shallow from "zustand/shallow";

export async function makeGameScene(
  map: Chk,
  janitor: Janitor,
  commandsStream: CommandsStream,
  onOpenBWReady: (openBW: OpenBW) => BasePlayer[],
) {

  const openBW = await getOpenBW();

  setDumpUnitCall((id) => openBW.get_util_funcs().dump_unit(id));

  await openBW.start(readCascFile);

  const basePlayers = onOpenBWReady(openBW);

  const assets = gameStore().assets!;

  const { sessionApi, callHook, callHookAsync, terrain, terrainExtra, images, units, selectedUnits, unitSelectionBox, sprites, scene,
    gameSurface, minimapMouse, cameraKeys, cameraMouse, cssScene, minimapSurface, pxToWorld, simpleText,
    sandboxApi, soundChannels, completedUpgrades, updateCompletedUpgrades,
    ...session } = janitor.mop(await createSession(openBW, assets, map));

  const sessionListener = ({ detail: { settings, rhs } }: SessionChangeEvent) => {

    // resize handler when? minimapSize?
    if (rhs.game?.minimapSize) {
      sceneResizeHandler();
    }

    mixer.setVolumes(settings.audio);

    if (viewports.activeSceneController) {

      if (rhs.game?.sceneController && rhs.game.sceneController !== viewports.activeSceneController.name) {
        setTimeout(() =>
          viewports.activate(session.getSceneInputHandler(settings.game.sceneController)!), 0);
      }

      if (viewports.primaryViewport.renderMode3D && rhs.postprocessing3d) {
        if (shallow(globalEffectsBundle.options, settings.postprocessing3d) === false) {
          initializeGlobalEffects(settings.postprocessing3d)
        }
      } else if (viewports.primaryViewport.renderMode3D === false && rhs.postprocessing) {
        if (shallow(globalEffectsBundle.options, settings.postprocessing) === false) {
          initializeGlobalEffects(settings.postprocessing)
        }
      }

    }

    if (rhs.game?.minimapEnabled && rhs.game.minimapEnabled !== settings.game.minimapEnabled) {
      minimapSurface.canvas.style.display = rhs.game.minimapEnabled ? "block" : "none";
      if (rhs.game.minimapEnabled) {
        minimapSurface.canvas.style.pointerEvents = "auto";
      }
    }

  };

  //@ts-ignore cant type EventTarget?
  sessionApi.events.addEventListener("change", sessionListener, { passive: true });
  //@ts-ignore cant type EventTarget?
  janitor.mop(() => sessionApi.events.removeEventListener("change", sessionListener));


  const music = janitor.mop(new Music(mixer as unknown as AudioListener));
  music.playGame();

  const fogOfWarEffect = janitor.mop(new FogOfWarEffect());
  const fogOfWar = new FogOfWar(scene.mapWidth, scene.mapHeight, openBW, fogOfWarEffect);

  const globalEffectsBundle = janitor.mop(
    new GlobalEffects(
      new PerspectiveCamera,
      scene,
      settingsStore().data.postprocessing,
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

  const initializeRenderMode = (renderMode3D: boolean) => {

    const postprocessing = renderMode3D ? sessionApi.getState().postprocessing3d : sessionApi.getState().postprocessing;

    terrain.setTerrainQuality(renderMode3D, postprocessing.anisotropy);
    scene.setBorderTileColor(renderMode3D ? 0xffffff : 0x999999);
    scene.sunlight.enabled = renderMode3D;
    images.use3dImages = renderMode3D;

    reset = refreshScene;

    initializeGlobalEffects(postprocessing);

  }

  const viewports = janitor.mop(new GameViewportsDirector(gameSurface));


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



  viewports.externalOnExitScene = session.onExitScene;

  viewports.beforeActivate = () => {

    sessionApi.sessionVars.game.minimapSize.setToDefault();
    sessionApi.sessionVars.game.minimapEnabled.setToDefault();

  }

  viewports.onActivate = (sceneController) => {

    const rect = gameSurface.getMinimapDimensions(sessionApi.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: sessionApi.getState().game.minimapEnabled === true ? rect.minimapHeight : 0,
    });

    unitSelectionBox.activate(sceneController.gameOptions?.allowUnitSelection, sceneController.viewports[0].camera)

    imageSelection.selectionBox.camera = sceneController.viewports[0].camera;
    _sceneResizeHandler();

    session.onEnterScene(sceneController);

  }

  // const _mouseXY = new Vector2();
  // if (viewports.primaryViewport && clicked?.z === 0) {
  //   _mouseXY.set(clicked.x, clicked.y);
  //   const intersections = RaycastHelper.intersectObject(terrain, true, viewports.primaryViewport.camera, _mouseXY);
  //   if (intersections.length) {
  //     console.log(intersections)
  //     scene.add(
  //       new Mesh(
  //         new SphereBufferGeometry(0.5).translate(intersections[0].point.x, intersections[0].point.y, intersections[0].point.z),
  //         new MeshBasicMaterial({ color: 0xff0000 })));
  //     console.log(intersections[0].point);
  //   }
  // }

  viewports.externalOnCameraMouseUpdate = () => { };
  viewports.externalOnDrawMinimap = () => { };
  viewports.externalOnCameraKeyboardUpdate = () => { };
  viewports.externalOnMinimapDragUpdate = () => { };

  const startLocations = map.units.filter((u) => u.unitId === unitTypes.startLocation);
  const players = janitor.mop(new Players(
    basePlayers,
    startLocations,
  ));


  // window.sandbox = sandbox;
  // window.o = session;

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
      map,
      scene,
      cssScene,
      assets,
      unitsIterator,
      get sandbox() {
        return sandboxApi;
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
      toggleFogOfWarByPlayerId(playerId: number) {
        if (players.toggleFogOfWarByPlayerId(playerId)) {
          fogOfWar.forceInstantUpdate = true;
        }
      },
      //todo deprecate
      get cameraMovementSpeed() {
        return sessionApi.getState().game.movementSpeed;
      },
      get cameraRotateSpeed() {
        return sessionApi.getState().game.rotateSpeed;
      },
      get cameraZoomLevels() {
        return sessionApi.getState().game.zoomLevels;
      },
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
      get currentFrame() {
        return currentBwFrame;
      },
      gotoFrame: (frame: number) => {
        openBW.setCurrentFrame(frame);
        reset = refreshScene;
      },
      exitScene: () => {
        setTimeout(() => {

          sessionApi.sessionVars.game.sceneController.setToDefault();
          // session.getState().merge({
          //   game: {
          //     sceneController: settingsStore().data.game.sceneController
          //   }
          // });
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
      // get followedUnitsPosition() {
      //   if (!hasFollowedUnits()) {
      //     return null;
      //   }
      //   return calculateFollowedUnitsTarget(pxToWorld);
      // },

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
      //todo: deprecate
      changeRenderMode: (renderMode3D?: boolean) => {
        viewports.primaryViewport.renderMode3D = renderMode3D ?? !viewports.primaryViewport.renderMode3D;
        // initializeRenderMode(viewports.primaryViewport.renderMode3D)
      }
    }
  })();

  session.initializeContainer(gameTimeApi);

  let reset: (() => void) | null = null;
  let _wasReset = false;


  const refreshScene = () => {

    cmds = commandsStream.generate();
    cmd = cmds.next();
    globalEffectsBundle.clearBloomSelection();

    session.onFrameReset(openBW.getCurrentFrame());

    previousBwFrame = -1;
    reset = null;
    _wasReset = true;
  }

  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight, settingsStore().data.graphics.pixelRatio);

    const rect = gameSurface.getMinimapDimensions(sessionApi.getState().game.minimapSize);
    gameStore().setDimensions({
      minimapWidth: rect.minimapWidth,
      minimapHeight: sessionApi.getState().game.minimapEnabled ? rect.minimapHeight : 0,
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

  //TODO move to terrain generator
  const creep = janitor.mop(new Creep(
    scene.mapWidth,
    scene.mapHeight,
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

    // if (unit.extras.selected &&
    //   (unit.order === orders.die ||
    //     unit.order === orders.harvestGas ||
    //     (unit.statusFlags & UnitFlags.Loaded) !== 0 ||
    //     (unit.statusFlags & UnitFlags.InBunker) !== 0)) {
    //   selectedUnitsStore().removeUnit(unit);
    // }

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

  //TODO move to sound buffer / iterator pattern
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

  const minimapGraphics = new MinimapGraphics(scene.mapWidth, scene.mapHeight, terrainExtra.minimapBitmap);

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
        viewport.projectedView.update(viewport.camera, viewport.orbit.getTarget(_target));
      }

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

        updateCompletedUpgrades(currentBwFrame);

      }

      buildSounds(elapsed);
      buildCreep(currentBwFrame);
      buildUnits();
      buildMinimap();
      buildSprites(delta);
      updateSelectionGraphics(viewports.primaryViewport.camera, sprites, completedUpgrades, selectedUnits.values());

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

      session.onFrame(currentBwFrame, _commandsThisFrame);

      //TODO: move to sessionONFRAMR
      minimapGraphics.drawMinimap(minimapSurface, scene.mapWidth, scene.mapHeight, creep.minimapImageData, !fogOfWar.enabled ? 0 : fogOfWarEffect.opacity, viewports);

      previousBwFrame = currentBwFrame;


    }

    session.onBeforeRender(delta, elapsed);

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

      v.updateCamera(sessionApi.getState().game.dampingFactor, delta);
      v.shakeStart(elapsed, sessionApi.getState().game.cameraShakeStrength);
      globalEffectsBundle.updateCamera(v.camera)
      renderComposer.setBundlePasses(globalEffectsBundle);
      renderComposer.render(delta, v.viewport);
      v.shakeEnd();

    }

    renderComposer.renderBuffer();
    cssScene.render(viewports.primaryViewport.camera);
    session.onRender(delta, elapsed);

  };

  // janitor.mop(useSelectedUnitsStore.subscribe((state) => {
  //   plugins.callHook(HOOK_ON_UNITS_SELECTED, state.selectedUnits);
  // }));

  let pluginsApiJanitor = new Janitor;

  const _onReloadPlugins = async () => {

    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    await viewports.activate(null);
    await (settingsStore().load());
    await session.reloadPlugins();
    session.initializeContainer(gameTimeApi);
    await viewports.activate(session.getSceneInputHandler(sessionApi.getState().game.sceneController)!);
    await session.onSceneReady();
    renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);

  };

  janitor.on(ipcRenderer, RELOAD_PLUGINS, _onReloadPlugins);


  await viewports.activate(session.getSceneInputHandler(settingsStore().data.game.sceneController)!, { target: pxToWorld.xyz(startLocations[0].x, startLocations[0].y, new Vector3) });

  GAME_LOOP(0);
  //TODO: compile all scene postprocessing bundles
  renderComposer.compileScene(scene);
  _sceneResizeHandler();

  await session.onSceneReady();

  renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP)

  return () => {

    log.info("disposing replay viewer");
    janitor.dispose();
    pluginsApiJanitor.dispose();

    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    renderComposer.getWebGLRenderer().physicallyCorrectLights = false;

  }
}