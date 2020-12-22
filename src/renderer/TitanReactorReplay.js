import React from "react";
import { Raycaster, Vector2, AudioListener, Vector3, AxesHelper } from "three";
import {
  BWAPIUnitFromBuffer,
  BWAPIBulletFromBuffer,
} from "./replay/BWAPIFrames";
import { Units } from "./replay/Units";
import { difference, isEmpty, uniq } from "ramda";
import { ReplayPosition, ClockMs } from "./replay/ReplayPosition";
import { gameSpeeds, pxToMapMeter, onFastestTick } from "./utils/conversions";
import HUD from "./react-ui/hud/HUD";
import HeatmapScore from "./react-ui/hud/HeatmapScore";
import { DebugInfo } from "./utils/DebugINfo";
import Cameras from "./camera/Cameras";
import MinimapControl, { createMiniMapPlane } from "./camera/MinimapControl";
import { Players } from "./replay/Players";
import { FadingPointers } from "./mesh/FadingPointers";
import { MinimapUnitLayer } from "./camera/Layers";
import { commands } from "bwdat/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./camera/PlayerPovCamera";
import { TerrainCubeCamera } from "./camera/CubeCamera";
import { unitTypes } from "../common/bwdat/unitTypes";
import createUnitDetails from "./react-ui/hud/unitDetails/createUnitDetails";
import Menu from "./react-ui/hud/Menu";
import { createStats } from "utils/stats";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import InputEvents from "./input/InputEvents";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "./render/CanvasTarget";
import GameCanvasTarget from "./render/GameCanvasTarget";
import WrappedElement from "./react-ui/WrappedElement";
import ProducerBar from "./react-ui/producer/ProducerBar";
import { ProducerWindowPosition } from "../common/settings";
import { cinematic } from "./camera/cameraReducer";

const { startLocation } = unitTypes;

export const hot = module.hot ? module.hot.data : null;

export async function TitanReactorReplay(
  context,
  filepath,
  reactApp,
  scene,
  chk,
  rep,
  BWAPIFramesDataView,
  renderImage,
  bwDat,
  bgMusic,
  gameIcons,
  unitWireframes
) {
  const debugInfo = new DebugInfo();
  const stats = createStats();
  context.store.subscribe(() => {
    console.log("store", context.store.getState());
  });
  context.store.dispatch(cinematic(true));
  console.log("rep", rep);

  const [mapWidth, mapHeight] = chk.size;

  const renderMan = new RenderMan(context);
  renderMan.initRenderer();
  window.renderMan = renderMan;

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const gameSurface = new GameCanvasTarget(context);
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);

  const minimapSurface = new CanvasTarget();

  const pxToMeter = pxToMapMeter(chk.size[0], chk.size[1]);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimapControl = new MinimapControl(
    minimapSurface,
    mapWidth,
    mapHeight,
    keyboardShortcuts
  );

  scene.add(
    createMiniMapPlane(scene.terrain.material.map, mapWidth, mapHeight)
  );

  const cameras = new Cameras(
    context,
    renderMan,
    gameSurface,
    minimapControl,
    keyboardShortcuts
  );
  scene.add(cameras.minimapCameraHelper);

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

  // #region audio initialization
  const audioListener = new AudioListener();
  scene.add(audioListener);
  bgMusic.setListener(audioListener);
  bgMusic.setVolume(context.settings.musicVolume);
  bgMusic.playGame();
  scene.add(bgMusic.getAudio());
  // #endregion audio initialization

  const getTerrainY = scene.getTerrainY();
  const units = new Units(
    bwDat,
    renderImage,
    chk.tileset,
    chk.size,
    getTerrainY,
    audioListener,
    players,
    { main: cameras.camera },
    {}
  );
  scene.add(units.units);
  units.units.renderOrder = 1;

  let replayPosition = new ReplayPosition(
    BWAPIFramesDataView,
    rep.header.frameCount,
    new ClockMs(),
    gameSpeeds.fastest,
    heatMapScore
  );

  replayPosition.setMaxAutoSpeed(context.settings.maxAutoReplaySpeed);

  replayPosition.onResetState = () => {
    unitsLastFrame = [];
    unitsThisFrame = [];
    units.clear();
  };

  // #region settings changed
  context.addEventListener("settings", ({ message: { diff } }) => {
    if (diff.maxAutoReplaySpeed) {
      replayPosition.setMaxAutoSpeed(diff.maxAutoReplaySpeed);
    }
    if (diff.musicVolume) {
      bgMusic.setVolume(diff.musicVolume);
    }
    if (diff.soundVolume) {
      // audio.setVolume(diff.soundVolume);
    }
    if (diff.gamma) {
      renderMan.renderer.gammaFactor = diff.gamma;
    }
    if (diff.shadows) {
      renderMan.setShadowLevel(diff.shadows);
    }
  });
  // #endregion

  let prevHudState = {};
  const toggleAllHud = (val, except = []) => {
    const huds = [
      "hideUnitSelection",
      "hideMinimap",
      "hideReplayPosition",
      "hideResources",
      "hideProduction",
    ].filter((hud) => !except.includes(hud));
    const all = (cur, prev, val) =>
      huds.forEach((hud) => (cur[hud] = prev ? prev[hud] : val));
    const any = () => huds.reduce((memo, hud) => hudData[hud] || memo, false);
    if (val !== undefined) {
      if (val) {
        all(hudData, prevHudState);
        prevHudState = {};
      } else if (isEmpty(prevHudState)) {
        all(prevHudState, hudData);
        all(hudData, null, false);
      }
    }
    const show = val !== undefined ? val : any();
    all(hudData, null, !show);
    updateUi();
  };

  //#region keyboard shortcuts
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
      hudData.showMenu = !hudData.showMenu;
      toggleAllHud(!hudData.showMenu);
    });
    ev(
      k.ToggleReplayPosition,
      () => (hudData.hideReplayPosition = !hudData.hideReplayPosition)
    );
    ev(k.ToggleMinimap, () => (hudData.hideMinimap = !hudData.hideMinimap));
    ev(
      k.ToggleProduction,
      () => (hudData.hideProduction = !hudData.hideProduction)
    );
    ev(
      k.ToggleResources,
      () => (hudData.hideResources = !hudData.hideResources)
    );
    ev(
      k.ToggleUnitSelection,
      () => (hudData.hideUnitSelection = !hudData.hideUnitSelection)
    );
    ev(k.ToggleAll, () => {
      toggleAllHud();
    });
    ev(k.ToggleUnitInformation, () => {
      hudData.onUnitDetails();
    });
  }
  // #endregion keyboard shortcuts

  let selectedUnits = [];
  let followingUnit = false;

  const intersectAxesHelper = new AxesHelper(5);
  // scene.add(intersectAxesHelper);

  const raycaster = new Raycaster();

  // #region mouse listener
  const mouseDownListener = (event) => {
    var mouse = new Vector2();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    const [width, height] = [gameSurface.width, gameSurface.height];

    mouse.x = (event.offsetX / width) * 2 - 1;
    mouse.y = -(event.offsetY / height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameras.camera);

    const intersectTerrain = raycaster.intersectObject(scene.terrain, false);
    if (intersectTerrain.length) {
      intersectAxesHelper.position.copy(intersectTerrain[0].point);
      // if (cameras.isCinematic()) {
      //   cameras.cinematicOptions.focalDepth = intersectTerrain[0].distance * 3;
      // }
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
  //#endregion mouse listener

  const fadingPointers = new FadingPointers();
  scene.add(fadingPointers);

  //#region hud ui
  const hudData = {
    showMenu: false,
    hideReplayPosition: false,
    hideMinimap: false,
    hideUnitSelection: false,
    hideResources: false,
    hideProduction: false,
    showingUnitDetails: null,
    position: () => replayPosition.bwGameFrame / replayPosition.maxFrame,
    onChangeGameSpeed: (speed) => (replayPosition.gameSpeed = speed),
    onChangeAutoGameSpeed: (val) => {
      replayPosition.setAutoSpeed(val);
      updateUi();
    },
    onChangePosition: (pos) => {
      replayPosition.goto(Math.floor(pos * replayPosition.maxFrame));
      updateUi();
    },
    onTogglePaused: (pause) => {
      if (pause) {
        replayPosition.pause();
      } else {
        replayPosition.resume();
      }
      updateUi();
    },
    onFollowUnit: () => {
      followingUnit = !followingUnit;
    },
    onUnitDetails: () => {
      if (hudData.showingUnitDetails) {
        hudData.showingUnitDetails = null;
        keyboardShortcuts.enabled = true;
        toggleAllHud(true);
      } else {
        hudData.showingUnitDetails = createUnitDetails(
          bwDat,
          uniq(selectedUnits.map((unit) => unit.userData.typeId)).sort()
        );
        keyboardShortcuts.enabled = false;
        toggleAllHud(false);
      }
    },
    povInterval: null,
    povFns: [],
    onTogglePlayerPov: (player) => {
      clearTimeout(hudData.povInterval);

      hudData.povFns.push(() => {
        players[player].showPov = !players[player].showPov;
        players[player].showActions = players[player].showPov;
      });

      hudData.povInterval = setTimeout(() => {
        hudData.povFns.forEach((fn) => fn());
        hudData.povFns = [];

        players.activePovs = players.filter(
          ({ showPov }) => showPov === true
        ).length;

        players.forEach(({ camera }) =>
          camera.updateGameScreenAspect(gameSurface.width, gameSurface.height)
        );

        cameras.enableControls(players.activePovs === 0);
      }, 1000);
    },
  };

  let uiUpdated = false;
  let firstUiUpdate = true;
  const updateUi = () => {
    // just in case we call several times in game loop
    if (uiUpdated || replayPosition.skippingFrames()) return;

    uiUpdated = true;

    players.updateResources(units);

    reactApp.render(
      <>
        <WrappedElement
          canvas={gameSurface.canvas}
          style={{
            position: "absolute",
            zIndex: "-10",
            left: `${gameSurface.left}px`,
            top: `${gameSurface.top}px`,
          }}
        />
        {context.settings.producerWindowPosition !=
          ProducerWindowPosition.None && (
          <ProducerBar
            // previews={previewSurfaces}
            gameSurface={gameSurface}
            position={context.settings.producerWindowPosition}
            size={context.settings.producerDockSize}
          />
        )}

        {hudData.showMenu && (
          <Menu
            lang={context.lang}
            settings={context.settings}
            onClose={() => {
              hudData.showMenu = false;
              toggleAllHud(!hudData.showMenu);
            }}
            isReplay={true}
            hasNextReplay={false}
            onNextReplay={() => {}}
            onBackToMainMenu={() => {}}
          />
        )}
        <HUD
          gameDimensions={gameSurface.getRect()}
          players={players}
          autoSpeed={replayPosition.autoSpeed}
          destination={replayPosition.destination}
          gameSpeed={replayPosition.gameSpeed}
          maxFrame={replayPosition.maxFrame}
          position={hudData.position()}
          paused={replayPosition.paused}
          timeLabel={replayPosition.getFriendlyTime()}
          onChangeGameSpeed={hudData.onChangeGameSpeed}
          onChangeAutoGameSpeed={hudData.onChangeAutoGameSpeed}
          onChangePosition={hudData.onChangePosition}
          onTogglePaused={hudData.onTogglePaused}
          minimapCanvas={minimapSurface.canvas}
          onTogglePlayerPov={hudData.onTogglePlayerPov}
          selectedUnits={selectedUnits}
          onFollowUnit={hudData.onFollowUnit}
          followingUnit={followingUnit}
          onUnitDetails={hudData.onUnitDetails}
          UnitDetails={hudData.showingUnitDetails}
          gameIcons={gameIcons}
          hideMinimap={hudData.hideMinimap}
          hideUnitSelection={hudData.hideUnitSelection}
          hideReplayPosition={hudData.hideReplayPosition}
          hideProduction={hudData.hideProduction}
          hideResources={hudData.hideResources}
          alwaysHideReplayControls={context.settings.alwaysHideReplayControls}
          esportsHud={context.settings.esportsHud}
        />
      </>
    );
    if (firstUiUpdate) {
      firstUiUpdate = false;
    }
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
      Math.floor((gameSurface.height * context.settings.minimapRatio) / 100),
      Math.floor((gameSurface.height * context.settings.minimapRatio) / 100)
    );
    cameras.updatePreviewScreenAspect(
      minimapSurface.width,
      minimapSurface.height
    );
    updateUi();
  };
  sceneResizeHandler();
  window.addEventListener("resize", sceneResizeHandler, false);

  let unitsLastFrame = [];
  let unitsThisFrame = [];
  let bulletsLastFrame = [];
  let bulletsThisFrame = [];

  const version = replayPosition.readInt32AndAdvance();
  if (version !== 5) {
    throw new Error("invalid rep.bin version");
  }
  replayPosition.maxFrame = replayPosition.readInt32AndAdvance();

  document.addEventListener("keydown", (evt) => {
    if (evt.code === "KeyZ") {
      cameras.useCinematic(!cameras.isCinematic());
    }
  });

  function gameLoop() {
    uiUpdated = false;

    if (onFastestTick(replayPosition.frame)) {
      updateUi();
    }

    replayPosition.update();
    cameras.update();

    if (!replayPosition.paused) {
      debugInfo.clear();
      debugInfo.append(`Frame: ${replayPosition.bwGameFrame}`);
      debugInfo.append(`Time: ${replayPosition.getFriendlyTime()}`);
      debugInfo.append(
        `Mem : ${(window.performance.memory.usedJSHeapSize / 1000).toFixed(2)}`
      );

      for (let gf = 0; gf < replayPosition.skipGameFrames; gf++) {
        replayPosition.bwGameFrame = replayPosition.readInt32AndAdvance();

        players[0].gas = replayPosition.readInt32AndAdvance();
        players[1].gas = replayPosition.readInt32AndAdvance();
        players[0].minerals = replayPosition.readInt32AndAdvance();
        players[1].minerals = replayPosition.readInt32AndAdvance();

        if (replayPosition.isMaxFrame()) {
          replayPosition.pause();
          continue;
        }

        const numUnitsThisFrame = replayPosition.readUInt32AndAdvance();

        unitsThisFrame = [];
        for (let i = 0; i < numUnitsThisFrame; i++) {
          const { frameData, frameSize } = BWAPIUnitFromBuffer(
            BWAPIFramesDataView,
            replayPosition.bwapiBufferPosition
          );

          units.updateUnit(
            frameData,
            replayPosition.bwGameFrame,
            replayPosition.skippingFrames()
          );

          replayPosition.advanceBuffer(frameSize);
          unitsThisFrame.push(frameData.repId);
        }

        const numBulletsThisFrame = replayPosition.readUInt32AndAdvance();

        bulletsThisFrame = [];
        for (let i = 0; i < numBulletsThisFrame; i++) {
          const { frameData, frameSize } = BWAPIBulletFromBuffer(
            BWAPIFramesDataView,
            replayPosition.bwapiBufferPosition
          );

          replayPosition.advanceBuffer(frameSize);
          bulletsThisFrame.push(frameData);
        }

        const deadUnits = difference(unitsLastFrame, unitsThisFrame);
        units.killUnits(deadUnits);
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
            }
            if (players[cmd.player].showActions) {
              switch (cmd.id) {
                case commands.rightClick:
                case commands.targetedOrder:
                case commands.build:
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

          // #endregion player commandpointers
        }
        fadingPointers.update(replayPosition.bwGameFrame);
      }

      if (replayPosition.willUpdateAutospeed()) {
        const attackingUnits = unitsThisFrame
          .map((unitRepId) =>
            units.units.children.find(
              ({ userData }) => userData.repId === unitRepId
            )
          )
          .filter((unit) => heatMapScore.unitOfInterestFilter(unit));

        if (replayPosition.updateAutoSpeed(attackingUnits)) {
          updateUi();
        }
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

    units.cameraDirection.previousDirection = units.cameraDirection.direction;

    units.cameraDirection.direction = cameras.getDirection32();
    units.setShear(cameras.getShear());

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
      renderMan.bokehOptions.focus = cameras.control.distance;
      intersectAxesHelper.position.copy(audioListener.position);
      renderMan.render(scene, cameras.camera, cameras.isCinematic());
    }

    const useMinimapPreview =
      cameras.previewOn &&
      context.settings.producerWindowPosition === ProducerWindowPosition.None;

    if (
      useMinimapPreview ||
      (!replayPosition.skippingFrames() && replayPosition.bwGameFrame % 100) ||
      (replayPosition.skippingFrames() && replayPosition.bwGameFrame % 1000)
    ) {
      renderMan.setCanvasTarget(minimapSurface);
      renderMan.renderer.clear();

      if (useMinimapPreview) {
        renderMan.render(scene, cameras.previewCamera);
      } else {
        renderMan.render(scene, cameras.minimapCamera);
      }
    }

    stats.update();
  }

  const dispose = () => {
    console.log("disposing");

    renderMan.renderer.setAnimationLoop(null);
    renderMan.dispose();

    replayPosition.pause();

    bgMusic.dispose();

    window.addEventListener("resize", sceneResizeHandler, false);

    minimapControl.dispose();
    scene.dispose();
    cameras.dispose();
    debugInfo.dispose();
    stats.dispose();

    keyboardShortcuts.dispose();
    gameSurface.canvas.removeEventListener("mousedown", mouseDownListener);
  };

  renderMan.renderer.setAnimationLoop(gameLoop);

  if (context.settings.startPaused) {
    //@todo run first frame
  } else {
    replayPosition.resume();
  }

  return {
    dispose,
  };
}
