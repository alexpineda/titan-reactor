import {
  Raycaster,
  AxesHelper,
  Scene,
  SphereBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector2,
} from "three";
import { ReplayPosition } from "./replay/ReplayPosition";
import {
  gameSpeeds,
  pxToMapMeter,
  onFastestTick,
} from "titan-reactor-shared/utils/conversions";
import HeatmapScore from "./react-ui/replay/HeatmapScore";
import Cameras from "./camera/Cameras";
import MinimapControl from "./camera/MinimapControl";
import { createMiniMapPlane } from "./mesh/Minimap";
import { Players } from "./replay/Players";
import FadingPointers from "./mesh/FadingPointers";
import { commands } from "titan-reactor-shared/types/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./camera/PlayerPovCamera";
import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import createStats from "utils/createStats";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import InputEvents from "./input/InputEvents";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "titan-reactor-shared/image/CanvasTarget";
import GameCanvasTarget from "./render/GameCanvasTarget";
import { ProducerWindowPosition } from "../common/settings";
import { onGameTick } from "./titanReactorReducer";
import { activePovsChanged } from "./camera/cameraReducer";
import { toggleMenu } from "./react-ui/replay/replayHudReducer";
import Units from "./replay/Units";
import ReplaySprites from "./replay/ReplaySprites";
import FogOfWar from "./render/effects/FogOfWar";
import drawCallInspectorFactory from "titan-reactor-shared/image/DrawCallInspector";
import ProjectedCameraView from "./camera/ProjectedCameraView";
import BWFrameSceneBuilder from "./replay/BWFrameBuilder";

const { startLocation } = unitTypes;

export const hot = module.hot ? module.hot.data : null;

async function TitanReactorReplay(
  store,
  scene,
  chk,
  rep,
  gameStateReader,
  bwDat,
  createTitanImage,
  preloadAtlas,
  audioMaster
) {
  const stats = createStats();
  stats.dom.style.position = "relative";
  const state = store.getState();
  const settings = state.settings.data;

  let fogChanged = false;

  const unsubscribeFromStore = store.subscribe(() => {
    Object.assign(state, store.getState());

    if (state.replay.input.hoveringOverMinimap) {
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

    fogChanged = fogOfWar.enabled != state.replay.hud.showFogOfWar;
    fogOfWar.enabled = state.replay.hud.showFogOfWar;

    for (let player of players) {
      if (player.vision !== state.replay.hud.playerVision[player.id]) {
        player.vision = state.replay.hud.playerVision[player.id];
        fogOfWar.playerVisionWasToggled = true;
      }
    }

    audioMaster.channels.panningStyle = state.settings.data.audioPanningStyle;

    if (audioMaster.musicVolume !== state.settings.data.musicVolume) {
      audioMaster.musicVolume = state.settings.data.musicVolume;
    }

    if (audioMaster.soundVolume !== state.settings.data.soundVolume) {
      audioMaster.soundVolume = state.settings.data.soundVolume;
    }
  });

  console.log("rep", rep);

  const [mapWidth, mapHeight] = chk.size;

  const renderMan = new RenderMan(settings);

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const gameSurface = new GameCanvasTarget(settings);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);

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

  // const DrawCallInspector = drawCallInspectorFactory(THREE);
  // const drawCallInspector = new DrawCallInspector(
  //   renderMan.renderer,
  //   scene,
  //   cameras.camera,
  //   true
  // );

  minimapScene.add(cameras.minimapCameraHelper);

  await renderMan.initRenderer(cameras.camera);
  window.renderMan = renderMan;

  const getTerrainY = scene.getTerrainY();

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderMan.fogOfWarEffect);

  // #region player initialization
  const players = new Players(
    rep.header.players,
    chk.units.filter((u) => u.unitId === startLocation)
  );
  players.forEach((player, i) => {
    const pos = i == 0 ? PovLeft : PovRight;
    player.camera = new PlayerPovCamera(
      pos,
      () => players.activePovs,
      pxToGameUnit.xy(player.startLocation)
    );
  });

  // #endregion player initialization

  const targetBall = new Mesh(
    new SphereBufferGeometry(1),
    new MeshBasicMaterial({ color: "white" })
  );
  scene.add(targetBall);

  audioMaster.music.playGame();

  let replayPosition = new ReplayPosition(
    rep.header.frameCount,
    gameSpeeds.fastest,
    heatMapScore
  );

  replayPosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  replayPosition.onResetState = () => {};

  const intersectAxesHelper = new AxesHelper(5);
  // scene.add(intersectAxesHelper);

  const raycaster = new Raycaster();

  // #region mouse listener
  const mouseDownListener = (event) => {
    var mouse = new Vector2();

    const [width, height] = [gameSurface.width, gameSurface.height];

    mouse.x = (event.offsetX / width) * 2 - 1;
    mouse.y = -(event.offsetY / height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameras.camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(
      fadingPointers.children,
      true
    );
    if (intersects.length) {
      intersects.forEach(({ object }) => {
        console.log(object.userData);
      });
    }
    return;
    const getAsUnit = (mesh) => {
      if (!mesh) return null;
      if (mesh.unit) {
        return mesh.unit;
      } else {
        return getAsUnit(mesh.parent);
      }
      return null;
    };

    if (!intersects.length) {
      units.selected = [];
    } else {
      intersects.slice(0, 1).forEach(({ object }) => {
        const unit = getAsUnit(object);

        if (unit) {
          units.selected = [unit];
          window.dbg = { repId: unit.repId };
          console.log(unit.repId, unit);
        } else {
          units.selected = [];
        }
      });
    }
  };
  gameSurface.canvas.addEventListener("mousedown", mouseDownListener);

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
    replayPosition.togglePlay
  );
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleGrid,
    () => (scene.gridHelper.visible = !scene.gridHelper.visible)
  );
  keyboardShortcuts.addEventListener(InputEvents.ToggleMenu, () =>
    store.dispatch(toggleMenu())
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

          store.dispatch(activePovsChanged(activePovs));
        }, 1000);
      };
    })(),
  };

  //#endregion hud ui
  window.cameras = cameras;
  const sceneResizeHandler = () => {
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
    store.dispatch(onGameTick());
  };
  window.addEventListener("resize", sceneResizeHandler, false);

  const units = new Units(pxToGameUnit, players.playersById);

  // createMinimapPoint();

  const sprites = new ReplaySprites(
    bwDat,
    pxToGameUnit,
    getTerrainY,
    createTitanImage,
    players.playersById
  );

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

  // window.playSound = (id, priority = 1) => {
  //   audio.get(
  //     {
  //       id,
  //       priority,
  //       object: {
  //         id,
  //         priority,
  //       },
  //     },
  //     100,
  //     cameras.getTarget().x,
  //     cameras.getTarget().y,
  //     cameras.getTarget().z
  //   )(_lastElapsed);
  // };

  let nextFrame;

  const projectedCameraView = new ProjectedCameraView(cameras.camera);
  const frameBuilder = new BWFrameSceneBuilder(
    scene,
    minimapScene,
    bwDat,
    pxToGameUnit,
    getTerrainY
  );

  function buildFrameScene(nextFrame, view, updateMinimap, elapsed) {
    frameBuilder.buildStart(nextFrame, updateMinimap);
    frameBuilder.buildSounds(view, audioMaster, elapsed);
    frameBuilder.buildUnitsAndMinimap(units);
    frameBuilder.buildSprites(sprites, view);
    frameBuilder.buildFog(
      fogOfWar,
      players.filter((p) => p.vision).map(({ id }) => id)
    );
  }

  let _lastElapsed = 0;
  let delta = 0;

  function gameLoop(elapsed) {
    if (state.replay.hud.showFps) {
      stats.update();
    }

    delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    const updateMinimap = replayPosition.bwGameFrame % 12 === 0 || fogChanged;
    cameras.update();

    if (!replayPosition.paused) {
      if (
        onFastestTick(replayPosition.bwGameFrame, 1.5) &&
        replayPosition.skipGameFrames
      ) {
        // players.updateResources(units);
        store.dispatch(onGameTick());
      }

      if (!nextFrame) {
        projectedCameraView.update();

        gameStateReader.next(replayPosition.skipGameFrames - 1);
        nextFrame = gameStateReader.nextOne();
        if (nextFrame) {
          //loading?
          buildFrameScene(
            nextFrame,
            projectedCameraView,
            updateMinimap,
            elapsed
          );
        } else {
          replayPosition.paused = true;
        }
      }

      if (replayPosition.skipGameFrames && nextFrame) {
        if (replayPosition.bwGameFrame % 8 === 0) {
          scene.terrainSD.material.userData.tileAnimationCounter.value++;
        }

        audioMaster.channels.play(elapsed);

        frameBuilder.bwScene.activate();
        frameBuilder.bwScene.play(elapsed);

        if (updateMinimap) {
          frameBuilder.minimapBwScene.activate();
        }

        replayPosition.bwGameFrame = nextFrame.frame;

        if (rep.cmds[replayPosition.bwGameFrame] && false) {
          // #region apm
          const actions = [];
          for (let cmd of rep.cmds[replayPosition.bwGameFrame]) {
            if (!actions[cmd.player]) {
              actions[cmd.player] = 1;
            } else {
              actions[cmd.player] = actions[cmd.player] + 1;
            }
          }
          Object.keys(actions).map((player) => {
            players[player].totalActions =
              players[player].totalActions + actions[player];
            players[player].apm = Math.floor(
              players[player].totalActions /
                ((replayPosition.bwGameFrame * gameSpeeds.fastest) /
                  (1000 * 60))
            );
          });
          // #endregion

          // #region player command pointers
          for (let cmd of rep.cmds[replayPosition.bwGameFrame]) {
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
                    replayPosition.bwGameFrame
                  );
                }
              }
            }
          }

          // #endregion player commandpointers
        }
        fadingPointers.update(replayPosition.bwGameFrame);
        nextFrame = null;
      }

      if (replayPosition.willUpdateAutospeed()) {
        const attackingUnits = [];
        //  unitsThisFrame
        //   .map((unitRepId) =>
        //     units.units.children.find(
        //       ({ userData }) => userData.repId === unitRepId
        //     )
        //   )
        //   .filter((unit) => heatMapScore.unitOfInterestFilter(unit));

        replayPosition.updateAutoSpeed(attackingUnits);
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
      targetBall.position.copy(target);

      // drawCallInspector.begin();
      renderMan.enableCinematicPass();
      fogOfWar.update(cameras.camera);
      renderMan.updateFocus(cameras);
      renderMan.render(scene, cameras.camera, delta);
      // drawCallInspector.end();
    }

    if (updateMinimap) {
      renderMan.enableRenderFogPass();
      renderMan.setCanvasTarget(minimapSurface);
      fogOfWar.update(cameras.minimapCamera);
      renderMan.render(minimapScene, cameras.minimapCamera, delta);

      if (settings.producerWindowPosition !== ProducerWindowPosition.None) {
        previewSurfaces.forEach((previewSurface, i) => {
          renderMan.setCanvasTarget(previewSurface);
          if (state.replay.input.hoveringOverMinimap || i > 0) {
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
    replayPosition.update(delta);
  }

  const dispose = () => {
    audioMaster.dispose();
    renderMan.renderer.setAnimationLoop(null);
    renderMan.dispose();
    replayPosition.pause();
    window.removeEventListener("resize", sceneResizeHandler, false);

    minimapControl.dispose();
    scene.dispose();
    cameras.dispose();
    unsubscribeFromStore();

    keyboardShortcuts.dispose();
    // gameSurface.canvas.removeEventListener("mousedown", mouseDownListener);
    document.removeEventListener("keydown", _keyDown);
    document.removeEventListener("keyup", _keyUp);
    cameras.control.removeEventListener("sleep", _controlSleep);
  };

  var limitLoop = function (fn, fps) {
    // Use var then = Date.now(); if you
    // don't care about targetting < IE9
    var then = new Date().getTime();

    // custom fps, otherwise fallback to 60
    fps = fps || 60;
    var interval = 1000 / fps;

    return (function loop(time) {
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

  setTimeout(() => {
    // limitLoop(gameLoop, 60);
    renderMan.renderer.setAnimationLoop(gameLoop);
    sceneResizeHandler();
  }, 500);

  if (settings.startPaused) {
    //@todo run first frame
  } else {
    replayPosition.resume();
  }

  return {
    gameSurface,
    minimapSurface,
    previewSurfaces,
    fpsCanvas: stats.dom,
    players,
    replayPosition,
    callbacks,
    dispose,
  };
}

export default TitanReactorReplay;
