import { Box3, Vector3 } from "three";
import { unstable_batchedUpdates } from "react-dom";
import { GameStatePosition } from "./game/GameStatePosition";
import { gameSpeeds, pxToMapMeter } from "../common/utils/conversions";
import HeatmapScore from "./react-ui/game/HeatmapScore";
import Cameras from "./camera/Cameras";
import MinimapControl from "./camera/MinimapControl";
import MinimapCanvasDrawer from "./game/MinimapCanvasDrawer";
import { Players } from "./game/Players";
import FadingPointers from "./mesh/FadingPointers";
import { commands } from "../common/types/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./camera/PlayerPovCamera";
import { unitTypes } from "../common/types/unitTypes";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import InputEvents from "./input/InputEvents";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "../common/image/CanvasTarget";
import GameCanvasTarget from "./render/GameCanvasTarget";
import { ProducerWindowPosition, RenderMode } from "../common/settings";
import Units from "./game/Units";
import FogOfWar from "./game/fogofwar/FogOfWar";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import BWFrameSceneBuilder from "./game/BWFrameSceneBuilder";
import Apm from "./game/Apm";
import { debounce } from "lodash";

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

export const hot = module.hot ? module.hot.data : null;

async function TitanReactorGame(
  scene,
  chk,
  rep,
  gameStateReader,
  bwDat,
  createTitanImage,
  preloadAtlas,
  audioMaster
) {
  let settings = useSettingsStore.getState().data;
  const addChatMessage = useGameStore.getState().addChatMessage;

  const cursor = scene.cursor;
  cursor.pointer();

  console.log("rep", rep);

  const [mapWidth, mapHeight] = chk.size;
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
  const previewSurfaces = [new CanvasTarget()];
  previewSurfaces.forEach((surf) => surf.setDimensions(300, 200));

  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight
  );

  window.scene = scene;

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  const cameras = new Cameras(
    settings,
    mapWidth,
    mapHeight,
    gameSurface,
    minimapSurface,
    minimapControl,
    keyboardShortcuts,
    true
  );

  await renderMan.initRenderer(cameras.camera);
  window.renderMan = renderMan;

  if (settings.renderMode !== RenderMode.ThreeD) {
    renderMan.renderer.shadowMap.autoUpdate = false;
    renderMan.renderer.shadowMap.needsUpdate = true;
  }
  const getTerrainY = scene.getTerrainY();

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderMan.fogOfWarEffect);

  const players = new Players(
    rep.header.players,
    chk.units.filter((u) => u.unitId === startLocation),
    settings.playerColors,
    settings.randomizeColorOrder
  );
  players.forEach((player, i) => {
    const pos = i == 0 ? PovLeft : PovRight;
    player.camera = new PlayerPovCamera(
      pos,
      () => players.activePovs,
      pxToGameUnit.xy(player.startLocation)
    );
  });
  players.changeColors(settings.useCustomColors);
  console.log("players", players);

  audioMaster.music.playGame();

  let gameStatePosition = new GameStatePosition(
    rep.header.frameCount,
    gameSpeeds.fastest,
    heatMapScore
  );

  gameStatePosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  gameStatePosition.onResetState = () => {};

  let shiftDown = false;
  let lastChangedShiftDown = Date.now();
  const _keyDown = (evt) => {
    shiftDown = evt.code === "ShiftLeft";
    // if (shiftDown && Date.now() - lastChangedShiftDown > 2000) {
    //   lastChangedShiftDown = Date.now();
    //   if (cameras.control.dampingFactor > 0.005) {
    //     cameras.control.dampingFactor = 0.005;
    //   } else {
    //     cameras.control.dampingFactor = 0.05;
    //   }
    // }
  };

  document.addEventListener("keydown", _keyDown);
  const _keyUp = (evt) => {
    shiftDown = false;
  };
  document.addEventListener("keyup", _keyUp);

  const _controlSleep = () => {
    cameras.control.dampingFactor = 0.05;
  };
  // cameras.control.addEventListener("sleep", _controlSleep);

  //#endregion mouse listener

  //#region hud ui
  const togglePlayHandler = () => gameStatePosition.togglePlay();
  keyboardShortcuts.addEventListener(InputEvents.TogglePlay, togglePlayHandler);

  const toggleGridHandler = () =>
    (scene.gridHelper.visible = !scene.gridHelper.visible);
  keyboardShortcuts.addEventListener(InputEvents.ToggleGrid, toggleGridHandler);

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

  const hudData = {
    onFollowUnit: () => {
      // units.followingUnit = !units.followingUnit;
    },
  };

  const callbacks = {
    onTogglePlayerPov: (() => {
      const povState = {
        fns: [],
        interval: null,
      };
      return (player) => {
        clearTimeout(povState.interval);

        povState.fns.push(() => {
          players[player].showPov = !players[player].showPov;
          players[player].showActions = players[player].showPov;
        });

        povState.interval = setTimeout(() => {
          povState.fns.forEach((fn) => fn());
          povState.fns.length = 0;

          const activePovs = players.filter(
            ({ showPov }) => showPov === true
          ).length;

          players.activePovs = activePovs;

          players.forEach(({ camera }) =>
            camera.updateGameScreenAspect(gameSurface.width, gameSurface.height)
          );

          // store.dispatch(activePovsChanged(activePovs));
        }, 1000);
      };
    })(),
  };

  //#endregion hud ui
  window.cameras = cameras;
  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight, false);

    cameras.updateGameScreenAspect(gameSurface.width, gameSurface.height);
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

    if (settings.producerWindowPosition === ProducerWindowPosition.None) {
      cameras.updatePreviewScreenAspect(
        minimapSurface.width,
        minimapSurface.height
      );
    } else {
      const pw = settings.producerDockSize - 10;
      const ph = pw * (gameSurface.height / gameSurface.width);
      previewSurfaces.forEach((surf) => surf.setDimensions(pw, ph));
      cameras.updatePreviewScreenAspect(pw, ph);
    }

    projectedCameraView.update();

    cameras.control.setBoundary(
      new Box3(
        new Vector3(-mapWidth / 2, 0, -mapHeight / 2),
        new Vector3(mapWidth / 2, 100, mapHeight / 2)
      )
    );

    unstable_batchedUpdates(() =>
      useGameStore.setState({
        dimensions: gameSurface.getRect(),
      })
    );
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);

  let _preloadFrames = [];
  let _preloading = false;
  let preloadAtlasQueue = (frames) => {
    if (frames) {
      _preloadFrames.push(frames);
    }

    if (!_preloading && _preloadFrames.length) {
      _preloading = preloadAtlas(_preloadFrames.shift()).then(() => {
        _preloading = false;
        preloadAtlasQueue();
      });
    }
  };

  gameStateReader.on("frames", (frames) => preloadAtlasQueue(frames));

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
    scene.creepUniform.value,
    scene.creepEdgesUniform.value
  );

  const minimapCanvasDrawer = new MinimapCanvasDrawer(
    "white",
    minimapSurface,
    scene.minimapBitmap,
    mapWidth,
    mapHeight,
    fogOfWar,
    creep,
    units
  );

  const projectedCameraView = new ProjectedCameraView(
    cameras.camera,
    mapWidth,
    mapHeight
  );
  const frameBuilder = new BWFrameSceneBuilder(
    scene,
    creep,
    bwDat,
    pxToGameUnit,
    getTerrainY,
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
    cameras.camera,
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

    cameras.update();

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
        if (
          gameStatePosition.bwGameFrame % 8 === 0 &&
          scene.terrainSD.material.userData.tileAnimationCounter !== undefined
        ) {
          scene.terrainSD.material.userData.tileAnimationCounter.value++;
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
              addChatMessage({
                content: cmd.message,
                player: players.playersById[cmd.senderSlot],
              });
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
                  const pz = getTerrainY(px, py);

                  fadingPointers.addPointer(
                    px,
                    py,
                    pz,
                    players.playersById[cmd.player].color.rgb,
                    gameStatePosition.bwGameFrame
                  );
                }
              }
            }
          }
        }
        fadingPointers.update(gameStatePosition.bwGameFrame);
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

    cameras.updateDirection32();

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

    const target = cameras.getTarget();
    target.setY((target.y + cameras.camera.position.y) / 2);
    target.setZ((target.z + cameras.camera.position.z) / 2);
    audioMaster.update(target.x, target.y, target.z, delta);

    renderMan.enableCinematicPass();
    renderMan.updateFocus(cameras);
    fogOfWar.update(cameras.camera);
    renderMan.render(scene, cameras.camera, delta);
    // }

    minimapCanvasDrawer.draw(projectedCameraView);

    if (
      settings.producerWindowPosition !== ProducerWindowPosition.None &&
      gameStatePosition.bwGameFrame % 3 === 0
    ) {
      renderMan.enableRenderPass();
      previewSurfaces.forEach((previewSurface, i) => {
        renderMan.setCanvasTarget(previewSurface);
        if (useHudStore.getState().hoveringOverMinimap || i > 0) {
          if (i > 0 && i < 3) {
            players[i - 1].camera.updateGameScreenAspect(
              previewSurface.width,
              previewSurface.height
            );

            renderMan.render(scene, players[i - 1].camera, delta);
          } else {
            renderMan.render(scene, cameras.previewCameras[i], delta);
          }
        }
      });
    }

    // update camera view box if paused so we can properly update the minimap
    if (gameStatePosition.paused) {
      projectedCameraView.update();
    }

    keyboardShortcuts.update(delta);
    gameStatePosition.update(delta);
  }

  const dispose = () => {
    console.log("disposing");
    window.cameras = null;
    window.scene = null;
    window.renderMan = null;

    audioMaster.dispose();
    renderMan.renderer.setAnimationLoop(null);
    renderMan.dispose();
    gameStatePosition.pause();
    window.removeEventListener("resize", sceneResizeHandler, false);

    minimapControl.dispose();
    scene.dispose();
    cameras.dispose();

    document.removeEventListener("keydown", nextFrameHandler);
    keyboardShortcuts.removeEventListener(
      InputEvents.TogglePlay,
      togglePlayHandler
    );
    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleGrid,
      toggleGridHandler
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
    document.removeEventListener("keydown", _keyDown);
    document.removeEventListener("keyup", _keyUp);
    cameras.control.removeEventListener("sleep", _controlSleep);

    window.document.body.style.cursor = null;

    gameStateReader.dispose();
    unsubs.forEach((unsubscribe) => unsubscribe());
    cursor.dispose();
  };

  window.onbeforeunload = dispose;

  const unsub = useSettingsStore.subscribe((state, prevState) => {
    settings = state.data;
    audioMaster.channels.panningStyle = settings.audioPanningStyle;

    if (audioMaster.musicVolume !== settings.musicVolume) {
      audioMaster.musicVolume = settings.musicVolume;
    }

    if (audioMaster.soundVolume !== settings.soundVolume) {
      audioMaster.soundVolume = settings.soundVolume;
    }
  });

  const unsub2 = useHudStore.subscribe((state, prevState) => {
    if (
      state.hoveringOverMinimap &&
      settings.producerWindowPosition != ProducerWindowPosition.None
    ) {
      cameras.previewControl.enabled = true;
      cameras.previewControl.numpadControlEnabled = true;
      cameras.control.enabled = false;
      cameras.control.numpadControlEnabled = false;
    } else {
      cameras.previewControl.enabled = false;
      cameras.previewControl.numpadControlEnabled = false;
      cameras.control.enabled = true;
      cameras.control.numpadControlEnabled = true;
    }
  });

  const unsub3 = useGameStore.subscribe((state, prevVal) => {
    // fogChanged = fogOfWar.enabled != state.fogOfWar;
    fogOfWar.enabled = state.fogOfWar;

    for (let player of players) {
      if (player.vision !== state.playerVision[player.id]) {
        player.vision = state.playerVision[player.id];
        fogOfWar.playerVisionWasToggled = true;
      }
    }
  });
  const unsubs = [unsub, unsub2, unsub3];

  //run 1 frame
  gameStatePosition.resume();
  gameStatePosition.skipGameFrames = 1;
  gameLoop(0);
  renderMan.renderer.compile(scene, cameras.camera);
  _sceneResizeHandler();

  return {
    start: () => renderMan.renderer.setAnimationLoop(gameLoop),
    chk,
    bwDat,
    gameIcons: scene.gameIcons,
    cmdIcons: scene.cmdIcons,
    raceInsetIcons: scene.raceInsetIcons,
    workerIcons: scene.workerIcons,
    wireframeIcons: scene.wireframeIcons,
    surface: gameSurface,
    minimapSurface,
    previewSurfaces,
    players,
    replayPosition: gameStatePosition,
    callbacks,
    dispose,
  };
}

export default TitanReactorGame;
