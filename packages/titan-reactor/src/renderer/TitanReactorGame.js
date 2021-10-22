import { unstable_batchedUpdates } from "react-dom";
import { GameStatePosition } from "./game/GameStatePosition";
import { gameSpeeds, pxToMapMeter } from "../common/utils/conversions";
import HeatmapScore from "./react-ui/game/HeatmapScore";
import CameraRig from "./camera/CameraRig";
import MinimapControl from "./input/MinimapControl";
import MinimapCanvasDrawer from "./game/MinimapCanvasDrawer";
import { Players } from "./game/Players";
import { commands } from "../common/bw-types/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./camera/PlayerPovCamera";
import { unitTypes } from "../common/bw-types/unitTypes";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import InputEvents from "./input/InputEvents";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "../common/image/CanvasTarget";
import GameCanvasTarget from "./render/GameCanvasTarget";
import { RenderMode } from "../common/settings";
import Units from "./game/Units";
import FogOfWar from "./game/fogofwar/FogOfWar";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import BWFrameSceneBuilder from "./game/BWFrameSceneBuilder";
import Apm from "./game/Apm";
import { debounce } from "lodash";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MOUSE } from "three";
import { buildPlayerColor, injectColorsCss } from "../common/utils/colors";
import shuffle from "lodash.shuffle";

import MouseCursor from "./game/MouseCursor";

import useSettingsStore from "./stores/settingsStore";
import useGameStore from "./stores/gameStore";
import useHudStore from "./stores/hudStore";
import useUnitSelectionStore from "./stores/realtime/unitSelectionStore";
import useProductionStore from "./stores/realtime/productionStore";
import useResourcesStore from "./stores/realtime/resourcesStore";

import Creep from "./game/creep/Creep";

const setSelectedUnits = useUnitSelectionStore.getState().setSelectedUnits;
const setAllProduction = useProductionStore.getState().setAllProduction;
const setAllResources = useResourcesStore.getState().setAllResources;
const { startLocation } = unitTypes;

const addChatMessage = useGameStore.getState().addChatMessage;

async function TitanReactorGame(
  scene,
  terrainInfo,
  preplacedMapUnits,
  rep,
  gameStateReader,
  bwDat,
  createTitanImage,
  audioMaster
) {
  let settings = useSettingsStore.getState().data;

  const cursor = new MouseCursor();
  cursor.pointer();

  const { mapWidth, mapHeight } = terrainInfo;
  scene.mapWidth = mapWidth;
  scene.mapHeight = mapHeight;

  const renderMan = new RenderMan(settings);

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const gameSurface = new GameCanvasTarget(settings);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  useGameStore.setState({
    dimensions: gameSurface.getRect(),
  });

  const minimapSurface = new CanvasTarget();

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight
  );

  window.scene = scene;

  const cameraRig = new CameraRig(
    settings,
    mapWidth,
    mapHeight,
    gameSurface,
    minimapSurface,
    minimapControl,
    keyboardShortcuts,
    true
  );

  const orbitControls = new OrbitControls(cameraRig.camera, gameSurface.canvas);
  window.orbitControls = orbitControls;
  orbitControls.listenToKeyEvents(window);
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
  window.renderMan = renderMan;

  if (settings.renderMode !== RenderMode.ThreeD) {
    renderMan.renderer.shadowMap.autoUpdate = false;
    renderMan.renderer.shadowMap.needsUpdate = true;
  }

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderMan.fogOfWarEffect);

  const customColors = settings.randomizeColorOrder
    ? shuffle(settings.playerColors)
    : settings.playerColors;
  const playerColors = rep.header.players.map(({ id, color }, i) =>
    buildPlayerColor(settings.useCustomColors ? customColors[i] : color.hex, id)
  );
  const players = new Players(
    rep.header.players,
    preplacedMapUnits.filter((u) => u.unitId === startLocation),
    playerColors
  );
  injectColorsCss(playerColors);

  players.forEach((player, i) => {
    const pos = i == 0 ? PovLeft : PovRight;
    player.camera = new PlayerPovCamera(
      pos,
      () => players.activePovs,
      pxToGameUnit.xy(player.startLocation)
    );
  });

  audioMaster.music.playGame();

  let gameStatePosition = new GameStatePosition(
    rep.header.frameCount,
    gameSpeeds.fastest,
    heatMapScore
  );

  gameStatePosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  gameStatePosition.onResetState = () => {};

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

  const nextFrameHandler = (evt) => {
    if (evt.code === "KeyN") {
      gameStatePosition.skipGameFrames = 1;
    }
  };
  document.addEventListener("keydown", nextFrameHandler);

  window.cameras = cameraRig;
  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight, false);

    cameraRig.updateGameScreenAspect(gameSurface.width, gameSurface.height);
    players.forEach(({ camera }) =>
      camera.updateGameScreenAspect(gameSurface.width, gameSurface.height)
    );

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

  // let _preloadFrames = [];
  // let _preloading = false;
  // let preloadAtlasQueue = (frames) => {
  //   if (frames) {
  //     _preloadFrames.push(frames);
  //   }

  //   if (!_preloading && _preloadFrames.length) {
  //     _preloading = preloadAtlas(_preloadFrames.shift()).then(() => {
  //       _preloading = false;
  //       preloadAtlasQueue();
  //     });
  //   }
  // };

  // gameStateReader.on("frames", (frames) => preloadAtlasQueue(frames));

  let nextBwFrame, currentBwFrame;

  const units = new Units(
    bwDat,
    pxToGameUnit,
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
    scene,
    cameraRig.camera,
    frameBuilder,
    scene.terrain
  );

  let _lastElapsed = 0;
  let delta = 0;

  const apm = new Apm(players);
  projectedCameraView.update();

  function gameLoop(elapsed) {
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
        setSelectedUnits(useGameStore.getState().selectedUnits);

        frameBuilder.unitsInProduction.needsUpdate = false;
        frameBuilder.upgrades.needsUpdate = false;
        frameBuilder.research.needsUpdate = false;

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

            if (players.playersById[cmd.player].showPov) {
              players.playersById[cmd.player].camera.update(cmd, pxToGameUnit);
            } else {
              players.playersById[cmd.player].camera.update(
                cmd,
                pxToGameUnit,
                1000
              );
            }

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

      if (gameStatePosition.willUpdateAutospeed()) {
        const attackingUnits = [];
        //  unitsThisFrame
        //   .map((unitRepId) =>
        //     units.units.children.find(
        //       ({ userData }) => userData.repId === unitRepId
        //     )
        //   )
        //   .filter((unit) => heatMapScore.unitOfInterestFilter(unit));

        gameStatePosition.updateAutoSpeed(attackingUnits, delta);
      }
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
    renderMan.updateFocus(cameraRig);
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
    window.cameras = null;
    window.scene = null;
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

    keyboardShortcuts.dispose();

    window.document.body.style.cursor = null;

    gameStateReader.dispose();
    unsubs.forEach((unsubscribe) => unsubscribe());
    cursor.dispose();
  };

  window.onbeforeunload = dispose;

  const unsub = useSettingsStore.subscribe((state) => {
    settings = state.data;

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
  _sceneResizeHandler();
  renderMan.renderer.compile(scene, cameraRig.compileCamera);

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
