import { Raycaster, AxesHelper, Scene, Vector2 } from "three";
import { unstable_batchedUpdates } from "react-dom";
import { GameStatePosition } from "./game/GameStatePosition";
import {
  gameSpeeds,
  pxToMapMeter,
  onFastestTick,
} from "titan-reactor-shared/utils/conversions";
import HeatmapScore from "./react-ui/game/HeatmapScore";
import Cameras from "./camera/Cameras";
import MinimapControl from "./camera/MinimapControl";
import { createMiniMapPlane, MinimapBox } from "./mesh/Minimap";
import { Players } from "./game/Players";
import FadingPointers from "./mesh/FadingPointers";
import { commands } from "titan-reactor-shared/types/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./camera/PlayerPovCamera";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import InputEvents from "./input/InputEvents";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "titan-reactor-shared/image/CanvasTarget";
import GameCanvasTarget from "./render/GameCanvasTarget";
import { ProducerWindowPosition, RenderMode } from "../common/settings";
import Units from "./game/Units";
import FogOfWar from "./game/fogofwar/FogOfWar";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import BWFrameSceneBuilder from "./game/frame-builder/BWFrameBuilder";
import ManagedDomElements from "./react-ui/managed-dom/ManagedDomElements";
import Apm from "./game/Apm";
import { debounce } from "lodash";
import useSettingsStore from "./stores/settingsStore";
import useGameStore from "./stores/gameStore";
import useHudStore from "./stores/hudStore";

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

  let fogChanged = false;

  const cursor = scene.cursor;
  cursor.pointer();

  console.log("rep", rep);

  const [mapWidth, mapHeight] = chk.size;

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

  const minimapScene = new Scene();
  window.minimapScene = minimapScene;

  minimapScene.add(
    createMiniMapPlane(scene.terrainSD.material.map, mapWidth, mapHeight)
  );

  const cameras = new Cameras(
    settings,
    gameSurface,
    minimapSurface,
    minimapControl,
    keyboardShortcuts,
    false
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

  const managedDomElements = new ManagedDomElements(
    scene.cmdIcons,
    players.playersById
  );

  audioMaster.music.playGame();

  let gameStatePosition = new GameStatePosition(
    rep.header.frameCount,
    gameSpeeds.fastest,
    heatMapScore
  );

  gameStatePosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  gameStatePosition.onResetState = () => {};

  const intersectAxesHelper = new AxesHelper(5);
  // scene.add(intersectAxesHelper);

  const raycaster = new Raycaster();

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
  keyboardShortcuts.addEventListener(
    InputEvents.TogglePlay,
    gameStatePosition.togglePlay
  );
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleGrid,
    () => (scene.gridHelper.visible = !scene.gridHelper.visible)
  );
  keyboardShortcuts.addEventListener(InputEvents.ToggleMenu, () =>
    useHudStore.getState().toggleInGameMenu()
  );
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleElevation,
    scene.toggleElevation
  );

  const hudData = {
    onFollowUnit: () => {
      // units.followingUnit = !units.followingUnit;
    },
    onUnitDetails: () => {
      if (hudData.showingUnitDetails) {
        hudData.showingUnitDetails = null;
        keyboardShortcuts.enabled = true;
      } else {
        // hudData.showingUnitDetails = createUnitDetails(
        //   bwDat,
        //   uniq(units.selected.map((unit) => unit.typeId)).sort()
        // );
        keyboardShortcuts.enabled = false;
      }
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

          const activePovs = players.filter(({ showPov }) => showPov === true)
            .length;

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
  const sceneResizeHandler = debounce(() => {
    // drawCallInspector.update();
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight, false);

    cameras.updateGameScreenAspect(gameSurface.width, gameSurface.height);
    players.forEach(({ camera }) =>
      camera.updateGameScreenAspect(gameSurface.width, gameSurface.height)
    );

    minimapSurface.setDimensions(
      Math.floor((gameSurface.height * settings.minimapRatio) / 100),
      Math.floor((gameSurface.height * settings.minimapRatio) / 100)
    );

    if (settings.producerWindowPosition === ProducerWindowPosition.None) {
      cameras.updatePreviewScreenAspect(
        minimapSurface.width,
        minimapSurface.height
      );
    } else {
      const pw = settings.producerDockSize - 10;
      const ph = pw / gameSurface.aspect;
      previewSurfaces.forEach((surf) => surf.setDimensions(pw, ph));
      cameras.updatePreviewScreenAspect(pw, ph);
    }

    unstable_batchedUpdates(() =>
      useGameStore.setState({
        dimensions: gameSurface.getRect(),
      })
    );
  }, 500);
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

  let nextFrame;

  const units = new Units(
    bwDat,
    pxToGameUnit,
    players.playersById,
    mapWidth,
    mapHeight
  );

  const minimapBox = new MinimapBox(
    "white",
    minimapSurface,
    scene.minimapBitmap,
    mapWidth,
    mapHeight,
    fogOfWar,
    units
  );

  const projectedCameraView = new ProjectedCameraView(cameras.camera);
  const frameBuilder = new BWFrameSceneBuilder(
    scene,
    mapWidth,
    mapHeight,
    minimapScene,
    bwDat,
    pxToGameUnit,
    getTerrainY,
    players,
    fogOfWar
  );

  function buildFrameScene(nextFrame, view, updateMinimap, elapsed, delta) {
    frameBuilder.buildStart(nextFrame, updateMinimap);
    frameBuilder.buildUnitsAndMinimap(units);
    frameBuilder.buildSprites(view, delta, createTitanImage);
    frameBuilder.buildFog();
    frameBuilder.buildCreep();
    frameBuilder.buildSounds(view, audioMaster, elapsed);
    frameBuilder.buildResearchAndUpgrades();
    // unstable_batchedUpdates(() =>
    //   useHudStore
    //     .getState()
    //     .updateUnitsInProduction(frameBuilder.unitsInProduction)
    // );
  }

  let _lastElapsed = 0;
  let delta = 0;

  const apm = new Apm(players);

  function gameLoop(elapsed) {
    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    const updateMinimap = true; // gameStatePosition.bwGameFrame % 2 === 0 || fogChanged;
    cameras.update();

    if (!gameStatePosition.paused) {
      if (!nextFrame) {
        projectedCameraView.update();

        gameStateReader.next(gameStatePosition.skipGameFrames - 1);
        nextFrame = gameStateReader.nextOne();
        if (nextFrame) {
          buildFrameScene(
            nextFrame,
            projectedCameraView,
            updateMinimap,
            elapsed,
            delta
          );
        } else {
          gameStatePosition.paused = true;
        }
      }

      if (gameStatePosition.skipGameFrames && nextFrame) {
        if (gameStatePosition.bwGameFrame % 8 === 0) {
          scene.terrainSD.material.userData.tileAnimationCounter.value++;
        }

        managedDomElements.update(
          nextFrame,
          gameStatePosition,
          players,
          apm.apm,
          frameBuilder
        );
        audioMaster.channels.play(elapsed);
        frameBuilder.bwScene.activate();
        if (updateMinimap) {
          frameBuilder.minimapBwScene.activate();
        }

        gameStatePosition.bwGameFrame = nextFrame.frame;

        if (rep.cmds[gameStatePosition.bwGameFrame]) {
          apm.update(
            rep.cmds[gameStatePosition.bwGameFrame],
            gameStatePosition.bwGameFrame
          );

          // #region player command pointers
          for (let cmd of rep.cmds[gameStatePosition.bwGameFrame]) {
            if (players[cmd.player].showPov) {
              players[cmd.player].camera.update(cmd, pxToGameUnit);
            } else {
              players[cmd.player].camera.update(cmd, pxToGameUnit, 1000);
            }

            if (players[cmd.player].showActions) {
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
                    players[cmd.player].color.rgb,
                    gameStatePosition.bwGameFrame
                  );
                }
              }
            }
          }

          // #endregion player commandpointers
        }
        fadingPointers.update(gameStatePosition.bwGameFrame);
        nextFrame = null;
      }

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

    if (players[0].showPov && players[1].showPov) {
      players.forEach(({ camera }) => {
        renderMan.renderSplitScreen(scene, camera, camera.viewport);
      });
    } else if (players[0].showPov) {
      renderMan.render(scene, players[0].camera, delta);
    } else if (players[1].showPov) {
      renderMan.render(scene, players[1].camera, delta);
    } else {
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
      fogOfWar.update(cameras.camera);
      renderMan.updateFocus(cameras);
      renderMan.render(scene, cameras.camera, delta);
    }

    if (updateMinimap) {
      renderMan.enableRenderPass();
      renderMan.setCanvasTarget(minimapSurface);
      fogOfWar.update(cameras.minimapCamera);
      // renderMan.render(minimapScene, cameras.minimapCamera, delta);
      minimapBox.draw(projectedCameraView, minimapSurface.ctx);

      if (settings.producerWindowPosition !== ProducerWindowPosition.None) {
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
          } else {
            // previewSurface.canvas
            //   .getContext("2d")
            //   .drawImage(
            //     gameSurface.canvas,
            //     0,
            //     0,
            //     previewSurface.width,
            //     previewSurface.width
            //   );
          }
        });
      }
    }

    keyboardShortcuts.update(delta);
    gameStatePosition.update(delta);
  }

  let _disposing = false;
  const dispose = () => {
    _disposing = true;
    audioMaster.dispose();
    renderMan.renderer.setAnimationLoop(null);
    renderMan.dispose();
    gameStatePosition.pause();
    window.removeEventListener("resize", sceneResizeHandler, false);

    minimapControl.dispose();
    scene.dispose();
    cameras.dispose();

    keyboardShortcuts.dispose();
    document.removeEventListener("keydown", _keyDown);
    document.removeEventListener("keyup", _keyUp);
    cameras.control.removeEventListener("sleep", _controlSleep);

    window.document.body.style.cursor = "default";

    unsubs.forEach((unsubscribe) => unsubscribe());
  };

  var limitLoop = function (fn, fps) {
    var then = new Date().getTime();

    fps = fps || 60;
    var interval = 1000 / fps;

    return (function loop(time) {
      if (_disposing) return;

      requestAnimationFrame(loop);

      // again, Date.now() if it's available
      var now = new Date().getTime();
      var delta = now - then;

      if (delta > interval) {
        // Update time
        // now - (delta % interval) is an improvement over just
        // using then = now, which can end up lowering overall fps
        then = now - (delta % interval);

        // call the fn
        fn(time);
      }
    })(0);
  };

  const unsub = useSettingsStore.subscribe((state, prevState) => {
    settings = state.data;
    players.changeColors(settings.useCustomColors);
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
    fogChanged = fogOfWar.enabled != state.fogOfWar;
    fogOfWar.enabled = state.fogOfWar;

    for (let player of players) {
      if (player.vision !== state.playerVision[player.id]) {
        //@todo: copy last visible state for each player
        player.vision = state.playerVision[player.id];
        fogOfWar.playerVisionWasToggled = true;
      }
    }
  });
  const unsubs = [unsub, unsub2, unsub3];

  renderMan.renderer.setAnimationLoop(gameLoop);
  sceneResizeHandler();
  gameStatePosition.resume();

  return {
    chk,
    gameIcons: scene.gameIcons,
    cmdIcons: scene.cmdIcons,
    raceInsetIcons: scene.raceInsetIcons,
    workerIcons: scene.workerIcons,
    surface: gameSurface,
    minimapSurface,
    previewSurfaces,
    players,
    replayPosition: gameStatePosition,
    managedDomElements,
    callbacks,
    selectedUnits: [],
    dispose,
  };
}

export default TitanReactorGame;
