import { strict as assert } from "assert";
import type { ChkUnit } from "bw-chk";
import { UnitFlags } from "../common/bwdat/enums";
import type { CommandsStream, Replay } from "downgrade-replay";
import { debounce } from "lodash";
import shuffle from "lodash.shuffle";
import { unstable_batchedUpdates } from "react-dom";
import { Group, MathUtils, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { playerColors, unitTypes } from "../common/bwdat/enums";
import { CanvasTarget } from "../common/image";
import {
  BwDAT,
  ReplayPlayer,
  ResearchCompleted,
  ResearchInProduction,
  SpriteIndex,
  TerrainInfo,
  UnitInProduction,
  UnitTag,
  UpgradeCompleted,
  UpgradeInProduction,
} from "../common/types";
import { buildPlayerColor, injectColorsCss } from "../common/utils/colors";
import { gameSpeeds, pxToMapMeter, tile32 } from "../common/utils/conversions";
import { MainMixer, Music, SoundChannels } from "./audio";
import CameraRig from "./camera/camera-rig";
import ProjectedCameraView from "./camera/projected-camera-view";
import {
  Apm,
  createImageFactory,
  GameStatePosition,
  Image,
  Players,
  Sprite,
  CrapUnit,
} from "./core";
import Creep from "./creep/creep";
import FogOfWar from "./fogofwar/fog-of-war";
import {
  InputEvents,
  KeyboardShortcuts,
  MinimapControl,
  MouseInteraction,
} from "./input";
import { FrameBW, SoundsBufferView } from "./integration/fixed-data";
import StreamGameStateReader from "./integration/fixed-data/readers/stream-game-state-reader";
import * as log from "./ipc/log";
import {
  BuildUnits,
  GameCanvasTarget,
  MinimapCanvasDrawer,
  Renderer,
  Scene,
} from "./render";
import {
  getAssets,
  getSettings,
  useGameStore,
  useHudStore,
  useProductionStore,
  useResourcesStore,
  useSettingsStore,
  useUnitSelectionStore,
} from "./stores";
// @ts-ignore
import TechUpgradesWorker from "./tech-upgrades/tech-upgrades.worker";
import Janitor from "./utils/janitor";
import { SoundStruct, SpriteStruct, ImageStruct } from "./integration/data-transfer";
import { EntityIterator } from "./integration/fixed-data/entity-iterator";
import { isFlipped, isHidden } from "./utils/image-utils";

const setSelectedUnits = useUnitSelectionStore.getState().setSelectedUnits;
const setAllProduction = useProductionStore.getState().setAllProduction;
const setAllResources = useResourcesStore.getState().setAllResources;
const { startLocation } = unitTypes;

const addChatMessage = useGameStore.getState().addChatMessage;

async function TitanReactorGame(
  scene: Scene,
  terrainInfo: TerrainInfo,
  preplacedMapUnits: ChkUnit[],
  rep: Replay,
  commandsStream: CommandsStream,
  gameStateReader: { next: () => FrameBW },
  bwDat: BwDAT,
  audioMixer: MainMixer,
  music: Music,
  soundChannels: SoundChannels,
  janitor: Janitor
) {
  let settings = getSettings();
  const assets = getAssets();
  assert(assets);

  const createImage = createImageFactory(
    assets.bwDat,
    assets.grps,
    settings.assets.images
  );

  const cursor = new MouseInteraction();
  janitor.disposable(cursor);

  cursor.pointer();

  const { mapWidth, mapHeight } = terrainInfo;

  const renderer = new Renderer(settings);
  janitor.disposable(renderer);

  const keyboardShortcuts = new KeyboardShortcuts(window.document.body);
  janitor.disposable(keyboardShortcuts);

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
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight
  );
  janitor.disposable(minimapControl);

  //@ts-ignore
  window.scene = scene;
  //@ts-ignore
  janitor.callback(() => (window.scene = null));

  const cameraRig = new CameraRig({
    settings,
    gameSurface,
    previewSurface: minimapSurface,
    minimapControl,
    keyboardShortcuts,
    freeControl: true,
  });
  janitor.disposable(cameraRig);

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
    // @ts-ignore
    LEFT: null,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  janitor.disposable(orbitControls);

  await renderer.init(cameraRig.camera);
  if (renderer.renderer === undefined) {
    throw new Error("Renderer not initialized");
  }

  //@ts-ignore
  window.renderMan = renderer;
  //@ts-ignore
  janitor.callback(() => (window.renderMan = null));

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderer.fogOfWarEffect);
  janitor.disposable(fogOfWar);

  const customColors = settings.playerColors.randomizeOrder
    ? shuffle(playerColors)
    : playerColors;

  const _playerColors = rep.header.players.map(
    ({ id, color }: ReplayPlayer, i: number) =>
      buildPlayerColor(
        settings.playerColors.ignoreReplayColors
          ? customColors[i].hex
          : color.hex,
        id
      )
  );
  const players = new Players(
    rep.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    _playerColors
  );
  injectColorsCss(_playerColors);

  music.playGame();

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
  window.cameras = cameraRig;
  //@ts-ignore
  janitor.callback(() => (window.cameras = null));

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
  janitor.callback(() =>
    window.removeEventListener("resize", sceneResizeHandler)
  );

  let currentBwFrame: FrameBW | null;

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
  janitor.disposable(creep);

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

  const buildSounds = (sounds: EntityIterator<SoundStruct>) => {
    for (const sound of sounds.instances()) {
      if (!fogOfWar.isVisible(tile32(sound.x), tile32(sound.y))) {
        continue;
      }
      const metadata = soundChannels.getSoundMetadata(sound);
      const volume = SoundsBufferView.getBwVolume(
        metadata,
        sound,
        projectedCameraView.left,
        projectedCameraView.top,
        projectedCameraView.right,
        projectedCameraView.bottom
      );
      if (volume > SoundsBufferView.minPlayVolume) {
        soundChannels.queue(sound);
      }
    }
  };

  const buildFog = (bwFrame: FrameBW): void => {
    fogOfWar.generate(bwFrame.tiles, players.getVisionFlag(), bwFrame.frame);
  };

  const buildCreep = (bwFrame: FrameBW) => {
    creep.generate(bwFrame.tiles, bwFrame.frame);
  };

  const units: Map<UnitTag, CrapUnit> = new Map();
  const unitsBySpriteId: Map<SpriteIndex, CrapUnit> = new Map();
  const unitsInProduction: UnitInProduction[] = [];

  // @todo remove, mostly crap
  const buildUnitsAndMinimap = (bwFrame: FrameBW) => {
    buildUnits.refresh(
      bwFrame.units,
      bwFrame.buildingQueue,
      units,
      unitsBySpriteId,
      unitsInProduction
    );
  };

  const sprites: Map<number, Sprite> = new Map();
  const images: Map<number, Image> = new Map();
  // let research: ResearchInProduction[][] = [];
  // let upgrades: UpgradeInProduction[][] = [];
  // let completedUpgrades: UpgradeCompleted[][] = [];
  // let completedResearch: ResearchCompleted[][] = [];
  const group = new Group();
  scene.add(group);

  const buildSprites = (spritesBW: EntityIterator<SpriteStruct>, delta: number) => {
    group.clear();
    // we set count below

    let order = 0;
    for (const spriteData of spritesBW.items()) {
      order++;
      let sprite = sprites.get(spriteData.titanIndex);
      if (!sprite) {
        sprite = new Sprite(
          spriteData.titanIndex,
          bwDat.sprites[spriteData.typeId]
        );
        sprites.set(spriteData.titanIndex, sprite);
      }

      // const buildingIsExplored =
      //   sprite.unit &&
      //   sprite.unit.dat.isBuilding &&
      //   fogOfWar.isExplored(spriteBW.tileX, spriteBW.tileY);

      // doodads and resources are always visible
      // show units as fog is lifting from or lowering to explored
      // show if a building has been explored
      sprite.visible =
        spriteData.owner === 11 ||
        // spriteBW.dat.image.iscript === 336 ||
        // spriteBW.dat.image.iscript === 337 ||
        fogOfWar.isSomewhatVisible(tile32(spriteData.position.x), tile32(spriteData.position.y));

      // don't update explored building frames so viewers only see last built frame
      // const dontUpdate =
      //   buildingIsExplored &&
      //   !fogOfWar.isVisible(spriteBW.tileX, spriteBW.tileY);

      sprite.clear();

      let _imageRenderOrder = sprite.renderOrder = order * 10;

      const x = pxToGameUnit.x(spriteData.position.x);
      const z = pxToGameUnit.y(spriteData.position.y);
      let y = terrainInfo.getTerrainY(x, z);

      sprite.unit = unitsBySpriteId.get(spriteData.titanIndex);
      if (sprite.unit) {
        if (sprite.unit.statusFlags & UnitFlags.Flying) {
          const targetY = Math.min(6, y + 2.5);
          if (sprite.position.y === 0) {
            y = targetY;
          } else {
            y = MathUtils.damp(sprite.position.y, targetY, 0.001, delta);
          }
        }

        //if selected show selection sprites, also check canSelect again in case it died
        // if (sprite.unit.selected && sprite.unit.canSelect) {
        //   sprite.select(completedUpgrades[sprite.unit.ownerId]);
        // } else {
        //   sprite.unselect();
        // }
      }

      // liftoff z - 42, y+
      // landing z + 42, y-

      sprite.position.set(x, y, z);

      const player = players.playersById[spriteData.owner];

      for (const imageData of spriteData.images) {
        //@todo remove
        if (isHidden(imageData)) continue;

        //@todo we should clear sprite.images, and somehow incorporate "free images" for re-use
        const image = sprite.images.get(imageData.typeId) || createImage(imageData.typeId);
        if (!image) continue;
        sprite.add(image);

        // if (!sprite.visible || dontUpdate) {
        //   continue;
        // }

        if (player) {
          image.setTeamColor(player.color.three);
        }
        // overlay position
        // @ts-ignore
        image.offsetX = image.position.x = imageData.offset.x / 32;
        // @ts-ignore
        image.offsetY = image.position.z = imageData.offset.y / 32;
        image.renderOrder = _imageRenderOrder++;

        // 63-48=15
        if (imageData.modifier === 14) {
          image.setWarpingIn((imageData.modifierData1 - 48) / 15);
        } else {
          //@todo see if we even need this
          image.setWarpingIn(0);
        }
        //@todo use modifier 1 for opacity value
        image.setCloaked(imageData.modifier === 2 || imageData.modifier === 5);

        image.setFrame(imageData.frameIndex, isFlipped(imageData));

        if (!sprite.images.has(imageData.typeId)) {
          sprite.images.set(imageData.typeId, image);
        }

        let z = 0;
        if (imageData.titanIndex === spriteData.mainImageTitanIndex) {
          // @ts-ignore
          z = image._zOff * (image.imageScale / 32); //x4 for HD

          if (sprite.unit) {
            image.rotation.y = sprite.unit.angle;

            if (!bwDat.images[imageData.typeId].clickable) {
              sprite.unit.canSelect = false;
            }
            // if (sprite.unit.canSelect) {
            //   //@todo change to layer
            //   interactableSprites.push(image);
            // }
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
  janitor.callback(() => techUpgradesWorker.terminate());

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

    // research = _research;
    // upgrades = _upgrades;
    // completedUpgrades = _completedUpgrades;
    // completedResearch = _completedResearch;
  };

  const buildResearchAndUpgrades = (bwFrame: FrameBW) => {
    const msg = {
      frame: bwFrame.frame,
      researchCount: bwFrame.research.itemsCount,
      researchBuffer: bwFrame.research.copy(),
      upgradeCount: bwFrame.upgrades.itemsCount,
      upgradeBuffer: bwFrame.upgrades.copy(),
    };

    techUpgradesWorker.postMessage(msg);
  };

  cursor.init(
    projectedCameraView,
    gameSurface,
    terrainInfo,
    cameraRig.camera,
    unitsBySpriteId
  );

  let _lastElapsed = 0;
  let delta = 0;

  const apm = new Apm(players);
  projectedCameraView.update();

  const cmds = commandsStream.generate();

  // const _loadingGrp: boolean[] = [];
  // gameStateReader.on("frames", (frames: FrameBW[]) => {
  //   const images = new ImagesBW();

  //   for (const frame of frames) {
  //     images.buffer = frame.images;
  //     images.count = frame.imageCount;

  //     for (const image of images.items()) {
  //       const index = image.dat.index;
  //       if (!assets.grps[index] && !_loadingGrp[index]) {
  //         log.verbose('dynamic loading', index)
  //         _loadingGrp[index] = true;
  //         assets.loadImageAtlas(index);
  //       }
  //     }
  //   }
  // });

  //@ts-ignore
  window.pause = () => {
    gameStatePosition.togglePlay();
  }
  
  const gameLoop = (elapsed: number) => {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    cameraRig.update();
    orbitControls.update();

    if (!gameStatePosition.paused) {
      if (gameStatePosition.advanceGameFrames && !currentBwFrame) {
        projectedCameraView.update();

        currentBwFrame = gameStateReader.next();
        if (!currentBwFrame) {
          gameStatePosition.paused = true;
        } else {
          buildSounds(currentBwFrame.sounds);
          buildFog(currentBwFrame);
          buildCreep(currentBwFrame);

          gameStatePosition.bwGameFrame = currentBwFrame.frame;
          if (gameStatePosition.bwGameFrame % 8 === 0) {
            scene.incrementTileAnimation();
          }

          buildUnitsAndMinimap(currentBwFrame);
          buildSprites(currentBwFrame.sprites, delta);
          // buildResearchAndUpgrades(currentBwFrame);
          fogOfWar.texture.needsUpdate = true;
          creep.creepValuesTexture.needsUpdate = true;
          creep.creepEdgesValuesTexture.needsUpdate = true;

          soundChannels.play(elapsed);

          setAllResources(
            currentBwFrame.minerals,
            currentBwFrame.gas,
            currentBwFrame.supplyUsed,
            currentBwFrame.supplyAvailable,
            currentBwFrame.workerSupply,
            apm.apm,
            gameStatePosition.getFriendlyTime()
          );

          // setAllProduction(unitsInProduction, research, upgrades);
          // @todo why am I transferring this to the store?
          // setSelectedUnits(useGameStore.getState().selectedUnits);

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
        }
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
  // preloadScene(renderer.renderer, scene, cameraRig.compileCamera);

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
