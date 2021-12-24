import { debounce } from "lodash";
import shuffle from "lodash.shuffle";
import { unstable_batchedUpdates } from "react-dom";
import { Group, MathUtils, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { CommandsStream } from "downgrade-replay";
import TechUpgradesWorker from "./tech-upgrades/tech-upgrades.worker";
import { unitTypes } from "../common/bwdat/enums";
import { CanvasTarget } from "../common/image";
import { SpriteTextureResolution } from "../common/types";
import {
  BwDAT,
  ChkUnitType,
  ReplayPlayer,
  TerrainInfo,
  createTitanImage,
  SpriteIndex,
  UnitTag,
  ResearchCompleted,
  ResearchInProduction,
  UnitInProduction,
  UpgradeCompleted,
  UpgradeInProduction,
} from "../common/types";
import { buildPlayerColor, injectColorsCss } from "../common/utils/colors";
import { gameSpeeds, pxToMapMeter } from "../common/utils/conversions";
import AudioMaster from "./audio/audio-master";
import CameraRig from "./camera/camera-rig";
import ProjectedCameraView from "./camera/projected-camera-view";
import Creep from "./creep/creep";
import FogOfWar from "./fogofwar/fog-of-war";
import {
  Apm,
  GameStatePosition,
  Players,
} from "./core";
import StreamGameStateReader from "./integration/fixed-data/readers/stream-game-state-reader";
import { InputEvents, KeyboardShortcuts, MinimapControl, MouseInteraction } from "./input";
import { GameCanvasTarget, Renderer, Scene, MinimapCanvasDrawer, BuildUnits } from "./render";
import {
  useGameStore,
  useHudStore,
  useProductionStore,
  useResourcesStore,
  useSettingsStore,
  useUnitSelectionStore,
} from "./stores";
import preloadScene from "./utils/preload-scene";
import {
  BuildingQueueCountBW,
  CreepBW,
  FrameBW,
  ImagesBW,
  ResearchBW,
  SoundsBW,
  SpritesBW,
  TilesBW,
  UnitsBW,
  UpgradeBW,
} from "./integration/fixed-data";
import { Image, Unit, Sprite } from "./core";

const setSelectedUnits = useUnitSelectionStore.getState().setSelectedUnits;
const setAllProduction = useProductionStore.getState().setAllProduction;
const setAllResources = useResourcesStore.getState().setAllResources;
const { startLocation } = unitTypes;

const addChatMessage = useGameStore.getState().addChatMessage;

async function TitanReactorGame(
  scene: Scene,
  terrainInfo: TerrainInfo,
  preplacedMapUnits: ChkUnitType[],
  rep,
  commandsStream: CommandsStream,
  gameStateReader: StreamGameStateReader,
  bwDat: BwDAT,
  createTitanImage: createTitanImage,
  audioMaster: AudioMaster
) {
  let settings = useSettingsStore.getState().data;
  if (!settings) {
    throw new Error("Settings not loaded");
  }
  const cursor = new MouseInteraction();
  cursor.pointer();

  const { mapWidth, mapHeight } = terrainInfo;

  const renderer = new Renderer(settings);

  const keyboardShortcuts = new KeyboardShortcuts(window.document);

  const gameSurface = new GameCanvasTarget(settings);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  useGameStore.setState({
    dimensions: gameSurface.getRect(),
  });

  const minimapSurface = new CanvasTarget();

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight
  );

  //@ts-ignore
  window.scene = scene;

  const cameraRig = new CameraRig(
    settings,
    gameSurface,
    minimapSurface,
    minimapControl,
    keyboardShortcuts,
    true
  );


  const orbitControls = new OrbitControls(cameraRig.camera, gameSurface.canvas);
  orbitControls.listenToKeyEvents(window.document.body);
  orbitControls.dampingFactor = 0.25;
  orbitControls.enableDamping = true;
  orbitControls.minDistance = 10;
  orbitControls.maxDistance = 100;
  orbitControls.maxPolarAngle = (26 * Math.PI) / 64;
  orbitControls.minPolarAngle = (4 * Math.PI) / 64;
  orbitControls.maxAzimuthAngle = (24 * Math.PI) / 64;
  orbitControls.minAzimuthAngle = -(24 * Math.PI) / 64;
  orbitControls.screenSpacePanning = false;
  orbitControls.mouseButtons = {
    LEFT: null,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };

  await renderer.init(cameraRig.camera);
  if (renderer.renderer === undefined) {
    throw new Error("Renderer not initialized");
  }

  //@ts-ignore
  window.renderMan = renderer;

  if (settings.renderMode !== SpriteTextureResolution.ThreeD && renderer.renderer) {
    renderer.renderer.shadowMap.autoUpdate = false;
    renderer.renderer.shadowMap.needsUpdate = true;
  }

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderer.fogOfWarEffect);

  const customColors = settings.randomizeColorOrder
    ? shuffle(settings.playerColors)
    : settings.playerColors;
  const playerColors = rep.header.players.map(
    ({ id, color }: ReplayPlayer, i: number) =>
      buildPlayerColor(
        settings?.useCustomColors ? customColors[i] : color.hex,
        id
      )
  );
  const players = new Players(
    rep.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    playerColors
  );
  injectColorsCss(playerColors);

  audioMaster.music.playGame();

  const gameStatePosition = new GameStatePosition(
    rep.header.frameCount,
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

  keyboardShortcuts.addEventListener(InputEvents.TogglePlay, togglePlayHandler);

  const toggleMenuHandler = () => useHudStore.getState().toggleInGameMenu();
  keyboardShortcuts.addEventListener(InputEvents.ToggleMenu, toggleMenuHandler);

  const toggleElevationHandler = () => scene.toggleElevation();
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleElevation,
    toggleElevationHandler
  );

  const nextFrameHandler = (evt: KeyboardEvent) => {
    if (evt.code === "KeyN") {
      gameStatePosition.advanceGameFrames = 1;
    }
  };
  document.addEventListener("keydown", nextFrameHandler);

  //@ts-ignore
  window.cameras = cameraRig;
  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

    cameraRig.updateGameScreenAspect(gameSurface.width, gameSurface.height);
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

    cameraRig.updatePreviewScreenAspect(
      minimapSurface.width,
      minimapSurface.height
    );

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

  let nextBwFrame: FrameBW, currentBwFrame: FrameBW | null;

  const buildUnits = new BuildUnits(
    bwDat,
    players.playersById,
    mapWidth,
    mapHeight,
    fogOfWar
  );

  const creep = new Creep(
    mapWidth,
    mapHeight,
    terrainInfo.creepTextureUniform.value,
    terrainInfo.creepEdgesTextureUniform.value
  );

  const minimapCanvasDrawer = new MinimapCanvasDrawer(
    "white",
    minimapSurface,
    terrainInfo.minimapBitmap,
    mapWidth,
    mapHeight,
    fogOfWar,
    creep,
    buildUnits
  );

  const projectedCameraView = new ProjectedCameraView(
    cameraRig.camera,
    mapWidth,
    mapHeight
  );

  const soundsBW = new SoundsBW(pxToGameUnit, terrainInfo.getTerrainY);
  const buildSounds = (bwFrame: FrameBW) => {
    soundsBW.count = bwFrame.soundCount;
    soundsBW.buffer = bwFrame.sounds;

    for (const sound of soundsBW.items()) {
      if (!fogOfWar.isVisible(sound.tileX, sound.tileY)) {
        continue;
      }
      const volume = sound.bwVolume(
        projectedCameraView.left,
        projectedCameraView.top,
        projectedCameraView.right,
        projectedCameraView.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        audioMaster.channels.queue(sound.object());
      }
    }
  };

  const tilesBW = new TilesBW();
  const buildFog = (bwFrame: FrameBW): void => {
    tilesBW.count = bwFrame.tilesCount;
    tilesBW.buffer = bwFrame.tiles;

    fogOfWar.generate(
      tilesBW,
      players
        .filter((p) => p.vision)
        .reduce((flags, { id }) => (flags |= 1 << id), 0),
      bwFrame.frame
    );
  };

  const creepBW = new CreepBW();
  const buildCreep = (bwFrame: FrameBW) => {
    creepBW.count = bwFrame.creepCount;
    creepBW.buffer = bwFrame.creep;
    creep.generate(creepBW, bwFrame.frame);
  };

  const unitsBW = new UnitsBW();
  const buildQueueBW = new BuildingQueueCountBW();
  const units: Map<UnitTag, Unit> = new Map();
  const unitsBySpriteId: Map<SpriteIndex, Unit> = new Map();
  const unitsInProduction: UnitInProduction[] = [];

  const buildUnitsAndMinimap = (bwFrame: FrameBW) => {
    unitsBW.count = bwFrame.unitCount;
    unitsBW.buffer = bwFrame.units;

    buildQueueBW.count = bwFrame.buildingQueueCount;
    buildQueueBW.buffer = bwFrame.buildingQueue;

    buildUnits.refresh(
      unitsBW,
      buildQueueBW,
      units,
      unitsBySpriteId,
      unitsInProduction
    );
  };

  const sprites: Map<SpriteIndex, Sprite> = new Map();
  const spritesBW = new SpritesBW();
  const imagesBW = new ImagesBW();
  let research: ResearchInProduction[][] = [];
  let upgrades: UpgradeInProduction[][] = [];
  let completedUpgrades: UpgradeCompleted[][] = [];
  let completedResearch: ResearchCompleted[][] = [];
  const group = new Group();
  scene.add(group);

  const interactableSprites: Image[] = [];
  const buildSprites = (bwFrame: FrameBW, delta: number) => {
    group.clear();
    spritesBW.count = bwFrame.spriteCount;
    spritesBW.buffer = bwFrame.sprites;

    // we set count below
    imagesBW.buffer = bwFrame.images;
    interactableSprites.length = 0;

    for (const spriteBW of spritesBW.items()) {
      let sprite = sprites.get(spriteBW.index);
      if (!sprite) {
        sprite = new Sprite(spriteBW.index, spriteBW.dat);
        sprites.set(spriteBW.index, sprite);
      }
      sprite.spriteDAT = spriteBW.dat;

      const buildingIsExplored =
        sprite.unit &&
        sprite.unit.dat.isBuilding &&
        fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // show units as fog is lifting from or lowering to explored
      // show if a building has been explored
      sprite.visible =
        spriteBW.owner === 11 ||
        spriteBW.dat.image.iscript === 336 ||
        spriteBW.dat.image.iscript === 337 ||
        fogOfWar.isSomewhatVisible(spriteBW.tileX, spriteBW.tileY);

      // don't update explored building frames so viewers only see last built frame
      const dontUpdate =
        buildingIsExplored &&
        !fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      sprite.clear();

      sprite.renderOrder = spriteBW.order * 10;
      let _imageRenderOrder = sprite.renderOrder;

      const x = pxToGameUnit.x(spriteBW.x);
      const z = pxToGameUnit.y(spriteBW.y);
      let y = terrainInfo.getTerrainY(x, z);

      sprite.unit = unitsBySpriteId.get(spriteBW.index);
      if (sprite.unit) {
        if (sprite.unit.isFlying) {
          const targetY = Math.min(6, y + 2.5);
          if (sprite.position.y === 0) {
            y = targetY;
          } else {
            y = MathUtils.damp(sprite.position.y, targetY, 0.001, delta);
          }
        }

        //if selected show selection sprites, also check canSelect again in case it died
        if (sprite.unit.selected && sprite.unit.canSelect) {
          sprite.select(completedUpgrades);
        } else {
          sprite.unselect();
        }
      }

      // liftoff z - 42, y+
      // landing z + 42, y-

      sprite.position.set(x, y, z);

      const player = players.playersById[spriteBW.owner];

      sprite.mainImage = null;

      for (const image of imagesBW.reverse(spriteBW.imageCount)) {
        if (image.hidden) continue;

        //@todo we should clear sprite.images, and somehow incorporate "free images" for re-use
        const titanImage =
          sprite.images.get(image.id) || createTitanImage(image.id, sprite);
        if (!titanImage) continue;
        sprite.add(titanImage);

        // if (!sprite.visible || dontUpdate) {
        //   continue;
        // }

        if (player) {
          titanImage.setTeamColor(player.color.three);
        }
        // overlay position
        titanImage.offsetX = titanImage.position.x = image.x / 32;
        titanImage.offsetY = titanImage.position.z = image.y / 32;
        titanImage.renderOrder = _imageRenderOrder++;

        // 63-48=15
        if (image.modifier === 14) {
          titanImage.setWarpingIn((image.modifierData1 - 48) / 15);
        } else {
          //@todo see if we even need this
          titanImage.setWarpingIn(0);
        }
        //@todo use modifier 1 for opacity value
        titanImage.setCloaked(image.modifier === 2 || image.modifier === 5);

        titanImage.setFrame(image.frameIndex, image.flipped);

        if (!sprite.images.has(image.id)) {
          sprite.images.set(image.id, titanImage);
        }

        let z = 0;
        if (image.index === spriteBW.mainImageIndex) {
          sprite.mainImage = titanImage;
          z = titanImage._zOff * (titanImage._spriteScale / 32); //x4 for HD

          if (sprite.unit) {
            titanImage.rotation.y = sprite.unit.angle;
            if (!image.dat.clickable) {
              sprite.unit.canSelect = false;
            }
            if (sprite.unit.canSelect) {
              //@todo change to layer
              interactableSprites.push(titanImage);
            }
          }
        }
        //@todo is this the reason for overlays displaying in 0,0?
        // sprite.position.z += z - sprite.lastZOff;
        sprite.lastZOff = z;
      }

      group.add(sprite);
    }
  };

  let _notifiedHudOfTech = false;
  const _notifyHudOfTech = () => {
    if (_notifiedHudOfTech) return;
    unstable_batchedUpdates(() =>
      useHudStore.setState({
        hasTech: true,
      })
    );
    _notifiedHudOfTech = true;
  };

  let _notifiedHudOfUpgrades = false;
  const _notifyHudOfUpgrades = () => {
    if (_notifiedHudOfUpgrades) return;
    unstable_batchedUpdates(() =>
      useHudStore.setState({
        hasUpgrades: true,
      })
    );
    _notifiedHudOfUpgrades = true;
  };

  const techUpgradesWorker = new TechUpgradesWorker();
  techUpgradesWorker.postMessage({
    type: "init",
    techDat: bwDat.tech,
    upgradesDat: bwDat.upgrades,
  });

  //@todo type workers
  techUpgradesWorker.onmessage = ({ data }: any) => {
    const {
      techNearComplete,
      upgradeNearComplete,
      hasTech,
      hasUpgrade,
      research: _research,
      upgrades: _upgrades,
      completedUpgrades: _completedUpgrades,
      completedResearch: _completedResearch,
    } = data;

    if (hasUpgrade) {
      _notifyHudOfUpgrades();
    }

    if (upgradeNearComplete) {
      useHudStore.getState().onUpgradeNearComplete();
    }

    if (hasTech) {
      _notifyHudOfTech();
    }

    if (techNearComplete) {
      useHudStore.getState().onTechNearComplete();
    }

    research = _research;
    upgrades = _upgrades;
    completedUpgrades = _completedUpgrades;
    completedResearch = _completedResearch;
  };

  const researchBW = new ResearchBW();
  const upgradeBW = new UpgradeBW();
  const buildResearchAndUpgrades = (bwFrame: FrameBW) => {
    researchBW.count = bwFrame.researchCount;
    researchBW.buffer = bwFrame.research;
    upgradeBW.count = bwFrame.upgradeCount;
    upgradeBW.buffer = bwFrame.upgrades;

    const msg = {
      frame: bwFrame.frame,
      researchCount: bwFrame.researchCount,
      researchBuffer: bwFrame.research,
      upgradeCount: bwFrame.upgradeCount,
      upgradeBuffer: bwFrame.upgrades,
    };

    techUpgradesWorker.postMessage(msg);
  };

  cursor.init(
    projectedCameraView,
    gameSurface,
    terrainInfo,
    cameraRig.camera,
    interactableSprites,
    unitsBySpriteId
  );

  let _lastElapsed = 0;
  let delta = 0;

  const apm = new Apm(players);
  projectedCameraView.update();

  const cmds = commandsStream.generate();

  const gameLoop = (elapsed: number) => {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    cameraRig.update();
    orbitControls.update();

    if (!gameStatePosition.paused) {
      if (gameStatePosition.advanceGameFrames && !currentBwFrame) {
        currentBwFrame = nextBwFrame;

        projectedCameraView.update();

        //@todo fix reading multiple frames, since they get unmarked, currentBwFrame gets used
        // gameStateReader.next(gameStatePosition.skipGameFrames - 1);
        nextBwFrame = gameStateReader.nextOne();
        if (nextBwFrame) {
          // get creep, fog of war, sounds, etc. ready ahead of time if possible
          buildSounds(nextBwFrame);
          buildFog(nextBwFrame);
          buildCreep(nextBwFrame);
        } else {
          gameStatePosition.paused = true;
        }
      }

      if (currentBwFrame) {
        gameStatePosition.bwGameFrame = currentBwFrame.frame;
        if (gameStatePosition.bwGameFrame % 8 === 0) {
          scene.incrementTileAnimation();
        }

        buildUnitsAndMinimap(currentBwFrame);
        buildSprites(currentBwFrame, delta);
        buildResearchAndUpgrades(currentBwFrame);
        fogOfWar.texture.needsUpdate = true;
        creep.creepValuesTexture.needsUpdate = true;
        creep.creepEdgesValuesTexture.needsUpdate = true;

        audioMaster.channels.play(elapsed);

        setAllResources(
          currentBwFrame.minerals,
          currentBwFrame.gas,
          currentBwFrame.supplyUsed,
          currentBwFrame.supplyAvailable,
          currentBwFrame.workerSupply,
          apm.apm,
          gameStatePosition.getFriendlyTime()
        );

        setAllProduction(unitsInProduction, research, upgrades);
        // @todo why am I transferring this to the store?
        setSelectedUnits(useGameStore.getState().selectedUnits);

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
          apm.update(cmdsThisFrame, gameStatePosition.bwGameFrame);
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
      } // end of bwframe update
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

    cameraRig.updateDirection32();

    renderer.setCanvasTarget(gameSurface);

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

    // const target = cameraRig.getTarget();
    // target.setY((target.y + cameraRig.camera.position.y) / 2);
    // target.setZ((target.z + cameraRig.camera.position.z) / 2);
    // audioMaster.update(target.x, target.y, target.z, delta);

    renderer.enableCinematicPass();
    renderer.updateFocus(cameraRig.camera);
    fogOfWar.update(cameraRig.camera);
    renderer.render(scene, cameraRig.camera, delta);
    // }

    minimapCanvasDrawer.draw(projectedCameraView);

    // update camera view box if paused so we can properly update the minimap
    if (gameStatePosition.paused) {
      projectedCameraView.update();
    }

    gameStatePosition.update(delta);
  };

  const dispose = () => {
    console.log("disposing");

    //@ts-ignore
    window.cameras = null;
    //@ts-ignore
    window.scene = null;
    //@ts-ignore
    window.renderMan = null;

    audioMaster.dispose();
    renderer.dispose();
    gameStatePosition.pause();
    window.removeEventListener("resize", sceneResizeHandler, false);

    // minimapControl.dispose();
    scene.dispose();
    cameraRig.dispose();
    techUpgradesWorker.terminate();

    document.removeEventListener("keydown", nextFrameHandler);
    keyboardShortcuts.removeEventListener(
      InputEvents.TogglePlay,
      togglePlayHandler
    );

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleMenu,
      toggleMenuHandler
    );
    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleElevation,
      toggleElevationHandler
    );

    window.document.body.style.cursor = "";

    gameStateReader.dispose();
    unsubs.forEach((unsubscribe) => unsubscribe());
    cursor.dispose();
  };

  window.onbeforeunload = dispose;

  const unsub = useSettingsStore.subscribe((state) => {
    settings = state.data;
    if (!settings) return;

    if (audioMaster.musicVolume !== settings.musicVolume) {
      audioMaster.musicVolume = settings.musicVolume;
    }

    if (audioMaster.soundVolume !== settings.soundVolume) {
      audioMaster.soundVolume = settings.soundVolume;
    }
  });

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
  const unsubs = [unsub, unsub3];

  //run 1 frame
  gameStatePosition.resume();
  gameStatePosition.advanceGameFrames = 1;
  gameLoop(0);
  _sceneResizeHandler();
  preloadScene(renderer.renderer, scene, cameraRig.compileCamera);

  //preload scene

  return {
    start: () => renderer.renderer?.setAnimationLoop(gameLoop),
    gameSurface,
    minimapSurface,
    players,
    gameStatePosition,
    dispose,
  };
}

export default TitanReactorGame;
