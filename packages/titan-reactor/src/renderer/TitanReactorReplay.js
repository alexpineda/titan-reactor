import { Raycaster, Vector2, AudioListener, AxesHelper } from "three";
import {
  BWAPIUnitFromBuffer,
  BWAPIBulletFromBuffer,
} from "titan-reactor-shared/bwapi/BWAPIUnit";
import { difference } from "ramda";
import { ReplayPosition, ClockMs } from "./replay/ReplayPosition";
import { gameSpeeds, pxToMapMeter, onFastestTick } from "./utils/conversions";
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

const { startLocation } = unitTypes;

export const hot = module.hot ? module.hot.data : null;

async function TitanReactorReplay(
  store,
  scene,
  chk,
  rep,
  replayReader,
  bwDat,
  bgMusic,
  atlases,
  createTitanSprite
) {
  const stats = createStats();
  stats.dom.style.position = "relative";
  const state = store.getState();
  const settings = state.settings.data;

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

  const pxToMeter = pxToMapMeter(chk.size[0], chk.size[1]);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight
  );

  scene.add(
    createMiniMapPlane(scene.terrain.material.map, mapWidth, mapHeight)
  );

  const cameras = new Cameras(
    settings,
    gameSurface,
    minimapSurface,
    minimapControl,
    keyboardShortcuts
  );
  scene.add(cameras.minimapCameraHelper);

  await renderMan.initRenderer(cameras.camera);
  window.renderMan = renderMan;

  // #region player initialization
  const players = new Players(
    rep.header.players,
    chk.units.filter((u) => u.unitId === startLocation)
  );
  players[0].camera = new PlayerPovCamera(
    PovLeft,
    () => players.activePovs,
    pxToMeter.xy(players[0].startLocation)
  );
  players[1].camera = new PlayerPovCamera(
    PovRight,
    () => players.activePovs,
    pxToMeter.xy(players[1].startLocation)
  );
  // #endregion player initialization

  const audioListener = new AudioListener();
  scene.add(audioListener);
  bgMusic.setListener(audioListener);
  bgMusic.setVolume(settings.musicVolume);
  bgMusic.playGame();
  scene.add(bgMusic.getAudio());

  const getTerrainY = scene.getTerrainY();
  // const units = new Units(
  //   bwDat,
  //   renderImage,
  //   chk.tileset,
  //   chk.size,
  //   getTerrainY,
  //   audioListener,
  //   players,
  //   { main: cameras.camera },
  //   {}
  // );
  // scene.add(units.units);

  let replayPosition = new ReplayPosition(
    replayReader,
    rep.header.frameCount,
    new ClockMs(),
    gameSpeeds.fastest,
    heatMapScore
  );

  replayPosition.setMaxAutoSpeed(settings.maxAutoReplaySpeed);

  replayPosition.onResetState = () => {
    unitsLastFrame = [];
    unitsThisFrame = [];
    // units.clear();
  };

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
  let selectedUnits = [];
  let followingUnit = false;

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

    const intersectTerrain = raycaster.intersectObject(scene.terrain, false);
    if (intersectTerrain.length) {
      intersectAxesHelper.position.copy(intersectTerrain[0].point);
    }

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(units.getUnits(), true);
    const getAsUnit = (mesh) => {
      if (!mesh) return null;
      if (mesh.userData && mesh.userData.typeId !== undefined) {
        return mesh;
      } else {
        return getAsUnit(mesh.parent);
      }
    };

    if (!intersects.length) {
      selectedUnits = [];
    } else {
      intersects.slice(0, 1).forEach(({ object }) => {
        const unit = getAsUnit(object);

        if (unit) {
          selectedUnits = [unit];
          console.log(unit.userData.repId, unit);
        } else {
          selectedUnits = [];
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

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  //#region hud ui
  {
    const ev = (event, handler) =>
      keyboardShortcuts.addEventListener(event, handler);
    const k = InputEvents;
    ev(k.TogglePlay, () => replayPosition.togglePlay());
    ev(
      k.ToggleGrid,
      () => (scene.gridHelper.visible = !scene.gridHelper.visible)
    );
    ev(k.ToggleMenu, () => {
      store.dispatch(toggleMenu());
    });
  }
  const hudData = {
    onFollowUnit: () => {
      followingUnit = !followingUnit;
    },
    onUnitDetails: () => {
      if (hudData.showingUnitDetails) {
        hudData.showingUnitDetails = null;
        keyboardShortcuts.enabled = true;
      } else {
        // hudData.showingUnitDetails = createUnitDetails(
        //   bwDat,
        //   uniq(selectedUnits.map((unit) => unit.userData.typeId)).sort()
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
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);

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

  let unitsLastFrame = [];
  let unitsThisFrame = [];
  // let bulletsLastFrame = [];
  let bulletsThisFrame = [];

  replayPosition.maxFrame = replayReader.maxFrame;

  let thingies = [];

  const addTitanSpriteCb = (titanSprite) => {
    scene.add(titanSprite);
    thingies = [...thingies, titanSprite];
  };

  const updateEntities = (entities, delta) => {
    let removeEntities = [];
    removeEntities.length = 0;

    for (let entity of entities) {
      if (entity.userData.direction !== cameras.camera.userData.direction) {
        entity.setDirection(cameras.camera.userData.direction);
      }
      entity.update(delta);
      // if (entity.images.length === 0) {
      //   removeEntities.push(entity);
      // }
    }

    removeEntities.forEach((t) => scene.remove(t));
  };

  function gameLoop() {
    if (onFastestTick(replayPosition.bwGameFrame, 1)) {
      // players.updateResources(units);
      store.dispatch(onGameTick());
      //update position
    }

    cameras.update();

    //sd tile animations
    if (
      scene.terrain.material.userData.counterValue &&
      replayPosition.bwGameFrame % 8 === 0
    ) {
      scene.terrain.material.userData.counterValue.value++;
    }

    if (!replayPosition.paused) {
      for (let gf = 0; gf < replayPosition.skipGameFrames; gf++) {
        if (replayPosition.bwGameFrame === 0) {
          const {
            bwGameFrame,
            player1Gas,
            player1Minerals,
            player2Gas,
            player2Minerals,
            units,
            bullets,
          } = replayReader.next();
          replayPosition.bwGameFrame = bwGameFrame;

          players[0].gas = player1Gas;
          players[1].gas = player2Gas;
          players[0].minerals = player1Minerals;
          players[1].minerals = player2Minerals;

          if (replayPosition.isMaxFrame()) {
            replayPosition.pause();
            continue;
          }

          for (const frameData of units) {
            // const { frameData, frameSize } = BWAPIUnitFromBuffer(
            //   BWAPIFramesDataView,
            //   replayPosition.bwapiBufferPosition
            // );

            const unit = bwDat.units[frameData.typeId];
            const ts = createTitanSprite(unit, addTitanSpriteCb);
            const x = frameData.x / 32 - mapWidth / 2;
            const z = frameData.y / 32 - mapHeight / 2;

            //@todo consider setting frame floor once to the lowest frame
            ts.position.set(x, getTerrainY(x, z), z);
            ts.rotation.y = -frameData.angle + Math.PI / 2;

            // units.updateUnit(
            //   frameData,
            //   replayPosition.bwGameFrame,
            //   replayPosition.skippingFrames()
            // );

            unitsThisFrame.push(frameData.repId);
          }
          updateEntities(thingies, replayPosition.lastDelta);
        }

        // const numBulletsThisFrame = replayPosition.readUInt32AndAdvance();

        // bulletsThisFrame = [];
        // for (let i = 0; i < numBulletsThisFrame; i++) {
        //   // const { frameData, frameSize } = BWAPIBulletFromBuffer(
        //   //   BWAPIFramesDataView,
        //   //   replayPosition.bwapiBufferPosition
        //   // );

        //   bulletsThisFrame.push(frameData);
        // }

        const deadUnits = difference(unitsLastFrame, unitsThisFrame);
        // units.killUnits(deadUnits);
        unitsLastFrame = [...unitsThisFrame];

        if (selectedUnits.length) {
          selectedUnits = selectedUnits.filter(
            (unit) => !deadUnits.includes(unit.userData.repId)
          );
          if (selectedUnits.length === 0 && followingUnit) {
            followingUnit = false;
          }
        }
        // units.units.updateMatrixWorld(true);

        if (rep.cmds[replayPosition.bwGameFrame]) {
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
              players[cmd.player].camera.update(cmd, pxToMeter);
            } else {
              players[cmd.player].camera.update(cmd, pxToMeter, 1000);
            }

            if (players[cmd.player].showActions) {
              switch (cmd.id) {
                case commands.rightClick:
                case commands.targetedOrder:
                case commands.build: {
                  const px = pxToMeter.x(cmd.x);
                  const py = pxToMeter.y(cmd.y);
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

    // units.cameraDirection.previousDirection = units.cameraDirection.direction;

    // units.cameraDirection.direction = cameras.getDirection32();
    // units.setShear(cameras.getShear());

    const dir = cameras.getDirection32();
    if (dir != cameras.camera.userData.direction) {
      cameras.camera.userData.prevDirection = cameras.camera.userData.direction;
      cameras.camera.userData.direction = dir;
    }

    renderMan.setCanvasTarget(gameSurface);

    if (players[0].showPov && players[1].showPov) {
      players.forEach(({ camera }) => {
        renderMan.renderSplitScreen(scene, camera, camera.viewport);
      });
    } else if (players[0].showPov) {
      renderMan.render(scene, players[0].camera);
    } else if (players[1].showPov) {
      renderMan.render(scene, players[1].camera);
    } else {
      if (followingUnit && selectedUnits.length) {
        const x =
          selectedUnits.reduce(
            (sum, unit) => sum + unit.getWorldPosition().x,
            0
          ) / selectedUnits.length;
        const z =
          selectedUnits.reduce(
            (sum, unit) => sum + unit.getWorldPosition().z,
            0
          ) / selectedUnits.length;

        cameras.setTarget(x, getTerrainY(x, z), z, true);
      }

      audioListener.position.lerpVectors(
        cameras.getTarget(),
        cameras.camera.position,
        0.5
      );
      intersectAxesHelper.position.copy(audioListener.position);
      renderMan.render(scene, cameras.camera);
    }

    if (
      (!replayPosition.skippingFrames() && replayPosition.bwGameFrame % 500) ||
      (replayPosition.skippingFrames() && replayPosition.bwGameFrame % 3000)
    ) {
      renderMan.onlyRenderPass();
      renderMan.setCanvasTarget(minimapSurface);
      renderMan.render(scene, cameras.minimapCamera);

      if (settings.producerWindowPosition !== ProducerWindowPosition.None) {
        previewSurfaces.forEach((previewSurface, i) => {
          renderMan.setCanvasTarget(previewSurface);
          if (state.replay.input.hoveringOverMinimap || i > 0) {
            if (i > 0 && i < 3) {
              players[i - 1].camera.updateGameScreenAspect(
                previewSurface.width,
                previewSurface.height
              );

              renderMan.render(scene, players[i - 1].camera);
            } else {
              renderMan.render(scene, cameras.previewCameras[i]);
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
      renderMan.allEnabledPasses();
    }

    replayPosition.update();

    if (state.replay.hud.showFps) {
      stats.update();
    }
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
    gameSurface.canvas.removeEventListener("mousedown", mouseDownListener);
    document.removeEventListener("keydown", _keyDown);
    document.removeEventListener("keyup", _keyUp);
    cameras.control.removeEventListener("sleep", _controlSleep);
  };

  setTimeout(() => {
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
