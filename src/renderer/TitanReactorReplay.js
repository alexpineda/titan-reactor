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
import { BgMusic } from "./audio/BgMusic";

import { Units } from "./replay/Units";
//todo refactor out
import { difference } from "ramda";
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

  console.log("rep", rep);

  const stats = createStats();

  const pxToMeter = pxToMapMeter(chk.size[0], chk.size[1]);
  const heatMapScore = new HeatmapScore(bwDat);
  const minimap = new Minimap(
    context.getMinimapCanvas(),
    scene.terrain.material.map,
    chk.size[0],
    chk.size[1],
    heatMapScore
  );

  const mainCamera = new MainCamera(context, minimap);
  mainCamera.control.update();
  scene.add(mainCamera.minimapCameraHelper);

  // const cubeCamera = new TerrainCubeCamera(context, scene.terrain.material.map);
  // scene.add(cubeCamera);

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

  scene.add(minimap.minimapPlane);
  scene.add(minimap.heatmap);

  const pointLight = new PointLight(0xffffff, 1, 60, 0);
  pointLight.power = 20;
  pointLight.castShadow = true;
  scene.add(pointLight);

  const audioListener = new AudioListener();
  mainCamera.camera.add(audioListener);
  bgMusic.setListener(audioListener);
  bgMusic.setVolume(0.01);
  bgMusic.playGame();
  scene.add(bgMusic.getAudio());

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
  replayPosition.autoSpeed = gameSpeeds.fastest;

  replayPosition.onResetState = () => {
    unitsLastFrame = [];
    unitsThisFrame = [];
    units.clear();
  };

  let showMenu = false;
  const keyDownListener = (e) => {
    if (e.code === "KeyP") {
      if (replayPosition.paused) {
        replayPosition.resume();
      } else {
        replayPosition.pause();
      }
    }

    // esc
    if (e.keyCode == 27) {
      showMenu = !showMenu;
    }

    if (e.code === "KeyG") {
      scene.gridHelper.visible = !scene.gridHelper.visible;
    }
  };

  document.addEventListener("keydown", keyDownListener);

  let selectedUnits = [];
  let followingUnit = false;
  let showingUnitDetails;

  const mouseDownListener = (event) => {
    var raycaster = new Raycaster();
    var mouse = new Vector2();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

  //@todo move to class
  const hudData = {
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
      if (showingUnitDetails) {
        showingUnitDetails = null;
      } else {
        showingUnitDetails = createUnitDetails(
          bwDat,
          selectedUnits[0].userData.typeId
        );
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

  let uiUpdated = false;
  let firstUiUpdate = true;
  const updateUi = () => {
    // just in case we call several times in game loop
    if (uiUpdated) return;

    uiUpdated = true;

    players.updateResources(units);

    reactApp.hud(
      <>
        {showMenu && (
          <Menu
            lang={context.lang}
            onClose={() => {
              showMenu = false;
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
          UnitDetails={showingUnitDetails}
          gameIcons={gameIcons}
        />
      </>
    );
    if (firstUiUpdate) {
      minimap.refresh();
      firstUiUpdate = false;
    }
  };

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
        `Mem : ${window.performance.memory.usedJSHeapSize.toFixed(2)}`
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
            players[player].apm =
              players[player].totalActions /
              (replayPosition.bwGameFrame * gameSpeeds.fastest);
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

    pointLight.position.copy(mainCamera.camera.position);
    pointLight.position.y += 5;

    units.cameraDirection.previousDirection = units.cameraDirection.direction;

    units.cameraDirection.direction = mainCamera.getDirection32();
    units.setShear(mainCamera.getShear());

    if (players[0].showPov && players[1].showPov) {
      context.renderer.setScissorTest(true);
      players.forEach(({ camera }) => {
        context.renderer.setViewport(camera.viewport);
        context.renderer.setScissor(camera.viewport);
        context.renderer.render(scene, camera);
      });
      context.renderer.setScissorTest(false);
    } else if (players[0].showPov) {
      context.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      context.renderer.render(scene, players[0].camera);
    } else if (players[1].showPov) {
      context.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      context.renderer.render(scene, players[1].camera);
    } else {
      //#region followUnit
      if (followingUnit && selectedUnits.length) {
        const x =
          selectedUnits.reduce(
            (sum, unit) => sum + unit.getWorldPosition().x,
            0
          ) / selectedUnits.length;
        const y =
          selectedUnits.reduce(
            (sum, unit) => sum + unit.getWorldPosition().y,
            0
          ) / selectedUnits.length;
        //@todo pick better height
        mainCamera.camera.position.set(x, 40, y + 5);
        //@todo use terrainY
        mainCamera.camera.lookAt(new Vector3(x, 0, y));
      }
      //#endregion
      context.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
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

    document.removeEventListener("keydown", keyDownListener);
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
