// playground for environment
import * as THREE from "three";

import { EnvironmentOptionsGui } from "./3d-map-rendering/EnvironmentOptionsGui";
import { createStartLocation } from "./mesh/BasicObjects";
import Cameras from "./camera/Cameras";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "titan-reactor-shared/image/CanvasTarget";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import { fog } from "./3d-map-rendering/lights";
export const hot = module.hot ? module.hot.data : null;

async function TitanReactorMap(store, chk, scene) {
  const gui = new EnvironmentOptionsGui();
  await gui.load(chk.tilesetName);

  var lightCameraHelper = new THREE.CameraHelper(scene.light.shadow.camera);
  lightCameraHelper.visible = false;
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(scene.light, 5);
  scene.add(lightHelper);
  lightHelper.visible = false;

  const state = store.getState();

  const renderMan = new RenderMan(state.settings.data, state.settings.isDev);
  await renderMan.initRenderer();
  window.renderMan = renderMan;

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const gameSurface = new CanvasTarget();
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);

  const mainCamera = new Cameras(
    state.settings.data,
    gameSurface,
    null,
    null,
    keyboardShortcuts,
    true
  );

  const terrainY = scene.getTerrainY();

  const playerColors = [
    "#a80808",
    "#083498",
    "#209070",
    "#88409c",
    "#e87824",
    "#34200c",
    "#c4c0bc",
    "dcdc3c",
  ];
  const startLocations = chk.units
    .filter((unit) => unit.unitId === 214)
    .map((unit) => {
      const x = unit.x / 32 - chk.size[0] / 2;
      const y = unit.y / 32 - chk.size[1] / 2;
      return createStartLocation(
        x,
        y,
        playerColors[unit.player],
        terrainY(x, y)
      );
    });
  startLocations.forEach((sl) => scene.add(sl));

  // const minerals = chk.units
  //   .filter((unit) =>
  //     [unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3].includes(
  //       unit.unitId
  //     )
  //   )
  //   .map((unit) => {
  //     const x = unit.x / 32 - chk.size[0] / 2;
  //     const y = unit.y / 32 - chk.size[1] / 2;
  //     const m = mineral.clone();
  //     m.position.set(x, terrainY(x, y), y);
  //     return m;
  //   });
  // minerals.forEach((m) => scene.add(m));

  //#region camera controllers
  gui.controllers.camera.onChangeAny(({ fov, zoom, focus }) => {
    mainCamera.camera.fov = fov;
    mainCamera.camera.zoom = zoom;
    mainCamera.camera.focus = focus;

    mainCamera.camera.updateProjectionMatrix();
  });

  let cameraZoom = {
    start: 1,
    end: 1,
    i: 0,
    speed: 0.1,
    active: false,
  };
  //#endregion

  // const zerglings = [];
  // const lm = new LoadModel();
  // for (let i = 0; i < 1000; i++) {
  //   const z = await lm.load("_alex/zergling.glb");
  //   const x = (Math.random() - 0.5) * 128;
  //   const y = (Math.random() - 0.5) * 128;
  //   z.position.set(x, getTerrainY(x, y), y);
  //   // zerglings.push(z);
  //   // scene.add(z);
  // }

  //#region map controllers
  gui.controllers.map.onChangeAny(
    ({ showElevations, showWireframe, showBackgroundTerrain }) => {
      const { terrain, bgTerrain } = scene;

      if (showElevations) {
        terrain.material.map = terrain.userData.elevationsTexture;
      } else {
        terrain.material.map = terrain.userData.originalMap;
      }
      terrain.material.wireframe = showWireframe;
      bgTerrain.visible = showBackgroundTerrain;
    }
  );
  //#endregion

  //#region renderer controllers
  gui.controllers.renderer.fogColor.onChange((fogColor) => {
    scene.background = new THREE.Color(parseInt(fogColor.substr(1), 16));
    scene.fog.color = scene.background;
  });

  gui.controllers.renderer.fogEnabled.onChange((val) => {
    if (val) {
      scene.fog = fog(chk.size[0], chk.size[1]);
    } else {
      scene.fog = null;
    }
  });

  gui.controllers.renderer.onFinishChangeAny(
    ({ toneMappingExposure, toneMapping }) => {
      renderMan.renderer.toneMappingExposure = toneMappingExposure;
      renderMan.renderer.toneMapping = THREE[toneMapping];
      scene.traverse((o) => {
        if (o.type === "Mesh") {
          o.material.needsUpdate = true;
        }
      });
    }
  );
  //#endregion

  //#region hemilight controllers
  gui.controllers.hemilight.onChangeAny(
    ({ intensity, skyColor, groundColor }) => {
      const { hemi } = scene;
      hemi.intensity = intensity;
      hemi.skyColor = new THREE.Color(parseInt(skyColor.substr(1), 16));
      hemi.groundColor = new THREE.Color(parseInt(groundColor.substr(1), 16));
    }
  );
  //#endregion

  //#region dirlight controllers
  gui.controllers.dirlight.onChangeAny(
    ({ intensity, color, x, y, z, x2, y2, z2, helper }) => {
      const { light } = scene;
      light.intensity = intensity;
      light.color = new THREE.Color(parseInt(color.substr(1), 16));
      light.position.x = x;
      light.position.y = y;
      light.position.z = z;
      light.target.position.x = x2;
      light.target.position.y = y2;
      light.target.position.z = z2;
      lightCameraHelper.visible = helper;
      lightHelper.visible = helper;
    }
  );
  //#endregion

  //#region displacement base controllers
  // controllers.displacementBase.elevations.onChange;

  //#endregion

  //#region
  gui.controllers.displacementMix.show.onChange((value) => {
    const { terrain } = scene;
    if (value) {
      terrain.material.map = terrain.userData.displacementMap;
    } else {
      terrain.material.map = terrain.userData.originalMap;
    }
  });
  //#endregion

  let running = true;

  let last = 0;
  let frame = 0;
  let frameElapsed = 0;

  function gameLoop(elapsed) {
    if (!running) return;

    const delta = elapsed - last;
    frameElapsed += delta;
    if (frameElapsed > 42) {
      frame++;
      if (
        frame % 8 === 0 &&
        scene.terrain.material.userData.tileAnimationCounter
      ) {
        scene.terrain.material.userData.tileAnimationCounter.value++;
      }
      frameElapsed = 0;
    }

    mainCamera.update();

    renderMan.setCanvasTarget(gameSurface);
    renderMan.renderer.clear();
    renderMan.render(scene, mainCamera.camera);
    last = elapsed;
  }

  renderMan.renderer.setAnimationLoop(gameLoop);

  window.scene = scene;

  const dispose = () => {
    console.log("disposing");
    renderMan.renderer.setAnimationLoop(null);
    running = false;

    scene.dispose();

    mainCamera.dispose();
    renderMan.dispose();
    keyboardShortcuts.dispose();
    gui.dispose();
  };

  return {
    gameSurface,
    dispose,
  };
}

export default TitanReactorMap;
