import React from "react";
import {
  PointLight,
  Raycaster,
  Vector2,
  AudioListener,
  Camera,
  Vector3,
} from "three";

import {
  BWAPIUnitFromBuffer,
  BWAPIBulletFromBuffer,
} from "./replay/BWAPIFrames";

import { Units } from "./replay/Units";
//todo refactor out
import { difference, isEmpty } from "ramda";
import { ReplayPosition, ClockMs } from "./replay/ReplayPosition";
import { gameSpeeds, pxToMapMeter, onFastestTick } from "./utils/conversions";
import HUD from "./react-ui/hud/HUD";
import HeatmapScore from "./react-ui/hud/HeatmapScore";
import { DebugInfo } from "./utils/DebugINfo";
import { MainCamera } from "./replay/MainCamera";
import { Minimap } from "./replay/Minimap";
import { Players } from "./replay/Players";
import { FadingPointers } from "./mesh/FadingPointers";
import { MinimapUnitLayer } from "./replay/Layers";
import { commands } from "bwdat/commands";
import { PlayerPovCamera, PovLeft, PovRight } from "./replay/PlayerPovCamera";
import { TerrainCubeCamera } from "./replay/CubeCamera";
import { unitTypes } from "../common/bwdat/unitTypes";
import createUnitDetails from "./react-ui/hud/unitDetails/createUnitDetails";
import Menu from "./react-ui/hud/Menu";
import { createStats } from "utils/stats";
import KeyboardShortcuts, { KeyboardEvents } from "./input/KeyboardShortcuts";

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

  console.log("rep", rep);

  const pxToMeter = pxToMapMeter(chk.size[0], chk.size[1]);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimap = new Minimap(
    context.getMinimapCanvas(),
    scene.terrain.material.map,
    chk.size[0],
    chk.size[1],
    heatMapScore
  );

  scene.add(minimap.minimapPlane);
  scene.add(minimap.heatmap);

  const mainCamera = new MainCamera(context, minimap);
  mainCamera.control.update();
  scene.add(mainCamera.minimapCameraHelper);

  // const cubeCamera = new TerrainCubeCamera(context, scene.terrain.material.map);
  // scene.add(cubeCamera);

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
  mainCamera.camera.add(audioListener);
  bgMusic.setListener(audioListener);
  bgMusic.setVolume(0.01);
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
    { main: mainCamera.camera },
    {}
  );
  scene.add(units.units);

  let replayPosition = new ReplayPosition(
    BWAPIFramesDataView,
    rep.header.frameCount,
    new ClockMs(),
    gameSpeeds.fastest,
    heatMapScore
  );

  //@todo disable if turned off in settings
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
      context.renderer.gammaFactor = diff.gamma;
    }
    if (diff.shadows) {
      context.setShadowLevel(diff.shadows);
    }
  });

  // #endregion

  // #region keyboard shortcuts
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
  };

  const keyboardShortcuts = new KeyboardShortcuts(document);
  {
    const ev = (event, action) =>
      keyboardShortcuts.addEventListener(event, action);
    const k = KeyboardEvents;
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
  }
  // #endregion keyboard shortcuts

  let selectedUnits = [];
  let followingUnit = false;

  // #region mouse listener
  const mouseDownListener = (event) => {
    var raycaster = new Raycaster();
    var mouse = new Vector2();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    const [width, height] = context.getSceneDimensions();

    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
    raycaster.setFromCamera(mouse, mainCamera.camera);

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

    if (!intersects.length) return;
    intersects.slice(0, 1).forEach(({ object }) => {
      const unit = getAsUnit(object);

      if (unit) {
        selectedUnits = [unit];
        console.log(unit.userData.repId, unit);
      }
    });
  };
  document.addEventListener("mousedown", mouseDownListener);
  //#endregion mouse listener

  const fadingPointers = new FadingPointers();
  fadingPointers.layers.enable(MinimapUnitLayer);
  scene.add(fadingPointers);

  let unitsLastFrame = [];
  let unitsThisFrame = [];
  let bulletsLastFrame = [];
  let bulletsThisFrame = [];

  const version = replayPosition.readInt32AndAdvance();
  if (version !== 5) {
    throw new Error("invalid rep.bin version");
  }
  replayPosition.maxFrame = replayPosition.readInt32AndAdvance();

  //#region hud ui
  const hudData = {
    showMenu: false,
    hideReplayPosition: false,
    hideMinimap: false,
    hideUnitSelection: false,
    hideResources: false,
    hideProduction: false,
    showingUnitDetails: false,
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
          selectedUnits[0].userData.typeId
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
        const [w, h] = context.getSceneDimensions();
        players.forEach(({ camera }) => camera.updateAspect(w, h));

        mainCamera.control.enabled = players.activePovs === 0;
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

    reactApp.hud(
      <>
        {hudData.showMenu && (
          <Menu
            lang={context.lang}
            settings={context.settings}
            onClose={() => {
              hudData.showMenu = false;
            }}
            isReplay={true}
            hasNextReplay={false}
            onNextReplay={() => {}}
            onBackToMainMenu={() => {}}
          />
        )}
        <HUD
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
          minimapCanvas={context.minimapCanvas}
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
        />
      </>
    );
    if (firstUiUpdate) {
      minimap.refresh();
      firstUiUpdate = false;
    }
  };
  //#endregion hud ui

  const lostContextHandler = () => {
    context.renderer.setAnimationLoop(null);
  };
  context.addEventListener("lostcontext", lostContextHandler);

  const restoreContextHandler = () => {
    context.initRenderer(true);
    // cubeCamera.onRestoreContext();
    context.renderer.setAnimationLoop(gameLoop);
  };
  context.addEventListener("restorecontext", restoreContextHandler);

  const sceneResizeHandler = ({ message: [width, height] }) => {
    mainCamera.updateAspect(width, height);
    players.forEach(({ camera }) => camera.updateAspect(width, height));
    minimap.refresh();
  };
  context.addEventListener("resize", sceneResizeHandler);
  context.forceResize();

  function gameLoop() {
    uiUpdated = false;

    if (onFastestTick(replayPosition.frame)) {
      updateUi();
    }

    replayPosition.update();

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

    units.cameraDirection.previousDirection = units.cameraDirection.direction;

    units.cameraDirection.direction = mainCamera.getDirection32();
    units.setShear(mainCamera.getShear());

    const [width, height] = context.getSceneDimensions();

    if (players[0].showPov && players[1].showPov) {
      context.renderer.setScissorTest(true);
      players.forEach(({ camera }) => {
        context.renderer.setViewport(camera.viewport);
        context.renderer.setScissor(camera.viewport);
        context.renderer.render(scene, camera);
      });
      context.renderer.setScissorTest(false);
    } else if (players[0].showPov) {
      context.renderer.setViewport(0, 0, width, height);
      context.renderer.render(scene, players[0].camera);
    } else if (players[1].showPov) {
      context.renderer.setViewport(0, 0, width, height);
      context.renderer.render(scene, players[1].camera);
    } else {
      //#region followUnit
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
        //@todo pick better height
        mainCamera.camera.position.set(x, 40, z + 5);
        //@todo use terrainY
        mainCamera.camera.lookAt(new Vector3(x, getTerrainY(x, z), z));
      }
      //#endregion
      context.renderer.setViewport(0, 0, width, height);
      context.renderer.render(scene, mainCamera.camera);
    }

    context.renderer.clearDepth();
    context.renderer.setScissor(minimap.viewport);
    context.renderer.setScissorTest(true);
    context.renderer.setViewport(minimap.viewport);
    context.renderer.render(scene, minimap.camera); //minimap.camera);
    context.renderer.setScissorTest(false);

    stats.update();
  }

  context.renderer.setAnimationLoop(gameLoop);

  //@todo add settings to not auto play
  replayPosition.resume();

  const dispose = () => {
    console.log("disposing");

    context.renderer.setAnimationLoop(null);

    replayPosition.pause();

    bgMusic.dispose();

    context.removeEventListener("resize", sceneResizeHandler);
    context.removeEventListener("lostcontext", lostContextHandler);
    context.removeEventListener("restorecontext", restoreContextHandler);

    minimap.dispose();
    scene.dispose();
    mainCamera.dispose();
    debugInfo.dispose();
    stats.dispose();

    keyboardShortcuts.dispose();
    document.removeEventListener("mousedown", mouseDownListener);
  };

  if (module.hot) {
    module.hot.dispose((data) => {
      Object.assign(data, {
        camera: mainCamera.camera,
        BWAPIFrame: replayPosition.bwGameFrame,
        filepath,
      });
      dispose();
    });
  }

  return {
    dispose,
  };
}
