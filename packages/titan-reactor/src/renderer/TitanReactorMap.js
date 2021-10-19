// playground for environment
import * as THREE from "three";
import { debounce } from "lodash";

import { createStartLocation } from "./mesh/BasicObjects";
import CameraRig from "./camera/CameraRig";
import RenderMan from "./render/RenderMan";
import CanvasTarget from "../common/image/CanvasTarget";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import FogOfWar from "./game/fogofwar/FogOfWar";
import InputEvents from "./input/InputEvents";

import { pxToMapMeter } from "../common/utils/conversions";
import useSettingsStore from "./stores/settingsStore";
import useHudStore from "./stores/hudStore";
import { iscriptHeaders } from "../common/types/iscriptHeaders";
import { unitTypes } from "../common/types/unitTypes";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MOUSE } from "three";

async function TitanReactorMap(bwDat, chk, scene, createTitanSprite) {
  const [mapWidth, mapHeight] = chk.size;
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  var lightCameraHelper = new THREE.CameraHelper(scene.light.shadow.camera);
  lightCameraHelper.visible = false;
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(scene.light, 5);
  scene.add(lightHelper);
  lightHelper.visible = false;

  let settings = useSettingsStore.getState().data;
  const isDev = useSettingsStore.getState().isDev;

  const keyboardShortcuts = new KeyboardShortcuts(document);

  const toggleMenuHandler = () => useHudStore.getState().toggleInGameMenu();
  keyboardShortcuts.addEventListener(InputEvents.ToggleMenu, toggleMenuHandler);

  const toggleElevationHandler = () => scene.toggleElevation();
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleElevation,
    toggleElevationHandler
  );

  const toggleCursorHandler = () => {
    if (window.document.body.style.cursor === "none") {
      window.document.body.style.cursor = null;
    } else {
      window.document.body.style.cursor = "none";
    }
  };
  keyboardShortcuts.addEventListener(
    InputEvents.ToggleCursor,
    toggleCursorHandler
  );

  const gameSurface = new CanvasTarget();
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);

  scene.background = new THREE.Color(settings.mapBackgroundColor);

  const cameraRig = new CameraRig(
    settings,
    mapWidth,
    mapHeight,
    gameSurface,
    null,
    null,
    keyboardShortcuts,
    true
  );
  window.cameraRig = cameraRig;
  const orbitControls = new OrbitControls(cameraRig.camera, gameSurface.canvas);

  orbitControls.screenSpacePanning = false;
  orbitControls.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };
  cameraRig.camera.position.set(0, 120, 100);
  cameraRig.camera.lookAt(0, 0, 0);

  const renderMan = new RenderMan(settings, isDev);
  await renderMan.initRenderer(cameraRig.camera);
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
  const critters = [];
  const disabledDoodads = [];

  for (let unit of chk.units) {
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

    if (unit.isDisabled) {
      disabledDoodads.push(titanSprite);
      titanSprite.visible = settings.showDisabledDoodads;
    } else if (
      [
        unitTypes.rhynadon,
        unitTypes.bengalaas,
        unitTypes.scantid,
        unitTypes.kakaru,
        unitTypes.ragnasaur,
        unitTypes.ursadon,
      ].includes(unit.unitId)
    ) {
      critters.push(titanSprite);
      titanSprite.visible = settings.showCritters;
    }
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

    cameraRig.updateGameScreenAspect(gameSurface.width, gameSurface.height);
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);

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

    cameraRig.update(delta);
    renderMan.updateFocus(cameraRig);
    keyboardShortcuts.update(delta);
    fogOfWar.update(cameraRig.camera);
    renderMan.render(scene, cameraRig.camera, delta);
    last = elapsed;

    orbitControls.update();
  }

  renderMan.renderer.setAnimationLoop(gameLoop);

  window.scene = scene;

  const unsub = useSettingsStore.subscribe((state, prevState) => {
    settings = state.data;
    const prevSettings = prevState.data;

    if (prevSettings.showDisabledDoodads !== settings.showDisabledDoodads) {
      disabledDoodads.forEach((doodad) => {
        doodad.visible = settings.showDisabledDoodads;
      });
    }

    if (prevSettings.showCritters !== settings.showCritters) {
      critters.forEach((critter) => {
        critter.visible = settings.showCritters;
      });
    }

    // if (prevSettings.mouseRotateSpeed !== settings.mouseRotateSpeed) {
    //   cameras.control.azimuthRotateSpeed = settings.mouseRotateSpeed;
    //   cameras.control.polarRotateSpeed = settings.mouseRotateSpeed;
    // }

    if (prevSettings.mapBackgroundColor !== settings.mapBackgroundColor) {
      scene.background = new THREE.Color(settings.mapBackgroundColor);
    }
  });

  const dispose = () => {
    unsub();

    window.cameras = null;
    window.scene = null;
    window.renderMan = null;

    window.document.body.style.cursor = null;
    window.removeEventListener("resize", sceneResizeHandler);

    renderMan.renderer.setAnimationLoop(null);
    running = false;

    scene.dispose();

    cameraRig.dispose();
    renderMan.dispose();

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleMenu,
      toggleMenuHandler
    );

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleElevation,
      toggleElevationHandler
    );

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleCursor,
      toggleCursorHandler
    );

    keyboardShortcuts.dispose();
  };

  return {
    gameSurface,
    dispose,
  };
}

export default TitanReactorMap;
