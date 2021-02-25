import { ipcRenderer } from "electron";
import * as THREE from "three";

import {
  Raycaster,
  AudioListener,
  AxesHelper,
  Group,
  Color,
  Scene,
  MathUtils,
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
import Audio from "./audio/Audio";
import SoundsBW from "./replay/bw/SoundsBW";
import UnitsBW from "./replay/bw/UnitsBW";
import Units from "./replay/Units";

import ReplaySprites from "./replay/ReplaySprites";
import BWFrameScene from "./replay/BWFrameScene";
import FogOfWar from "./render/effects/FogOfWar";
import TilesBW from "./replay/bw/TilesBW";
import drawCallInspectorFactory from "titan-reactor-shared/image/DrawCallInspector";
import ProjectedCameraView from "./camera/ProjectedCameraView";

const { startLocation } = unitTypes;

export const hot = module.hot ? module.hot.data : null;

async function TitanReactorReplay(
  store,
  scene,
  chk,
  rep,
  gameStateReader,
  bwDat,
  bgMusic,
  createTitanImage,
  preloadAtlas
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
      player.vision = state.replay.hud.playerVision[player.id];
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

  const audioListener = new AudioListener();
  scene.add(audioListener);
  bgMusic.setListener(audioListener);
  bgMusic.setVolume(settings.musicVolume);
  bgMusic.playGame();
  scene.add(bgMusic.getAudio());

  const audio = new Audio(
    (id) => `sound/${bwDat.sounds[id].file}`,
    audioListener,
    (s) => scene.add(s)
  );
  const soundsBW = new SoundsBW(bwDat, pxToGameUnit, getTerrainY);
  const tilesBW = new TilesBW();

  let replayPosition = new ReplayPosition(
    rep.header.frameCount,
    gameSpeeds.fastest,
    heatMapScore
  );

  replayPosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  replayPosition.onResetState = () => {};

  // #region settings changed
  // context.addEventListener("settings", ({ message: { diff } }) => {
  //   if (diff.maxAutoReplaySpeed) {
  //     replayPosition.setMaxAutoSpeed(diff.maxAutoReplaySpeed);
  //   }
  //   if (diff.musicVolume) {
  //     bgMusic.setVolume(diff.musicVolume);
  //   }
  //   if (diff.soundVolume) {
  //     // audio.setVolume(diff.soundVolume);
  //   }
  //   if (diff.gamma) {
  //     renderMan.renderer.gammaFactor = diff.gamma;
  //   }
  //   if (diff.shadows) {
  //     renderMan.setShadowLevel(diff.shadows);
  //   }
  // });
  // #endregion

  const intersectAxesHelper = new AxesHelper(5);
  // scene.add(intersectAxesHelper);

  const raycaster = new Raycaster();

  // #region mouse listener
  // const mouseDownListener = (event) => {
  //   return;
  //   var mouse = new Vector2();

  //   const [width, height] = [gameSurface.width, gameSurface.height];

  //   mouse.x = (event.offsetX / width) * 2 - 1;
  //   mouse.y = -(event.offsetY / height) * 2 + 1;

  //   raycaster.setFromCamera(mouse, cameras.camera);

  //   const intersectTerrain = raycaster.intersectObject(scene.terrain, false);
  //   if (intersectTerrain.length) {
  //     intersectAxesHelper.position.copy(intersectTerrain[0].point);
  //   }

  //   // calculate objects intersecting the picking ray
  //   const intersects = raycaster.intersectObjects(sprites, true);
  //   const getAsUnit = (mesh) => {
  //     if (!mesh) return null;
  //     if (mesh.unit) {
  //       return mesh.unit;
  //     } else {
  //       return getAsUnit(mesh.parent);
  //     }
  //     return null;
  //   };

  //   if (!intersects.length) {
  //     units.selected = [];
  //   } else {
  //     intersects.slice(0, 1).forEach(({ object }) => {
  //       const unit = getAsUnit(object);

  //       if (unit) {
  //         units.selected = [unit];
  //         window.dbg = { repId: unit.repId };
  //         console.log(unit.repId, unit);
  //       } else {
  //         units.selected = [];
  //       }
  //     });
  //   }
  // };
  // gameSurface.canvas.addEventListener("mousedown", mouseDownListener);

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

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

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

  const unitsBW = new UnitsBW(bwDat);
  const units = new Units(pxToGameUnit, players.playersById);

  // createMinimapPoint();

  const sprites = new ReplaySprites(
    bwDat,
    pxToGameUnit,
    getTerrainY,
    createTitanImage,
    players.map(({ color }) => new Color(color.rgb))
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

  let nextFrame;

  const projectedCameraView = new ProjectedCameraView(cameras.camera);
  const bwScene = new BWFrameScene(scene, 1);
  const minimapBwScene = new BWFrameScene(minimapScene, 1);

  function buildFrameScene(nextFrame, view, elapsed, updateMinimap) {
    bwScene.swap();
    if (updateMinimap) {
      minimapBwScene.swap();
    }
    soundsBW.buffer = nextFrame.sounds;
    soundsBW.count = nextFrame.soundCount;

    for (let sound of soundsBW.items()) {
      const volume = sound.bwVolume(
        view.left,
        view.top,
        view.right,
        view.bottom
      );
      if (volume > SoundsBW.minPlayVolume) {
        const channel = audio.get(sound, 100, sound.mapX, sound.mapY, elapsed);
        if (channel) {
          bwScene.add(channel);
        }
      }
    }

    unitsBW.buffer = nextFrame.units;
    unitsBW.count = nextFrame.unitCount;
    for (const minimapUnit of units.refresh(
      unitsBW,
      bwScene.units,
      bwScene.unitsBySpriteId
    )) {
      if (updateMinimap && minimapUnit) {
        minimapBwScene.add(minimapUnit);
      }
    }

    for (const sprite of sprites.refresh(
      nextFrame,
      bwScene.unitsBySpriteId,
      bwScene.sprites,
      bwScene.images,
      view
    )) {
      bwScene.add(sprite);
    }

    tilesBW.buffer = nextFrame.tiles;
    tilesBW.count = nextFrame.tilesCount;

    fogOfWar.generate(
      nextFrame.frame,
      tilesBW,
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
          buildFrameScene(
            nextFrame,
            projectedCameraView.view,
            elapsed,
            updateMinimap
          );
        } else {
          replayPosition.paused = true;
        }
      }

      if (replayPosition.skipGameFrames && nextFrame) {
        if (replayPosition.bwGameFrame % 8 === 0) {
          scene.terrainSD.material.userData.tileAnimationCounter.value++;
        }

        bwScene.activate();
        bwScene.play();

        if (updateMinimap) {
          minimapBwScene.activate();
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
      audioListener.position.lerpVectors(
        target.setY(getTerrainY(target.x, target.z)),
        cameras.camera.position,
        0.05
      );

      // drawCallInspector.begin();
      renderMan.enableCinematicPass();
      fogOfWar.update(cameras.camera);
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
    renderMan.renderer.setAnimationLoop(null);
    renderMan.dispose();
    replayPosition.pause();
    bgMusic.dispose();
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
