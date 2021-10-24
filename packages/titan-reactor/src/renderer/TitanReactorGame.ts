import { debounce } from "lodash";
import shuffle from "lodash.shuffle";
import { unstable_batchedUpdates } from "react-dom";
import { MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { BwDATType } from "../common/bwdat/core/BwDAT";
import { commands } from "../common/bwdat/enums/commands";
import { unitTypes } from "../common/bwdat/enums/unitTypes";
import CanvasTarget from "../common/image/CanvasTarget";
import { RenderMode } from "../common/settings";
import { ChkUnitType } from "../common/types/common";
import { ReplayPlayer } from "../common/types/replay";
import { TerrainInfo } from "../common/types/terrain";
import { buildPlayerColor, injectColorsCss } from "../common/utils/colors";
import { gameSpeeds, pxToMapMeter } from "../common/utils/conversions";
import AudioMaster from "./audio/AudioMaster";
import BWFrameSceneBuilder from "./BWFrameSceneBuilder";
import CameraRig from "./camera/CameraRig";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import Creep from "./creep/Creep";
import FogOfWar from "./fogofwar/FogOfWar";
import FrameBW from "./game-data/FrameBW";
import StreamGameStateReader from "./game-data/readers/StreamGameStateReader";
import Apm from "./game/Apm";
import BuildUnits from "./game/BuildUnits";
import { GameStatePosition } from "./game/GameStatePosition";
import MinimapCanvasDrawer from "./game/MinimapCanvasDrawer";
import MouseCursor from "./game/MouseCursor";
import { Players } from "./game/Players";
import InputEvents from "./input/InputEvents";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import MinimapControl from "./input/MinimapControl";
import GameCanvasTarget from "./render/GameCanvasTarget";
import RenderMan from "./render/RenderMan";
import Scene from "./render/Scene";
import useGameStore from "./stores/gameStore";
import useHudStore from "./stores/hudStore";
import useProductionStore from "./stores/realtime/productionStore";
import useResourcesStore from "./stores/realtime/resourcesStore";
import useUnitSelectionStore from "./stores/realtime/unitSelectionStore";
import useSettingsStore from "./stores/settingsStore";
import preloadScene from "./utils/preloadScene";

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
  gameStateReader: StreamGameStateReader,
  bwDat : BwDATType,
  createTitanImage,
  audioMaster: AudioMaster
) {
  let settings = useSettingsStore.getState().data;
  if(!settings) {
    throw new Error("Settings not loaded");
  }
  const cursor = new MouseCursor();
  cursor.pointer();

  const { mapWidth, mapHeight } = terrainInfo;

  const renderMan = new RenderMan(settings);

  const keyboardShortcuts = new KeyboardShortcuts(window.document.body);

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

  await renderMan.initRenderer(cameraRig.camera);
  //@ts-ignore
  window.renderMan = renderMan;

  if (settings.renderMode !== RenderMode.ThreeD) {
    renderMan.renderer.shadowMap.autoUpdate = false;
    renderMan.renderer.shadowMap.needsUpdate = true;
  }

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderMan.fogOfWarEffect);

  const customColors = settings.randomizeColorOrder
    ? shuffle(settings.playerColors)
    : settings.playerColors;
  const playerColors = rep.header.players.map(({ id, color } : ReplayPlayer, i:number) =>
    buildPlayerColor(settings?.useCustomColors ? customColors[i] : color.hex, id)
  );
  const players = new Players(
    rep.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    playerColors
  );
  injectColorsCss(playerColors);

  audioMaster.music.playGame();

  let gameStatePosition = new GameStatePosition(
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
      gameStatePosition.skipGameFrames = 1;
    }
  };
  document.addEventListener("keydown", nextFrameHandler);

  //@ts-ignore
  window.cameras = cameraRig;
  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

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

  const units = new BuildUnits(
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
    units
  );

  const projectedCameraView = new ProjectedCameraView(
    cameraRig.camera,
    mapWidth,
    mapHeight
  );
  const frameBuilder = new BWFrameSceneBuilder(
    scene,
    creep,
    bwDat,
    pxToGameUnit,
    terrainInfo.getTerrainY,
    players,
    fogOfWar,
    audioMaster,
    createTitanImage,
    projectedCameraView
  );

  cursor.init(
    projectedCameraView,
    gameSurface,
    terrainInfo,
    cameraRig.camera,
    frameBuilder
  );

  let _lastElapsed = 0;
  let delta = 0;

  const apm = new Apm(players);
  projectedCameraView.update();

  function gameLoop(elapsed: number) {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    cameraRig.update();
    orbitControls.update();

    if (!gameStatePosition.paused) {
      // prepare next frame, skipgameframes may be 1 which tells us we have 1 frame to process

      if (gameStatePosition.skipGameFrames && !currentBwFrame) {
        currentBwFrame = nextBwFrame;

        projectedCameraView.update();

        //@todo fix reading multiple frames, since they get unmarked, currentBwFrame gets used
        // gameStateReader.next(gameStatePosition.skipGameFrames - 1);
        nextBwFrame = gameStateReader.nextOne();
        if (nextBwFrame) {
          // get creep, fog of war, sounds, etc. ready ahead of time if possible
          frameBuilder.prepare(nextBwFrame, elapsed);
        } else {
          gameStatePosition.paused = true;
        }
      }

      if (currentBwFrame) {
        gameStatePosition.bwGameFrame = currentBwFrame.frame;
        if (gameStatePosition.bwGameFrame % 8 === 0) {
          scene.incrementTileAnimation();
        }

        frameBuilder.update(currentBwFrame, delta, elapsed, units);

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

        setAllProduction(
          frameBuilder.unitsInProduction,
          frameBuilder.research,
          frameBuilder.upgrades
        );
        // @todo why am I transferring this to the store?
        setSelectedUnits(useGameStore.getState().selectedUnits);

        apm.update(
          rep.cmds[gameStatePosition.bwGameFrame],
          gameStatePosition.bwGameFrame
        );

        if (rep.cmds[gameStatePosition.bwGameFrame]) {
          for (let cmd of rep.cmds[gameStatePosition.bwGameFrame]) {
            //@todo remove once we filter commands
            if (!players.playersById[cmd.player]) continue;

            if (
              cmd.id === commands.chat &&
              players.playersById[cmd.senderSlot]
            ) {
              unstable_batchedUpdates(() =>
                addChatMessage({
                  content: cmd.message,
                  player: players.playersById[cmd.senderSlot],
                })
              );
            }

            // if (players.playersById[cmd.player].showPov) {
            //   players.playersById[cmd.player].camera.update(cmd, pxToGameUnit);
            // } else {
            //   players.playersById[cmd.player].camera.update(
            //     cmd,
            //     pxToGameUnit,
            //     1000
            //   );
            // }

            if (players.playersById[cmd.player].showActions) {
              switch (cmd.id) {
                case commands.rightClick:
                case commands.targetedOrder:
                case commands.build: {
                  const px = pxToGameUnit.x(cmd.x);
                  const py = pxToGameUnit.y(cmd.y);
                  const pz = terrainInfo.getTerrainY(px, py);

                  // fadingPointers.addPointer(
                  //   px,
                  //   py,
                  //   pz,
                  //   players.playersById[cmd.player].color.rgb,
                  //   gameStatePosition.bwGameFrame
                  // );
                }
              }
            }
          }
        }
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

    renderMan.setCanvasTarget(gameSurface);

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

    renderMan.enableCinematicPass();
    renderMan.updateFocus(cameraRig.camera);
    fogOfWar.update(cameraRig.camera);
    renderMan.render(scene, cameraRig.camera, delta);
    // }

    minimapCanvasDrawer.draw(projectedCameraView);

    // update camera view box if paused so we can properly update the minimap
    if (gameStatePosition.paused) {
      projectedCameraView.update();
    }

    gameStatePosition.update(delta);
  }

  const dispose = () => {
    console.log("disposing");

    //@ts-ignore
    window.cameras = null;
    //@ts-ignore
    window.scene = null;
    //@ts-ignore
    window.renderMan = null;

    audioMaster.dispose();
    renderMan.dispose();
    gameStatePosition.pause();
    window.removeEventListener("resize", sceneResizeHandler, false);

    // minimapControl.dispose();
    scene.dispose();
    cameraRig.dispose();

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
    if (!settings) return

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

    for (let player of players) {
      if (player.vision !== state.playerVision[player.id]) {
        player.vision = state.playerVision[player.id];
        fogOfWar.playerVisionWasToggled = true;
      }
    }
  });
  const unsubs = [unsub, unsub3];

  //run 1 frame
  gameStatePosition.resume();
  gameStatePosition.skipGameFrames = 1;
  gameLoop(0);
  gameLoop(0);
  _sceneResizeHandler();
  preloadScene(renderMan.renderer, scene, cameraRig.compileCamera)

  //preload scene

  return {
    start: () => renderMan.setAnimationLoop(gameLoop),
    gameSurface,
    minimapSurface,
    players,
    gameStatePosition,
    dispose,
  };
}

export default TitanReactorGame;
