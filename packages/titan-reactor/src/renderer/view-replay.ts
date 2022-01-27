import { strict as assert } from "assert";
import { orders, UnitFlags, unitsByTechType } from "../common/bwdat/enums";
import { debounce } from "lodash";
import shuffle from "lodash.shuffle";
import { unstable_batchedUpdates } from "react-dom";
import { Box3, Color, Group, MathUtils, PerspectiveCamera, Vector3 } from "three";
import * as THREE from "three";
import { playerColors, unitTypes } from "../common/bwdat/enums";
import { CanvasTarget } from "../common/image";
import {
  ReplayPlayer, UnitDAT,
} from "../common/types";
import { buildPlayerColor, injectColorsCss } from "../common/utils/colors";
import { gameSpeeds, pxToMapMeter, tile32 } from "../common/utils/conversions";
import ProjectedCameraView from "./camera/projected-camera-view";
import {
  createImageFactory,
  GameStatePosition,
  Image,
  Players,
  Sprite,
  CrapUnit,
  GameStatePlayMode,
} from "./core";
import Creep from "./creep/creep";
import FogOfWar from "./fogofwar/fog-of-war";
import {
  InputEvents,
  KeyboardManager,
  MinimapEventListener,
  MouseInput,
} from "./input";
import { FrameBW } from "./integration/buffer-view";
import * as log from "./ipc/log";
import {
  Effects,
  GameCanvasTarget,
  Layers,
  Passes,
} from "./render";
import renderer from "./render/renderer";
import {
  getSettings,
  useGameStore,
  useHudStore,
  useSettingsStore,
} from "./stores";
import { SoundStruct, SpriteStruct, ImageStruct, UnitStruct } from "./integration/structs";
import { EntityIterator } from "./integration/buffer-view/entity-iterator";
import { hasDirectionalFrames, isClickable, isFlipped, isHidden, redraw } from "./utils/image-utils";
import { getBwVolume, MinPlayVolume as SoundPlayMinVolume } from "./utils/sound-utils";
import { openBw } from "./openbw";
import { spriteSortOrder } from "./utils/sprite-utils";
import { ReplayWorld } from "./world";
import CameraControls from "camera-controls";
import { constrainAzimuth, constrainControls, getDirection32, getDOFFocalLength, POLAR_MAX, POLAR_MIN } from "./utils/camera-utils";
import { CameraKeys } from "./input/camera-keys";

CameraControls.install({ THREE: THREE });

const { startLocation } = unitTypes;

const addChatMessage = useGameStore.getState().addChatMessage;

async function TitanReactorGame(
  world: ReplayWorld
) {

  const { scene, terrain, chk, replay, gameStateReader, commandsStream, assets, audioMixer, music, soundChannels, janitor } = world;
  const preplacedMapUnits = chk.units;
  const bwDat = assets.bwDat;

  // @ts-ignore
  window.world = world;
  // @ts-ignore
  janitor.callback(() => { window.world = null });

  let settings = getSettings();

  const createImage = createImageFactory(
    assets.bwDat,
    assets.grps,
    settings.assets.images
  );

  const mouseInput = new MouseInput(bwDat);
  janitor.disposable(mouseInput);

  const { mapWidth, mapHeight } = terrain;

  const keyboardManager = new KeyboardManager(window.document.body);
  janitor.disposable(keyboardManager);

  const gameSurface = new GameCanvasTarget(settings);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  useGameStore.setState({
    dimensions: gameSurface.getRect(),
  });
  document.body.appendChild(gameSurface.canvas);
  janitor.callback(() => document.body.removeChild(gameSurface.canvas));

  const minimapSurface = new CanvasTarget();
  minimapSurface.canvas.style.position = "absolute";
  minimapSurface.canvas.style.bottom = "0";
  document.body.appendChild(minimapSurface.canvas);
  janitor.callback(() => document.body.removeChild(minimapSurface.canvas));

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const camera = new PerspectiveCamera(35, gameSurface.width / gameSurface.height, 3, 256);
  camera.userData = {
    direction: 0,
    prevDirection: -1
  };
  const control = new CameraControls(
    camera,
    gameSurface.canvas,
  );
  control.mouseButtons.left = CameraControls.ACTION.TRUCK;
  control.mouseButtons.right = CameraControls.ACTION.ROTATE;
  control.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  control.dollyToCursor = true;
  control.verticalDragToForward = true;
  constrainControls(control, Math.max(mapWidth, mapHeight));
  janitor.disposable(control);
  (async () => {
    await control.setLookAt(0, 20, 0, 0, 0, 0, false);
    control.rotatePolarTo(POLAR_MIN, true);
  })();
  control.setBoundary(new Box3(new Vector3(-mapWidth / 2, 0, -mapHeight / 2), new Vector3(mapWidth / 2, 0, mapHeight / 2)));
  //@ts-ignore
  window.control = control;
  //@ts-ignore
  window.camera = camera;
  //@ts-ignore
  janitor.callback(() => { window.control = null; window.camera = null; });

  const previewControl = new CameraControls(camera, minimapSurface.canvas);
  previewControl.mouseButtons.left = CameraControls.ACTION.TRUCK;
  previewControl.mouseButtons.right = CameraControls.ACTION.ROTATE;
  previewControl.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  previewControl.dollyToCursor = true;
  previewControl.verticalDragToForward = true;
  previewControl.setLookAt(0, 20, 0, 0, 0, 0, true);
  constrainControls(previewControl, Math.max(mapWidth, mapHeight));

  const minimapEvents = new MinimapEventListener(
    minimapSurface,
    mapWidth,
    mapHeight
  );
  janitor.disposable(minimapEvents);

  minimapEvents.onStart = ({ pos }) => {
    control.moveTo(pos.x, pos.y, pos.z, false);
  };

  minimapEvents.onMove = ({ pos }) => {
    control.moveTo(pos.x, pos.y, pos.z, true);
  };

  //@ts-ignore
  window.scene = scene;
  //@ts-ignore
  janitor.callback(() => (window.scene = null));


  const cameraKeys = new CameraKeys(window.document.body, control, settings);
  janitor.disposable(cameraKeys);

  //@ts-ignore
  janitor.callback(() => (window.renderMan = null));

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, openBw, renderer.composerPasses.effects[Effects.FogOfWar]);

  const customColors = settings.playerColors.randomizeOrder
    ? shuffle(playerColors)
    : playerColors;

  const _playerColors = replay.header.players.map(
    ({ id, color }: ReplayPlayer, i: number) =>
      buildPlayerColor(
        settings.playerColors.ignoreReplayColors
          ? customColors[i].hex
          : color.hex,
        id
      )
  );
  const players = new Players(
    replay.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    _playerColors
  );
  injectColorsCss(_playerColors);

  music.playGame();

  const gameStatePosition = new GameStatePosition(
    replay.header.frameCount,
    gameSpeeds.fastest
  );

  // todo change this to store
  const togglePlayHandler = () => {
    gameStatePosition.togglePlay();
    if (gameStatePosition.paused) {
      useHudStore.getState().setAutoProductionView(false);
    } else {
      // todo remember last toggle setting or get from settings
      useHudStore.getState().setAutoProductionView(true);
    }
  };
  keyboardManager.on(InputEvents.TogglePlay, togglePlayHandler);

  let reset: (() => void) | null = null;

  const skipHandler = (dir: number) => () => {
    if (reset) return;
    reset = () => {
      assert(openBw.wasm);
      const currentFrame = openBw.wasm._replay_get_value(3);
      openBw.wasm._replay_set_value(3, currentFrame + 100 * dir);
      sprites.clear();
      images.clear();
      units.clear();
      spritesGroup.clear();
      unitsBySprite.clear();
      // cmds.next(openBw.api._replay_get_value(3));
      currentBwFrame = null;
      reset = null;
    }
  }
  keyboardManager.on(InputEvents.SkipForward, skipHandler(1));
  keyboardManager.on(InputEvents.SkipBackwards, skipHandler(-1));

  const speedHandler = (scale: number) => () => {
    assert(openBw.wasm);
    const currentSpeed = openBw.wasm._replay_get_value(0);
    openBw.wasm._replay_set_value(0, currentSpeed * scale)
  }
  keyboardManager.on(InputEvents.SpeedUp, speedHandler(2));
  keyboardManager.on(InputEvents.SpeedDown, speedHandler(1 / 2));

  // const toggleMenuHandler = () => useHudStore.getState().toggleInGameMenu();

  const nextFrameHandler = (evt: KeyboardEvent) => {
    if (evt.code === "KeyN") {
      gameStatePosition.advanceGameFrames = 1;
    }
  };
  document.addEventListener("keydown", nextFrameHandler);
  janitor.callback(() =>
    document.removeEventListener("keydown", nextFrameHandler)
  );

  //@ts-ignore
  janitor.callback(() => (window.cameras = null));

  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

    camera.aspect = gameSurface.width / gameSurface.height;
    camera.updateProjectionMatrix();

    // players.forEach(({ camera }) =>
    //   camera.updateGameScreenAspect(gameSurface.width, gameSurface.height)
    // );

    const max = Math.max(mapWidth, mapHeight);
    const wAspect = mapWidth / max;
    const hAspect = mapHeight / max;
    minimapSurface.setDimensions(
      Math.floor(gameSurface.minimapSize * wAspect),
      Math.floor(gameSurface.minimapSize * hAspect)
    );

    // cameraRig.updatePreviewScreenAspect(
    //   minimapSurface.width,
    //   minimapSurface.height
    // );

    projectedCameraView.update();

    // cameras.control.setBoundary(
    //   new Box3(
    //     new Vector3(-mapWidth / 2, 0, -mapHeight / 2),
    //     new Vector3(mapWidth / 2, 100, mapHeight / 2)
    //   )
    // );

    unstable_batchedUpdates(() =>
      useGameStore.setState({
        dimensions: gameSurface.getRect(),
      })
    );
  };

  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);
  janitor.callback(() =>
    window.removeEventListener("resize", sceneResizeHandler)
  );

  let currentBwFrame: FrameBW | null;

  const creep = new Creep(
    mapWidth,
    mapHeight,
    terrain.creepTextureUniform.value,
    terrain.creepEdgesTextureUniform.value
  );
  janitor.disposable(creep);

  const minimapImageData = new ImageData(mapWidth, mapHeight);
  const minimapResourceImageData = new ImageData(mapWidth, mapHeight);
  const resourceColor = new Color(0, 55, 55);
  const flashColor = new Color(200, 200, 200);
  const scannerColor = new Color(0xff0000);


  const _buildMinimap = (unit: CrapUnit, unitType: UnitDAT) => {
    const isResourceContainer = unitType.isResourceContainer && !unit.extra.player;
    if (
      !isResourceContainer &&
      !fogOfWar.isVisible(tile32(unit.x), tile32(unit.y))
    ) {
      return;
    }

    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unitType.index === unitTypes.scannerSweep) {
      color = scannerColor;
    } else if (unit.extra.player) {
      color = unit.extra.recievingDamage & 1 ? flashColor : unit.extra.player.color.three;
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

    if (unitType.index === unitTypes.scannerSweep) {
      w = 6;
      h = 6;
    }

    const unitX = Math.floor(unit.x / 32);
    const unitY = Math.floor(unit.y / 32);
    const wX = Math.floor(w / 2);
    const wY = Math.floor(w / 2);

    const _out = isResourceContainer ? minimapResourceImageData : minimapImageData;
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

  const buildMinimap = (units: Map<number, CrapUnit>, imageData: ImageData, resourceImageData: ImageData) => {
    imageData.data.fill(0);
    resourceImageData.data.fill(0);
    for (const [_, unit] of units) {
      const dat = bwDat.units[unit.typeId];

      const showOnMinimap =
        unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb &&
        unit.order !== orders.die;

      if (showOnMinimap) {
        _buildMinimap(unit, dat);
      }
    }
  }

  const getUnit = (units: Map<number, CrapUnit>, unitData: UnitStruct) => {
    const unit = units.get(unitData.id);
    if (unit) {
      return unit;
    } else {
      const unit = unitData as CrapUnit;
      // @ts-ignore
      unit.extra = {
        recievingDamage: 0
      };
      units.set(unitData.id, unit);
      return unit;
    }
  }

  const buildUnits = (
    unitsBW: EntityIterator<UnitStruct>,
    units: Map<number, CrapUnit>,
    unitsBySprite: Map<number, CrapUnit>
  ) => {
    for (const unitData of unitsBW.instances()) {

      const unit = getUnit(units, unitData);

      if (unitData.spriteIndex !== undefined) {
        unitsBySprite.set(unit.spriteIndex, unit);
      }

      //if receiving damage, blink 3 times, hold blink 3 frames
      if (
        !unit.extra.recievingDamage &&
        (unit.hp > unitData.hp || unit.shields > unitData.shields) &&
        unitData.typeId === undefined// ignore zerg units change hp from egg hp
      ) {
        unit.extra.recievingDamage = 0b000111000111000111;
      } else if (unit.extra.recievingDamage) {
        unit.extra.recievingDamage = unit.extra.recievingDamage >> 1;
      }

      if (unitData.owner !== undefined)
        unit.extra.player = players.playersById[unitData.owner];

      if (unitData.order == orders.die) {
        unit.extra.timeOfDeath = Date.now();
      }

      //bulk assign ok?
      Object.assign(unit, unitData);

    }
  }

  const drawMinimap = (() => {
    const color = "white";

    let _generatingMinimapFog = false;
    let _generatingUnits = false;
    let _generatingResources = false;
    let _generatingCreep = false;

    let fogBitmap: ImageBitmap;
    let unitsBitmap: ImageBitmap;
    let resourcesBitmap: ImageBitmap;
    let creepBitmap: ImageBitmap;

    const { canvas, ctx } = minimapSurface;

    return (view: ProjectedCameraView) => {
      if (!_generatingMinimapFog) {
        _generatingMinimapFog = true;

        createImageBitmap(fogOfWar.imageData).then((ib) => {
          fogBitmap = ib;
          _generatingMinimapFog = false;
        });
      }

      if (!_generatingUnits) {
        _generatingUnits = true;
        createImageBitmap(minimapImageData).then((ib) => {
          unitsBitmap = ib;
          _generatingUnits = false;
        });
      }

      if (!_generatingResources) {
        _generatingResources = true;
        createImageBitmap(minimapResourceImageData).then((ib) => {
          resourcesBitmap = ib;
          _generatingResources = false;
        });
      }

      if (!_generatingCreep) {
        _generatingCreep = true;
        createImageBitmap(creep.creepImageData).then((ib) => {
          creepBitmap = ib;
          _generatingCreep = false;
        });
      }

      ctx.save();

      ctx.drawImage(
        terrain.minimapBitmap,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (creepBitmap) {
        ctx.drawImage(
          creepBitmap,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      if (unitsBitmap) {
        ctx.drawImage(
          unitsBitmap,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      if (fogBitmap && fogOfWar.enabled) {
        ctx.drawImage(
          fogBitmap,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      if (resourcesBitmap) {
        ctx.drawImage(
          resourcesBitmap,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.setTransform(
        canvas.width / mapWidth,
        0,
        0,
        canvas.height / mapHeight,
        canvas.width / 2,
        canvas.height / 2
      );
      ctx.beginPath();
      ctx.moveTo(...view.tl);
      ctx.lineTo(...view.tr);
      ctx.lineTo(...view.br);
      ctx.lineTo(...view.bl);
      ctx.lineTo(...view.tl);
      ctx.stroke();
      ctx.restore();
    }
  })();

  const projectedCameraView = new ProjectedCameraView(
    camera,
    mapWidth,
    mapHeight
  );

  const buildSounds = (sounds: EntityIterator<SoundStruct>) => {
    for (const sound of sounds.instances()) {
      if (!fogOfWar.isVisible(tile32(sound.x), tile32(sound.y))) {
        continue;
      }
      const dat = assets.bwDat.sounds[sound.typeId];
      const mapCoords = terrain.getMapCoords(sound.x, sound.y)
      const volume = getBwVolume(
        dat,
        mapCoords,
        sound,
        projectedCameraView.left,
        projectedCameraView.top,
        projectedCameraView.right,
        projectedCameraView.bottom
      );
      if (volume > SoundPlayMinVolume) {
        soundChannels.queue(sound, dat, mapCoords);
      }
    }
  };

  const buildCreep = (bwFrame: FrameBW) => {
    creep.generate(bwFrame.tiles, bwFrame.frame);
  };

  const units: Map<number, CrapUnit> = new Map();
  const sprites: Map<number, Sprite> = new Map();
  const images: Map<number, Image> = new Map();
  const unitsBySprite: Map<number, CrapUnit> = new Map();
  const spritesGroup = new Group();
  scene.add(spritesGroup);

  const buildSprites = (spritesBW: EntityIterator<SpriteStruct>, delta: number) => {
    assert(openBw.wasm);
    const deletedImages = openBw.wasm.get_util_funcs().get_deleted_images();
    const deletedSprites = openBw.wasm.get_util_funcs().get_deleted_sprites();

    for (const spriteId of deletedSprites) {
      const sprite = sprites.get(spriteId);
      if (!sprite) continue;
      sprite.removeFromParent();
      sprites.delete(spriteId);
      unitsBySprite.delete(sprite.index);
    }

    for (const imageId of deletedImages) {
      const image = images.get(imageId);
      if (!image) continue;
      image.removeFromParent();
      images.delete(imageId);
    }

    for (const spriteData of spritesBW.items()) {
      let sprite = sprites.get(spriteData.index);
      if (!sprite) {
        sprite = new Sprite(
          spriteData.index,
          bwDat.sprites[spriteData.typeId]
        );
        sprites.set(sprite.index, sprite);
        spritesGroup.add(sprite);
      }
      Object.assign(sprite.userData, spriteData);

      const unit = unitsBySprite.get(sprite.index);
      const dat = bwDat.sprites[sprite.userData.typeId];

      // const buildingIsExplored =
      //   sprite.unit &&
      //   sprite.unit.dat.isBuilding &&
      //   fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // show units as fog is lifting from or lowering to explored
      // show if a building has been explored
      sprite.visible =
        sprite.userData.owner === 11 ||
        dat.image.iscript === 336 ||
        dat.image.iscript === 337 ||
        fogOfWar.isSomewhatVisible(tile32(sprite.userData.x), tile32(sprite.userData.y));

      // don't update explored building frames so viewers only see last built frame
      // const dontUpdate =
      //   buildingIsExplored &&
      //   !fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      sprite.renderOrder = spriteSortOrder(sprite.userData as SpriteStruct) * 10;

      const x = pxToGameUnit.x(sprite.userData.x);
      const z = pxToGameUnit.y(sprite.userData.y);
      let y = terrain.getTerrainY(x, z);
      sprite.position.set(x, y, z);

      if (unit) {
        if (unit.statusFlags & UnitFlags.Flying) {
          const targetY = Math.min(6, y + 2.5);
          if (sprite.position.y === 0) {
            y = targetY;
          } else {
            y = MathUtils.damp(sprite.position.y, targetY, 0.001, delta);
          }
        }

        if (unit.extra.selected) {
          sprite.select();
        } else {
          sprite.unselect();
        }
      }

      // liftoff z - 42, y+
      // landing z + 42, y-

      const player = players.playersById[sprite.userData.owner];

      for (const imageData of sprite.userData.images.reverse()) {

        updateImagesDirection = false;

        // @todo recycle dead similar images
        let image = images.get(imageData.index);
        if (!image) {
          image = createImage(imageData.typeId);
          images.set(imageData.index, image);
          sprite.add(image);
          image.sprite = sprite;
        }

        Object.assign(image.userData, imageData);

        if (!sprite.visible || isHidden(image.userData as ImageStruct) || (!redraw(image.userData as ImageStruct) && !updateImagesDirection)) {
          continue;
        }

        if (player) {
          image.setTeamColor(player.color.three);
        }

        // overlay position
        image.offsetX = image.position.x = image.userData.x / 32;
        image.offsetY = image.position.z = image.userData.y / 32;
        image.renderOrder = sprite.renderOrder + image.userData.order;

        // 63-48=15
        if (image.userData.modifier === 14) {
          image.setWarpingIn((image.userData.modifierData1 - 48) / 15);
        } else {
          //@todo see if we even need this
          image.setWarpingIn(0);
        }
        //@todo use modifier 1 for opacity value
        image.setCloaked(image.userData.modifier === 2 || image.userData.modifier === 5);

        let z = 0;

        if (hasDirectionalFrames(image.userData as ImageStruct)) {
          const flipped = isFlipped(image.userData as ImageStruct);
          const direction = flipped ? 32 - image.userData.frameIndexOffset : image.userData.frameIndexOffset;
          const newFrameOffset = (direction + camera.userData.direction) % 32;

          if (newFrameOffset > 16) {
            image.setFrame(image.userData.frameIndexBase + 32 - newFrameOffset, true);
          } else {
            image.setFrame(image.userData.frameIndexBase + newFrameOffset, false);
          }
        } else {
          image.setFrame(image.userData.frameIndex, isFlipped(image.userData as ImageStruct));
        }

        if (image.userData.index === sprite.userData.mainImageIndex) {

          z = image._zOff * image.unitTileScale;
          const unit = unitsBySprite.get(sprite.index);
          if (unit) {
            // for 3d models
            // image.rotation.y = unit.angle;
          }

          if (isClickable(image.userData as ImageStruct)) {
            sprite.layers.enable(Layers.Clickable);
            image.layers.enable(Layers.Clickable);
          }
          sprite.mainImage = image;
        }

        //@todo is this the reason for overlays displaying in 0,0?
        // sprite.position.z += z - sprite.lastZOff;
        sprite.lastZOff = z;
      }
    }
  };

  // mouseInput.bind(
  //   spritesGroup,
  //   projectedCameraView,
  //   gameSurface,
  //   terrain,
  //   camera,
  //   unitsBySprite
  // );

  let _lastElapsed = 0;
  let delta = 0;
  let updateImagesDirection = false;

  projectedCameraView.update();
  const cmds = commandsStream.generate();

  //@ts-ignore
  window.pause = () => {
    gameStatePosition.togglePlay();
  }
  // @ts-ignore
  janitor.callback(() => { window.pause = null });

  const _stepperListener = (evt: KeyboardEvent) => {
    if (evt.key === "n" && gameStatePosition.mode === GameStatePlayMode.SingleStep) {
      gameStatePosition.paused = false;
    }
  };
  window.addEventListener("keypress", _stepperListener);
  janitor.callback(() => { window.removeEventListener("keypress", _stepperListener) });

  const gameLoop = (elapsed: number) => {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    control.update(delta / 1000);
    cameraKeys.update(delta / 100);

    if (reset) reset();

    if (!gameStatePosition.paused) {
      if (!currentBwFrame) {
        projectedCameraView.update();

        currentBwFrame = gameStateReader.next();
        if (!currentBwFrame || gameStatePosition.mode == GameStatePlayMode.SingleStep) {
          gameStatePosition.paused = true;
        }
      }
    }

    if (gameStatePosition.advanceGameFrames && currentBwFrame) {
      buildSounds(currentBwFrame.sounds);
      fogOfWar.update(players.getVisionFlag(), camera);
      buildCreep(currentBwFrame);

      gameStatePosition.bwGameFrame = currentBwFrame.frame;
      if (gameStatePosition.bwGameFrame % 8 === 0) {
        scene.incrementTileAnimation();
      }

      buildUnits(
        currentBwFrame.units,
        units,
        unitsBySprite
      );
      buildMinimap(units, minimapImageData, minimapResourceImageData)
      buildSprites(currentBwFrame.sprites, delta);
      // buildResearchAndUpgrades(currentBwFrame);
      fogOfWar.texture.needsUpdate = true;
      creep.creepValuesTexture.needsUpdate = true;
      creep.creepEdgesValuesTexture.needsUpdate = true;

      soundChannels.play(elapsed);

      {
        const cmdsThisFrame = [];
        let cmd = cmds.next();
        while (cmd.done === false) {
          if (
            typeof cmd.value === "number" &&
            cmd.value !== gameStatePosition.bwGameFrame
          ) {
            break;
          }
          cmdsThisFrame.push(cmd.value);
          cmd = cmds.next();
        }
      }

      // if (rep.cmds[gameStatePosition.bwGameFrame]) {
      //   for (const cmd of rep.cmds[gameStatePosition.bwGameFrame]) {
      //     //@todo remove once we filter commands
      //     if (!players.playersById[cmd.player]) continue;

      //     if (
      //       cmd.id === commands.chat &&
      //       players.playersById[cmd.senderSlot]
      //     ) {
      //       unstable_batchedUpdates(() =>
      //         addChatMessage({
      //           content: cmd.message,
      //           player: players.playersById[cmd.senderSlot],
      //         })
      //       );
      //     }

      //     // if (players.playersById[cmd.player].showPov) {
      //     //   players.playersById[cmd.player].camera.update(cmd, pxToGameUnit);
      //     // } else {
      //     //   players.playersById[cmd.player].camera.update(
      //     //     cmd,
      //     //     pxToGameUnit,
      //     //     1000
      //     //   );
      //     // }

      //     if (players.playersById[cmd.player].showActions) {
      //       switch (cmd.id) {
      //         case commands.rightClick:
      //         case commands.targetedOrder:
      //         case commands.build: {
      //           const px = pxToGameUnit.x(cmd.x);
      //           const py = pxToGameUnit.y(cmd.y);
      //           const pz = terrainInfo.getTerrainY(px, py);

      //           // fadingPointers.addPointer(
      //           //   px,
      //           //   py,
      //           //   pz,
      //           //   players.playersById[cmd.player].color.rgb,
      //           //   gameStatePosition.bwGameFrame
      //           // );
      //         }
      //       }
      //     }
      //   }
      // }
      currentBwFrame = null;
    }

    // if (
    //   cameras.control.distance < 50 &&
    //   !cameras.control.cameraShake.isShaking
    // ) {
    //   const attackingUnits = unitsThisFrame
    //     .map((unitRepId) =>
    //       units.units.children.find(
    //         ({ userData }) => userData.repId === unitRepId
    //       )
    //     )
    //     .filter((unit) => heatMapScore.unitOfInterestFilter(unit));

    //   // mainCamera.control.shake(heatMapScore.totalScore(attackingUnits));
    // }

    const target = new Vector3();
    control.getTarget(target);

    {
      const azi = constrainAzimuth(control.polarAngle);
      control.minAzimuthAngle = -azi / 2;
      control.maxAzimuthAngle = azi / 2;

      const dir = control.polarAngle < 0.25 ? 0 : getDirection32(target, camera.position);
      if (dir != camera.userData.direction) {
        camera.userData.prevDirection = camera.userData.direction;
        camera.userData.direction = dir;
        updateImagesDirection = true;
      }
    }

    renderer.targetSurface = gameSurface;

    // if (players[0].showPov && players[1].showPov) {
    //   players.forEach(({ camera }) => {
    //     renderMan.renderSplitScreen(scene, camera, camera.viewport);
    //   });
    // } else if (players[0].showPov) {
    //   renderMan.render(scene, players[0].camera, delta);
    // } else if (players[1].showPov) {
    //   renderMan.render(scene, players[1].camera, delta);
    // } else {
    // if (units.followingUnit && units.selected.length) {
    //   const x =
    //     units.selected.reduce(
    //       (sum, unit) => sum + unit.getWorldPosition().x,
    //       0
    //     ) / units.selected.length;
    //   const z =
    //     units.selected.reduce(
    //       (sum, unit) => sum + unit.getWorldPosition().z,
    //       0
    //     ) / units.selected.length;

    //   cameras.setTarget(x, getTerrainY(x, z), z, true);
    // }

    target.setY((target.y + camera.position.y) / 2);
    target.setZ((target.z + camera.position.z) / 2);
    // audioMixer.update(target.x, target.y, target.z, delta);
    renderer.composerPasses.effects[Effects.DepthOfField].circleOfConfusionMaterial.uniforms.focalLength.value = getDOFFocalLength(camera, control.polarAngle);

    // renderer.togglePasses(Passes.Render);
    renderer.togglePasses(Passes.Render, Passes.Cinematic);
    renderer.render(scene, camera, delta);
    // }
    drawMinimap(projectedCameraView);

    projectedCameraView.update();
    gameStatePosition.update(delta);
  };

  const dispose = () => {
    log.info("disposing replay viewer");
    gameStatePosition.pause();
    janitor.mopUp();
  };

  window.onbeforeunload = dispose;

  const unsub = useSettingsStore.subscribe((state) => {
    settings = state.data;
    if (!settings) return;

    if (audioMixer.musicVolume !== settings.audio.music) {
      audioMixer.musicVolume = settings.audio.music;
    }

    if (audioMixer.soundVolume !== settings.audio.sound) {
      audioMixer.soundVolume = settings.audio.sound;
    }
  });
  janitor.callback(unsub);

  // const unsub2 = useHudStore.subscribe((state, prevState) => {
  //   if (
  //     state.hoveringOverMinimap
  //   ) {
  //     cameras.previewControl.enabled = true;
  //     cameras.previewControl.numpadControlEnabled = true;
  //     cameras.control.enabled = false;
  //     cameras.control.numpadControlEnabled = false;
  //   } else {
  //     cameras.previewControl.enabled = false;
  //     cameras.previewControl.numpadControlEnabled = false;
  //     cameras.control.enabled = true;
  //     cameras.control.numpadControlEnabled = true;
  //   }
  // });

  const unsub3 = useGameStore.subscribe((state) => {
    // fogChanged = fogOfWar.enabled != state.fogOfWar;
    fogOfWar.enabled = state.fogOfWar;

    for (const player of players) {
      if (player.vision !== state.playerVision[player.id]) {
        player.vision = state.playerVision[player.id];
        fogOfWar.playerVisionWasToggled = true;
      }
    }
  });
  janitor.callback(unsub3);

  //run 1 frame
  gameStatePosition.resume();
  gameStatePosition.advanceGameFrames = 1;
  gameLoop(0);
  _sceneResizeHandler();
  return {
    start: () => renderer.getWebGLRenderer().setAnimationLoop(gameLoop),
    gameSurface,
    minimapSurface,
    players,
    gameStatePosition,
    dispose,
  };
}

export default TitanReactorGame;
