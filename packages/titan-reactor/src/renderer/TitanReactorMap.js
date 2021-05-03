// playground for environment
import * as THREE from "three";
import { debounce } from "lodash";

import { EnvironmentOptionsGui } from "./terrain/EnvironmentOptionsGui";
import { createStartLocation } from "./mesh/BasicObjects";
import Cameras from "./camera/Cameras";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "titan-reactor-shared/image/CanvasTarget";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import { fog } from "./terrain/lights";
import FogOfWar from "./game/fogofwar/FogOfWar";
import InputEvents from "./input/InputEvents";

import { pxToMapMeter } from "titan-reactor-shared/utils/conversions";
import useSettingsStore from "./stores/settingsStore";
import useHudStore from "./stores/hudStore";
import { iscriptHeaders } from "titan-reactor-shared/types/iscriptHeaders";

export const hot = module.hot ? module.hot.data : null;

async function TitanReactorMap(bwDat, chk, scene, createTitanSprite) {
  const [mapWidth, mapHeight] = chk.size;
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  const gui = new EnvironmentOptionsGui();
  await gui.load(chk.tilesetName);

  var lightCameraHelper = new THREE.CameraHelper(scene.light.shadow.camera);
  lightCameraHelper.visible = false;
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(scene.light, 5);
  scene.add(lightHelper);
  lightHelper.visible = false;

  const settings = useSettingsStore.getState().data;
  const isDev = useSettingsStore.getState().isDev;

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const toggleMenuHandler = () => useHudStore.getState().toggleInGameMenu();
  keyboardShortcuts.addEventListener(InputEvents.ToggleMenu, toggleMenuHandler);

  const toggleElevationHandler = () => scene.toggleElevation();
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleElevation,
    toggleElevationHandler
  );

  const gameSurface = new CanvasTarget();
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);

  const cameras = new Cameras(
    settings,
    mapWidth,
    mapHeight,
    gameSurface,
    null,
    null,
    keyboardShortcuts,
    true
  );
  window.cameras = cameras;
  cameras.control.execNumpad(3);
  cameras.control.azimuthRotateSpeed = 0.05;
  cameras.control.polarRotateSpeed = 0.05;

  window.document.body.style.cursor = "none";

  const renderMan = new RenderMan(settings, isDev);
  await renderMan.initRenderer(cameras.camera);
  renderMan.enableRenderPass();
  window.renderMan = renderMan;

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderMan.fogOfWarEffect);
  fogOfWar.enabled = false;

  const getTerrainY = scene.getTerrainY();

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
        getTerrainY(x, y)
      );
    });
  startLocations.forEach((sl) => scene.add(sl));

  let sprites = [];

  for (let unit of chk.units) {
    if (unit.isDisabled && !settings.showDisabledDoodads) continue;
    const titanSprite = createTitanSprite();
    const unitDat = bwDat.units[unit.unitId];

    const x = pxToGameUnit.x(unit.x);
    const z = pxToGameUnit.y(unit.y);
    const y = getTerrainY(x, z);

    titanSprite.position.set(x, y, z);

    titanSprite.addImage(unitDat.flingy.sprite.image.index);

    titanSprite.run(
      unit.isDisabled ? iscriptHeaders.disable : iscriptHeaders.init
    );

    scene.add(titanSprite);
    sprites.push(titanSprite);
  }

  for (let sprite of chk.sprites) {
    const titanSprite = createTitanSprite();
    const spriteDat = bwDat.sprites[sprite.spriteId];

    const x = pxToGameUnit.x(sprite.x);
    const z = pxToGameUnit.y(sprite.y);
    const y = getTerrainY(x, z);

    titanSprite.position.set(x, y, z);
    titanSprite.addImage(spriteDat.image.index);
    titanSprite.run(iscriptHeaders.init);
    scene.add(titanSprite);
    sprites.push(titanSprite);
  }

  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight, false);

    cameras.updateGameScreenAspect(gameSurface.width, gameSurface.height);
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);

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

  let running = true;

  let last = 0;
  let frame = 0;
  let frameElapsed = 0;
  renderMan.setCanvasTarget(gameSurface);
  renderMan.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight, false);

  function gameLoop(elapsed) {
    if (!running) return;

    const delta = elapsed - last;
    frameElapsed += delta;
    if (frameElapsed > 42) {
      frame++;
      if (
        frame % 8 === 0 &&
        scene.terrainSD.material.userData.tileAnimationCounter !== undefined
      ) {
        scene.terrainSD.material.userData.tileAnimationCounter.value++;
      }
      for (let sprite of sprites) {
        sprite.update(delta);
      }
      frameElapsed = 0;
    }

    cameras.update(delta);
    renderMan.updateFocus(cameras);
    keyboardShortcuts.update(delta);
    fogOfWar.update(cameras.camera);
    renderMan.render(scene, cameras.camera, delta);
    last = elapsed;

    if (window.focusFn) {
      try {
        window.focusFn(cameras);
      } catch (e) {}
    }
  }

  renderMan.renderer.setAnimationLoop(gameLoop);

  window.scene = scene;

  // gui.dispose();

  const dispose = () => {
    console.log("disposing");

    window.cameras = null;
    window.scene = null;
    window.renderMan = null;

    window.document.body.style.cursor = null;
    window.removeEventListener("resize", sceneResizeHandler);

    renderMan.renderer.setAnimationLoop(null);
    running = false;

    scene.dispose();

    cameras.dispose();
    renderMan.dispose();

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleMenu,
      toggleMenuHandler
    );

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleElevation,
      toggleElevationHandler
    );

    try {
      gui.dispose();
    } catch (e) {}
    keyboardShortcuts.dispose();
  };

  return {
    surface: gameSurface,
    dispose,
  };
}

export default TitanReactorMap;
