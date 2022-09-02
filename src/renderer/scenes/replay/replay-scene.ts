import { debounce } from "lodash";
import { Color, MathUtils, Object3D, PerspectiveCamera, Vector2, Vector3 } from "three";
import type Chk from "bw-chk";
import { mixer } from "@audio"
import { BulletState, drawFunctions, imageTypes, orders, UnitFlags, unitTypes, WeaponType } from "common/enums";
import { Surface } from "@image";
import {
  SpriteType,
  WeaponDAT
} from "common/types";
import { pxToMapMeter, floor32 } from "common/utils/conversions";
import { SpriteStruct, ImageStruct, UnitTileScale } from "common/types";
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
import { getImageLoOffset, imageHasDirectionalFrames, imageIsDoodad, imageIsFlipped, imageIsFrozen, imageIsHidden, imageNeedsRedraw, isGltfAtlas } from "@utils/image-utils";
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
import { RELOAD_PLUGINS } from "common/ipc-handle-names";
import selectedUnitsStore, { useSelectedUnitsStore } from "@stores/selected-units-store";
import { hideSelections, selectionObjects, updateSelectionGraphics } from "./selection-objects";
import FadingPointers from "@image/fading-pointers";
import { getPixelRatio, updatePostProcessingCamera } from "@utils/renderer-utils";
import { Macros } from "@macros/macros";
import { createCompartment } from "@utils/ses-util";
import { GameViewportsDirector } from "../../camera/game-viewport-director";
import { EffectPass, RenderPass } from "postprocessing";
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

  const players = janitor.add(new Players(
    replay.header.players,
    map.units.filter((u) => u.unitId === unitTypes.startLocation),
  ));
  const bwDat = assets.bwDat;

  const openBW = await getOpenBW();
  openBW.setGameSpeed(1);
  openBW.setPaused(false);

  const [mapWidth, mapHeight] = map.size;

  const cssScene = new CssScene;

  terrain.setAnisotropy(session.getState().graphics.anisotropy);
  terrainExtra.setCreepAnisotropy(session.getState().graphics.anisotropy);

  const gameSurface = janitor.add(new GameSurface(mapWidth, mapHeight));
  gameSurface.setDimensions(window.innerWidth, window.innerHeight, getPixelRatio(session.getState().graphics.pixelRatio));
  janitor.add(document.body.appendChild(gameSurface.canvas));
  gameStore().setDimensions(gameSurface.getMinimapDimensions(session.getState().game.minimapSize));

  const minimapSurface = janitor.add(new Surface({
    position: "absolute",
    bottom: "0",
    zIndex: "20"
  }));
  janitor.add(document.body.appendChild(minimapSurface.canvas));

  const simpleText = janitor.add(new SimpleText());
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const minimapMouse = janitor.add(new MinimapMouse(
    minimapSurface,
    mapWidth,
    mapHeight,
    () => {
      clearFollowedUnits();
    }
  ));

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  const cameraMouse = janitor.add(new CameraMouse(document.body));

  const cameraKeys = janitor.add(new CameraKeys(document.body, () => {
    if (hasFollowedUnits()) {
      clearFollowedUnits();
    } else if (selectedUnitsStore().selectedUnits.length) {
      followUnits(selectedUnitsStore().selectedUnits);
    }
  }));

  const units = new UnitEntities

  const sprites = new SpriteEntities;
  scene.add(sprites.group);

  const images = janitor.add(new ImageEntities);

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, openBW, new FogOfWarEffect());
  const renderPass = new RenderPass(scene, new PerspectiveCamera());

  const gameViewportsDirector = janitor.add(new GameViewportsDirector(gameSurface, {
    fogOfWarEffect: fogOfWar.effect,
    renderPass,
    effects: [fogOfWar.effect],
    passes: [renderPass, new EffectPass(new PerspectiveCamera(), fogOfWar.effect)],
  },
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

  const unitSelection = createUnitSelection( scene, gameSurface, minimapSurface, (object) => _getSelectionUnit(object));

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

    terrain.setTerrainQuality(gameViewportsDirector.viewports[0].spriteRenderOptions.rotateSprites);
    scene.sunlight.shadow.needsUpdate = true;
    renderComposer.getWebGLRenderer().shadowMap.needsUpdate = true;

    unitSelection.enabled = gameViewportsDirector.allowUnitSelection;
    unitSelection.selectionBox.camera = gameViewportsDirector.primaryViewport.camera;

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
        simpleText.set(val);
      },
      scene,
      cssScene,
      assets,
      toggleFogOfWarByPlayerId(playerId: number) {
        if (players.toggleFogOfWarByPlayerId(playerId)) {
          fogOfWar.forceInstantUpdate = true;
        }
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
          buildSound(lastElapsed, volumeOrX, y, typeId, unitTypeId, pxToGameUnit, terrain, gameViewportsDirector.audio, gameViewportsDirector.primaryViewport.projectedView, soundChannels, mixer);
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

  let reset: (() => void) | null = null;
  let _wasReset = false;

  const refreshScene = () => {
    images.clear();
    units.clear();
    sprites.clear();
    cmds = commandsStream.generate();
    cmd = cmds.next();
    fadingPointers.clear();

    const frame = openBW.getCurrentFrame();

    // remove any upgrade or tech that is no longer available
    resetCompletedUpgrades(frame);
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
    cssScene.setSize(gameSurface.width, gameSurface.height);

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

  const creep = janitor.add(new Creep(
    mapWidth,
    mapHeight,
    terrainExtra.creepTextureUniform.value,
    terrainExtra.creepEdgesTextureUniform.value
  ));

  const buildMinimap = () => {
    minimapGraphics.resetUnitsAndResources();

    for (const unit of unitsIterator()) {
      const dat = bwDat.units[unit.typeId];

      const showOnMinimap =
        unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb;

      if (showOnMinimap) {
        minimapGraphics.buildUnitMinimap(unit, dat, fogOfWar, players)
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
          getImageLoOffset(unit.extras.turretLo, gameViewportsDirector.primaryViewport.camera.userData.direction, unitData.owSprite.mainImage, 0);
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
        buildSound(elapsed, x, y, typeId, unitTypeId, pxToGameUnit, terrain, gameViewportsDirector.audio, gameViewportsDirector.primaryViewport.projectedView, soundChannels, mixer);
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

  const buildSprite = (spriteData: SpritesBufferView, _: number, bullet?: BulletsBufferView, weapon?: WeaponDAT) => {

    const unit = sprites.getUnit(spriteData.index);
    let sprite = sprites.getOrCreate(spriteData.index, spriteData.typeId);

    // openbw recycled the id for the sprite, so we reset some things
    if (sprite.userData.typeId !== spriteData.typeId) {
      delete sprite.userData.fixedY;
      sprite.userData.typeId = spriteData.typeId;
    }

    const dat = bwDat.sprites[spriteData.typeId];

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
    sprite.userData.renderOrder = spriteSortOrder(spriteData as SpriteStruct);

    calcSpriteCoords(spriteData, _spritePos, _spritePos2d, unit && unitIsFlying(unit));
    let bulletY: number | undefined;

    const player = players.playersById[spriteData.owner];

    if (bullet && bullet.spriteIndex !== 0 && weapon && spriteIsVisible) {

      if (bullet.state === BulletState.Dying) {
        gameViewportsDirector.doShakeCalculation(weapon.explosionType, weapon.damageType, gameViewportsDirector, _spritePos);
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

      // upgrade HD2 image to HD if loaded
      if (image instanceof ImageHD && image.unitTileScale === UnitTileScale.HD2 && assets.grps[imageData.typeId].unitTileScale === UnitTileScale.HD) {
        image.updateImageType(assets.grps[imageData.typeId], true);
      }

      // only draw shadow if main image is not 3d
      const drawShadow = image.dat.drawFunction !== drawFunctions.rleShadow || !isGltfAtlas(assets.grps[spriteData.mainImage.typeId]) && image.dat.drawFunction === drawFunctions.rleShadow;

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
        }

        // tank turret needs to use different LO depending on camera angle
        // in order to handle this we need to set the LO to the correct frame
        // in addition, terran turret subunits are treated differently in bw so we accomodate that
        // by setting the lo from the main unit image and not the turret image 
        // as seen in `update_unit_movement`
        const subunitId = unit?.subunitId;
        if (subunitId !== null && subunitId !== undefined && (imageData.typeId === imageTypes.siegeTankTankTurret) && image instanceof ImageHD) {
          const subunit = units.get(subunitId);
          // bw keeps parent unit in subunit as well, so in this case this is actually parent unit
          // ie base tank
          if (subunit && subunit.extras.turretLo) {
            image.position.x = subunit.extras.turretLo.x / 32;
            image.position.y = subunit.extras.turretLo.y / 32;
          }
        }

        // if we're a shadow, we act independently from a sprite since our Y coordinate
        // needs to be in world space
        if (gameViewportsDirector.primaryViewport.spriteRenderOptions.rotateSprites && image.dat.drawFunction === drawFunctions.rleShadow && unit && unitIsFlying(unit)) {
          image.position.x = _spritePos.x;
          image.position.z = _spritePos.z;
          image.position.y = terrain.getTerrainY(_spritePos.x, _spritePos.z) - 0.1;

          image.rotation.copy(sprite.rotation);
          image.renderOrder = - 1;
          if (image.parent !== sprites.group) {
            sprites.group.add(image);
          }
          image.matrixWorldNeedsUpdate = true;
        } else {
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

        }

        // if it's directional we'll set it elsewhere relative to the viewport camera direction
        if (!imageHasDirectionalFrames(imageData as ImageStruct)) {
          image.setFrame(imageData.frameIndex, imageIsFlipped(imageData as ImageStruct));
        }

        if (imageData.index === spriteData.mainImageIndex) {
          if (image instanceof Image3D) {
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

  // apply initial terrain shadow settings
  terrain.shadowsEnabled = session.getState().graphics.terrainShadows;
  renderComposer.getWebGLRenderer().shadowMap.needsUpdate = session.getState().graphics.terrainShadows;
  renderComposer.targetSurface = gameSurface;

  const _a = new Vector3;

  let delta = 0;
  let lastElapsed = 0;

  let cmds = commandsStream.generate();
  const _commandsThisFrame: any[] = [];
  let cmd = cmds.next();

  let _halt = false;

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

      if (currentBwFrame % 24 === 0) {
        updateCompletedUpgrades(openBW, bwDat, currentBwFrame);
      }
      buildSounds(elapsed);
      buildCreep(currentBwFrame);
      buildUnits();
      buildMinimap();
      buildSprites(delta);
      updateSelectionGraphics(gameViewportsDirector.primaryViewport.camera, sprites);

      fogOfWar.texture.needsUpdate = true;

      const audioPosition = gameViewportsDirector.onUpdateAudioMixerLocation(delta, elapsed);
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
    }

    minimapGraphics.drawMinimap(minimapSurface, mapWidth, mapHeight, creep.minimapImageData, fogOfWar.enabled, gameViewportsDirector);

    plugins.onBeforeRender(delta, elapsed);

    for (const v of gameViewportsDirector.activeViewports()) {
      v.updateCamera();
      updateSpritesForViewport(v.camera.userData.direction, v.spriteRenderOptions, spriteIterator, spriteImageIterator);

      v.shakeStart(elapsed);
      fogOfWar.update(players.getVisionFlag(), v.camera);
      updatePostProcessingCamera(v.postProcessing, v.camera, true);
      renderComposer.setBundlePasses(v.postProcessing);
      renderComposer.render(delta, v.viewport);
      v.shakeEnd();

      if (v === gameViewportsDirector.primaryViewport) {
        minimapGraphics.syncFOWBuffer(fogOfWar.buffer)
      } else {
        hideSelections();
      }
    }

    renderComposer.renderBuffer();
    cssScene.render(gameViewportsDirector.primaryViewport.camera);
    plugins.onRender(delta, elapsed);

  };

  janitor.add(useSelectedUnitsStore.subscribe((state) => {
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
    pluginsApiJanitor.dispose();
    await gameViewportsDirector.activate(null);
    await (settingsStore().load());
    await plugins.initializePluginSystem(true);
    await setupPlugins();
    await gameViewportsDirector.activate(plugins.getSceneInputHandler(session.getState().game.sceneController)!);
    renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP);
    _halt = false;
  };

  janitor.on(ipcRenderer, RELOAD_PLUGINS, _onReloadPlugins);
  janitor.add(listenToEvents(macros));

  listenForNewSettings((mergeSettings, settings) => {
    session.getState().merge(mergeSettings.data!);
    if (settings.data.macros.revision !== macros.revision) {
      macros.deserialize(settings.data.macros);
    }
    macros.setHostDefaults(settings.data);
  })

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
      units.clear();
      resetCompletedUpgrades(0);
      plugins.disposeGame();
      pluginsApiJanitor.dispose();
      janitor.dispose();
    }, start: () => renderComposer.getWebGLRenderer().setAnimationLoop(GAME_LOOP)
  }
}