import { UnitFlags } from "../common/bwdat/enums";
import { debounce } from "lodash";
import { strict as assert } from "assert";
import shuffle from "lodash.shuffle";
import { unstable_batchedUpdates } from "react-dom";
import { Color, Group, MathUtils, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, SphereBufferGeometry, Vector3 } from "three";
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
  ImageHD,
} from "./core";
import Creep from "./creep/creep";
import FogOfWar from "./fogofwar/fog-of-war";
import {
  InputEvents,
  MinimapEventListener,
  MouseInput,
  ReplayKeys
} from "./input";
import { FrameBW, ImageBufferView, SpritesBufferView } from "./integration/buffer-view";
import * as log from "./ipc/log";
import {
  Effects,
  GameCanvasTarget,
  Layers,
  RenderCSS,
} from "./render";
import renderer from "./render/renderer";
import {
  getSettings,
  useGameStore,
  useHudStore,
  useSettingsStore,
} from "./stores";
import { SoundStruct, SpriteStruct, ImageStruct } from "./integration/structs";
import { EntityIterator } from "./integration/buffer-view/entity-iterator";
import { hasDirectionalFrames, isClickable, isFlipped } from "./utils/image-utils";
import { getBwVolume, MinPlayVolume as SoundPlayMinVolume } from "./utils/sound-utils";
import { openBw } from "./openbw";
import { spriteIsHidden, spriteSortOrder } from "./utils/sprite-utils";
import { ReplayWorld } from "./world";
import CameraControls from "camera-controls";
import { calculateHorizontalFoV, constrainControls, constrainControlsBattleCam, constrainControlsOverviewCam, getDirection32 } from "./utils/camera-utils";
import { CameraKeys } from "./input/camera-keys";
import { FPSMeter } from "./utils/fps-meter";
import { IntrusiveList } from "./integration/buffer-view/intrusive-list";
import UnitsBufferView from "./integration/buffer-view/units-buffer-view";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { CameraMouse } from "./input/camera-mouse";
import { isAttacking } from "./utils/unit-utils";
import CameraShake from "./camera/camera-shake";
import Janitor from "./utils/janitor";
import { CameraMode, RegularCameraMode } from "./input/camera-mode";
// import cameraIconSvg from "./camera-icon.svg";

CameraControls.install({ THREE: THREE });

const { startLocation } = unitTypes;

const addChatMessage = useGameStore.getState().addChatMessage;

const _cameraTarget = new Vector3();

async function TitanReactorGame(
  world: ReplayWorld
) {
  let settings = getSettings();

  const { scene, terrain, chk, replay, gameStateReader, commandsStream, assets, audioMixer, music, soundChannels, janitor } = world;
  const preplacedMapUnits = chk.units;
  const bwDat = assets.bwDat;
  const fps = new FPSMeter();
  const fpsEl = document.getElementById("fps");
  assert(fpsEl !== null);
  assert(openBw.wasm);
  // @ts-ignore
  window.world = world;
  // @ts-ignore
  janitor.callback(() => { window.world = null });

  fpsEl.style.display = settings.graphics.showFps ? "block" : "none";

  const createImage = createImageFactory(
    assets.bwDat,
    assets.grps,
    settings.assets.images
  );

  const mouseInput = new MouseInput(bwDat);
  janitor.disposable(mouseInput);

  const { mapWidth, mapHeight } = terrain;

  const keyboardManager = new ReplayKeys(window.document.body);
  janitor.disposable(keyboardManager);

  const gameSurface = new GameCanvasTarget(settings);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  useGameStore.setState({
    dimensions: gameSurface.getRect(),
  });
  document.body.appendChild(gameSurface.canvas);
  janitor.callback(() => document.body.removeChild(gameSurface.canvas));

  const cssRenderer = new RenderCSS(document.body);
  cssRenderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);
  janitor.disposable(cssRenderer);

  const minimapSurface = new CanvasTarget();
  minimapSurface.canvas.style.position = "absolute";
  minimapSurface.canvas.style.bottom = "0";
  document.body.appendChild(minimapSurface.canvas);
  janitor.callback(() => document.body.removeChild(minimapSurface.canvas));

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const camera = new PerspectiveCamera(15, gameSurface.width / gameSurface.height, 0.1, 1000);
  camera.userData = {
    direction: 0,
    prevDirection: -1
  };

  renderer.composerPasses.presetRegularCam();

  const createControls = (cameraMode: CameraMode) => {
    const janitor = new Janitor()
    const controls = new CameraControls(
      camera,
      gameSurface.canvas,
    );
    janitor.disposable(controls);

    const cameraMouse = new CameraMouse(document.body);
    janitor.disposable(cameraMouse);

    const cameraKeys = new CameraKeys(window.document.body, settings);
    janitor.disposable(cameraKeys);

    const cameraShake = new CameraShake(controls, 200, 12);

    const toggle = (enabled: boolean) => {
      controls.enabled = enabled;
      cameraMouse.enabled = enabled;
      cameraKeys.enabled = enabled;
      cameraShake.enabled = enabled;
    }
    const enableAll = () => toggle(true);
    const disableAll = () => toggle(false);

    return {
      cameraMode,
      standard: controls,
      mouse: cameraMouse,
      keys: cameraKeys,
      cameraShake,
      dispose: () => janitor.mopUp(),
      enableAll,
      disableAll
    };
  }

  let controls = createControls(CameraMode.Default);
  //@ts-ignore
  window.controls = controls;

  constrainControls(controls, camera, mapWidth, mapHeight);

  //@ts-ignore
  window.camera = camera;
  //@ts-ignore
  janitor.callback(() => { window.controls = null; window.camera = null; });

  const minimapEvents = new MinimapEventListener(
    minimapSurface,
    mapWidth,
    mapHeight
  );
  janitor.disposable(minimapEvents);

  minimapEvents.onStart = ({ pos }) => {
    onToggleCameraMode(CameraMode.Default);
    controls.standard.moveTo(pos.x, pos.y, pos.z, false);
  };

  minimapEvents.onMove = ({ pos }) => {
    controls.standard.moveTo(pos.x, pos.y, pos.z, true);
  };

  //@ts-ignore
  window.scene = scene;
  //@ts-ignore
  janitor.callback(() => (window.scene = null));

  const setUseDepth = (useDepth: boolean) => {
    ImageHD.useDepth = useDepth;
    for (const [, image] of images) {
      if (image instanceof ImageHD) {
        image.material.depthTest = ImageHD.useDepth;
        image.setFrame(image.frame, image.flip, true);
      }
    }
  }

  const setUseScale = (enable: boolean | number) => {
    if (typeof enable === "number") {
      ImageHD.useScale = enable;
    } else {
      ImageHD.useScale = enable ? 2 : 1;
    }
    for (const [, image] of images) {
      if (image instanceof ImageHD) {

        if (ImageHD.useScale === 1) {
          image.scale.copy(image.originalScale);
        } else {
          image.scale.multiplyScalar(ImageHD.useScale);
        }
      }
    }
  }

  const onToggleCameraMode = async (cm: CameraMode) => {
    if (controls.cameraMode === CameraMode.Default && cm === controls.cameraMode) {
      return;
    }
    // default -> any mode, any mode -> default
    if (cm !== CameraMode.Default) {
      controls.cameraMode = CameraMode.Default;
    } else {
      controls.cameraMode = cm;
    }

    // @ts-ignore
    const oldTarget = controls.standard.getTarget();
    // @ts-ignore
    const oldPosition = controls.standard.getPosition();
    controls.dispose();
    controls = createControls(cm);
    controls.keys.onToggleCameraMode = onToggleCameraMode;
    gameSurface.exitPointerLock();
    setUseScale(false);

    //@ts-ignore
    window.controls = controls;
    if (controls.cameraMode === CameraMode.Default) {
      const t = new Vector3();
      t.lerpVectors(oldTarget, oldPosition, 0.8);
      await controls.standard.setTarget(t.x, 0, t.z, false);
      await constrainControls(controls, camera, mapWidth, mapHeight);
      renderer.composerPasses.presetRegularCam();
      // setUseDepth(false);
    } else if (controls.cameraMode === CameraMode.Battle) {
      gameSurface.requestPointerLock();
      await controls.standard.setTarget(oldTarget.x, 0, oldTarget.z, false);
      await constrainControlsBattleCam(controls, camera, mapWidth, mapHeight);
      renderer.composerPasses.presetBattleCam();
      // setUseDepth(true);
    } else if (controls.cameraMode === CameraMode.Overview) {
      await constrainControlsOverviewCam(controls, camera, mapWidth, mapHeight);
      renderer.composerPasses.presetOverviewCam();
      setUseScale(true);
    }
  }

  controls.keys.onToggleCameraMode = onToggleCameraMode;

  const projectedCameraView = new ProjectedCameraView(
    camera
  );

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
      const currentFrame = openBw.wasm!._replay_get_value(3);
      openBw.wasm!._replay_set_value(3, currentFrame + 100 * dir);
      cssGroup.clear();
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
    const currentSpeed = openBw.wasm!._replay_get_value(0);
    openBw.wasm!._replay_set_value(0, currentSpeed * scale)
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
    // @todo use scaled sizes here?
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);
    cssRenderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

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

    projectedCameraView.update();

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

    for (const unit of iterateUnits()) {
      const dat = bwDat.units[unit.typeId];

      const showOnMinimap =
        unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb;

      if (showOnMinimap) {
        _buildMinimap(unit, dat);
      }
    }
  }

  const getUnit = (units: Map<number, CrapUnit>, unitData: UnitsBufferView) => {
    const unit = units.get(unitData.id);
    if (unit) {
      return unit;
    } else {
      const highlight = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      if (unitData.owner < 8) {
        const div = document.createElement("div");
        div.innerText = unitData.id.toString();
        div.style.color = "white";
        div.style.fontWeight = "500"
        const debuglabel = new CSS2DObject(div);
        highlight.add(debuglabel)
      }
      // cssGroup.add(highlight);
      const unit = {
        extra: {
          recievingDamage: 0,
          highlight,
        }
      } as unknown as CrapUnit;
      unitData.copyTo(unit)
      units.set(unitData.id, unit);
      return unit;
    }
  }

  const unitBufferView = new UnitsBufferView(openBw.wasm);
  const unitList = new IntrusiveList(openBw.wasm, 0, 43);

  function* iterateUnits() {
    const playersUnitAddr = openBw.call.getUnitsAddr();
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

  let unitAttackScore = 0;

  const buildUnits = (
    units: Map<number, CrapUnit>,
    unitsBySprite: Map<number, CrapUnit>
  ) => {
    const deletedUnits = openBw.wasm!.get_util_funcs().get_deleted_units();

    for (const unitId of deletedUnits) {
      const unit = units.get(unitId);
      if (!unit) continue;
      unit.extra.highlight.removeFromParent();
      units.delete(unitId);
    }

    const playersUnitAddr = openBw.call.getUnitsAddr();

    unitAttackScore = 0;
    for (let p = 0; p < 12; p++) {
      unitList.addr = playersUnitAddr + (p << 3);
      for (const unitAddr of unitList) {
        const unitData = unitBufferView.get(unitAddr);
        const unit = getUnit(units, unitData);

        unitsBySprite.set(unit.spriteIndex, unit);

        const mx = pxToGameUnit.x(unitData.x);
        const my = pxToGameUnit.y(unitData.y);

        if (controls.cameraMode === CameraMode.Battle && mx > projectedCameraView.left && mx < projectedCameraView.right && my > projectedCameraView.top && my < projectedCameraView.bottom) {
          // @todo only ranged and scale by weapon type
          if (isAttacking(unitData, bwDat)) {
            unitAttackScore++;
          }
        }

        //if receiving damage, blink 3 times, hold blink 3 frames
        if (
          !unit.extra.recievingDamage &&
          (unit.hp > unitData.hp || unit.shields > unitData.shields)
          && unit.typeId === unitData.typeId // ignore morphs
        ) {
          unit.extra.recievingDamage = 0b000111000111000111;
        } else if (unit.extra.recievingDamage) {
          unit.extra.recievingDamage = unit.extra.recievingDamage >> 1;
        }

        unit.extra.player = players.playersById[unitData.owner];
        unit.extra.highlight.visible = unit.extra.player !== undefined;
        if (unit.extra.player) {

          unit.extra.highlight.position.set(mx, terrain.getTerrainY(mx, my), my);
          (unit.extra.highlight.material as MeshBasicMaterial).color.set(unit.extra.player.color.three);
        }
        // if (unitData.order == orders.die) {
        //   unit.extra.timeOfDeath = Date.now();
        // }

        unitData.copyTo(unit);

      }
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
      if (controls.cameraMode === CameraMode.Battle) {
        ctx.beginPath();
        const fov2 = calculateHorizontalFoV(MathUtils.degToRad(camera.getEffectiveFOV()), camera.aspect) / 2;
        const a = Math.PI - controls.standard.azimuthAngle / 2;
        ctx.arc(camera.position.x, camera.position.z, 10, a, a + fov2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(...view.tl);
        ctx.lineTo(...view.tr);
        ctx.lineTo(...view.br);
        ctx.lineTo(...view.bl);
        ctx.lineTo(...view.tl);
        ctx.stroke();
      }
      ctx.restore();

    }
  })();


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
  const cssGroup = new Group();

  //@ts-ignore
  window.spritesGroup = spritesGroup;
  //@ts-ignore
  janitor.callback(() => { window.spritesGroup = undefined; });

  scene.add(spritesGroup);
  scene.add(cssGroup);

  const spriteBufferView = new SpritesBufferView(openBw.wasm);
  const imageBufferView = new ImageBufferView(openBw.wasm);

  const buildSprites = (delta: number) => {
    const deletedImages = openBw.wasm!.get_util_funcs().get_deleted_images();
    const deletedSprites = openBw.wasm!.get_util_funcs().get_deleted_sprites();

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

    // const spriteList = new IntrusiveList(openBw.wasm!);
    // let debug_sprite_count = 0;
    // const spriteTileLineSize = openBw.call.getSpritesOnTileLineSize();
    // const spritetileAddr = openBw.call.getSpritesOnTileLineAddress();
    // const spritesDebug = openBw.wasm!.get_util_funcs().get_sprites_debug();
    // for (let l = 0; l < spriteTileLineSize; l++) {
    //   spriteList.addr = spritetileAddr + (l << 3)
    //   for (const spriteAddr of spriteList) {
    //     debug_sprite_count++;
    for (const spriteAddr of openBw.call.getSpriteAddresses()) {
      const spriteData = spriteBufferView.get(spriteAddr);
      // const debugSpriteData = spritesDebug.find(o => o._addr == spriteAddr);
      if (spriteAddr === 0) {
        continue;
      }

      let sprite = sprites.get(spriteData.index);
      if (!sprite) {
        sprite = new Sprite(
          spriteData.index,
          bwDat.sprites[spriteData.typeId]
        );
        sprites.set(sprite.index, sprite);
        spritesGroup.add(sprite);
      }

      const unit = unitsBySprite.get(sprite.index);
      const dat = bwDat.sprites[spriteData.typeId];

      // const buildingIsExplored =
      //   sprite.unit &&
      //   sprite.unit.dat.isBuilding &&
      //   fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // show units as fog is lifting from or lowering to explored
      // show if a building has been explored
      sprite.visible =
        spriteData.owner === 11 ||
        dat.image.iscript === 336 ||
        dat.image.iscript === 337 ||
        fogOfWar.isSomewhatVisible(tile32(spriteData.x), tile32(spriteData.y)) || spriteIsHidden(spriteData);

      // if (!sprite.visible && !currentBwFrame?.needsUpdate) continue;
      // don't update explored building frames so viewers only see last built frame
      // const dontUpdate =
      //   buildingIsExplored &&
      //   !fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      sprite.renderOrder = spriteSortOrder(spriteData as SpriteStruct) * 10;

      const x = pxToGameUnit.x(spriteData.x);
      const z = pxToGameUnit.y(spriteData.y);
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

      const player = players.playersById[spriteData.owner];

      let imageCounter = 0;

      let imgAddr = spriteData.lastImage;
      // for (const imgAddr of spriteData.images.reverse()) {
      do {
        const imageData = imageBufferView.get(imgAddr);

        let image = images.get(imageData.index);
        if (!image) {
          image = createImage(imageData.typeId);
          images.set(imageData.index, image);
          sprite.add(image);
          image.sprite = sprite;
        }
        // image.visible = !isHidden(imageData as ImageStruct) || redraw(imageData as ImageStruct);

        if (image.visible || currentBwFrame!.needsUpdate) {

          if (player) {
            image.setTeamColor(player.color.three);
          }

          // overlay position
          image.offsetX = image.position.x = imageData.x / 32;
          image.offsetY = image.position.z = imageData.y / 32;
          image.renderOrder = sprite.renderOrder + imageCounter;

          // 63-48=15
          if (imageData.modifier === 14) {
            image.setWarpingIn((imageData.modifierData1 - 48) / 15);
          } else {
            //@todo see if we even need this
            image.setWarpingIn(0);
          }
          //@todo use modifier 1 for opacity value
          image.setCloaked(imageData.modifier === 2 || imageData.modifier === 5);

          let z = 0;

          if (hasDirectionalFrames(imageData as ImageStruct)) {
            const flipped = isFlipped(imageData as ImageStruct);
            const direction = flipped ? 32 - imageData.frameIndexOffset : imageData.frameIndexOffset;
            const newFrameOffset = (direction + camera.userData.direction) % 32;

            if (newFrameOffset > 16) {
              image.setFrame(imageData.frameIndexBase + 32 - newFrameOffset, true);
            } else {
              image.setFrame(imageData.frameIndexBase + newFrameOffset, false);
            }
          } else {
            image.setFrame(imageData.frameIndex, isFlipped(imageData as ImageStruct));
          }

          if (imageData.index === spriteData.mainImageIndex) {

            z = image._zOff * image.unitTileScale;
            const unit = unitsBySprite.get(sprite.index);
            if (unit) {
              // for 3d models
              // image.rotation.y = unit.angle;
            }

            if (isClickable(imageData as ImageStruct)) {
              sprite.layers.enable(Layers.Clickable);
              image.layers.enable(Layers.Clickable);
            }
            sprite.mainImage = image;
          }

          //@todo is this the reason for overlays displaying in 0,0?
          // sprite.position.z += z - sprite.lastZOff;
          sprite.lastZOff = z;
        }
        imageCounter++;
        imgAddr = imageData.nextNode;
      } while (imgAddr !== spriteData.endImageIterate);
    }
    // }
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

  const targetObj = new Mesh(new SphereBufferGeometry(), new MeshBasicMaterial({ color: 0xffffff }));
  if (settings.controls.debug) {
    scene.add(targetObj);
  }

  const GAME_LOOP = (elapsed: number) => {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    controls.standard.update(delta / 1000);
    controls.mouse.update(delta / 100, controls);
    controls.keys.update(delta / 100, controls);

    if (settings.controls.debug) {
      //@ts-ignore
      const _tobj = controls.standard.getTarget();
      targetObj.position.set(_tobj.x, _tobj.y, _tobj.z);
    }

    if (reset) reset();

    if (!gameStatePosition.paused) {
      if (!currentBwFrame) {
        projectedCameraView.update();

        currentBwFrame = gameStateReader.next();
        if (!currentBwFrame || gameStatePosition.mode == GameStatePlayMode.SingleStep) {
          gameStatePosition.paused = true;
        } else if (currentBwFrame.needsUpdate === false) {
          currentBwFrame = null;
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
        units,
        unitsBySprite
      );
      buildMinimap(units, minimapImageData, minimapResourceImageData)
      buildSprites(delta);
      // buildResearchAndUpgrades(currentBwFrame);
      fogOfWar.texture.needsUpdate = true;
      creep.creepValuesTexture.needsUpdate = true;
      creep.creepEdgesValuesTexture.needsUpdate = true;

      soundChannels.play(elapsed);

      if (unitAttackScore) {
        controls.cameraShake.shake();
      }

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

    controls.standard.getTarget(_cameraTarget);

    {
      // const azi = constrainAzimuth(control.polarAngle);
      // control.minAzimuthAngle = -azi / 2;
      // control.maxAzimuthAngle = azi / 2;

      const dir = controls.standard.polarAngle < 0.25 ? 0 : getDirection32(projectedCameraView.center, camera.position);
      if (dir != camera.userData.direction) {
        camera.userData.prevDirection = camera.userData.direction;
        camera.userData.direction = dir;
        if (currentBwFrame) {
          currentBwFrame.needsUpdate = true;
        }
      }

      if (controls.cameraMode === CameraMode.Battle) {
        renderer.composerPasses.effects[Effects.DepthOfField].setTarget(projectedCameraView.center);
        renderer.composerPasses.effects[Effects.DepthOfField].getCircleOfConfusionMaterial().adoptCameraSettings(camera);
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

    // target.setY((target.y + camera.position.y) / 2);
    // target.setZ((target.z + camera.position.z) / 2);
    // audioMixer.update(target.x, target.y, target.z, delta);

    controls.cameraShake.update(camera);

    renderer.render(scene, camera, delta);
    cssRenderer.render(camera);
    drawMinimap(projectedCameraView);

    controls.cameraShake.restore(camera);

    projectedCameraView.update();
    gameStatePosition.update(delta);

    fps.update(elapsed);
    if (fps.frames === 0) {
      fpsEl!.textContent = fps.fps;
    }
  };

  // @ts-ignore
  window.GAME_LOOP = GAME_LOOP;
  // @ts-ignore
  janitor.callback(() => { window.GAME_LOOP = null; });

  const dispose = () => {
    log.info("disposing replay viewer");
    gameStatePosition.pause();
    janitor.mopUp();
    controls.dispose();
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
  // GAME_LOOP(0);
  _sceneResizeHandler();
  return {
    start: () => renderer.getWebGLRenderer().setAnimationLoop(GAME_LOOP),
    gameSurface,
    minimapSurface,
    players,
    gameStatePosition,
    dispose,
  };
}

export default TitanReactorGame;
