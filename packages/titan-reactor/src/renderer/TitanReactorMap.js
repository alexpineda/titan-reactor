// playground for environment
import { debounce } from "lodash";
import { CircleGeometry, Color, Mesh, MeshBasicMaterial, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { iscriptHeaders } from "../common/bwdat/enums/iscriptHeaders";
import { unitTypes } from "../common/bwdat/enums/unitTypes";
import CanvasTarget from "../common/image/CanvasTarget";
import { pxToMapMeter } from "../common/utils/conversions";
import CameraRig from "./camera/CameraRig";
import FogOfWar from "./fogofwar/FogOfWar";
import InputEvents from "./input/InputEvents";
import KeyboardShortcuts from "./input/KeyboardShortcuts";
import RenderMan from "./render/RenderMan";
import useHudStore from "./stores/hudStore";
import useSettingsStore from "./stores/settingsStore";

function createStartLocation(mapX, mapY, color, mapZ = 0) {
  var geometry = new CircleGeometry(2, 32);
  var material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });
  var circle = new Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = mapZ;
  circle.name = "StartPosition";
  return circle;
}

async function TitanReactorMap(
  bwDat,
  preplacedMapUnits,
  preplacedMapSprites,
  terrainInfo,
  scene,
  createTitanSprite
) {
  const { mapWidth, mapHeight } = terrainInfo;
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

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

  scene.background = new Color(settings.mapBackgroundColor);

  const cameraRig = new CameraRig(
    settings,
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
  const startLocations = preplacedMapUnits
    .filter((unit) => unit.unitId === 214)
    .map((unit) => {
      const x = unit.x / 32 - mapWidth / 2;
      const y = unit.y / 32 - mapHeight / 2;
      return createStartLocation(
        x,
        y,
        playerColors[unit.player],
        terrainInfo.getTerrainY(x, y)
      );
    });
  startLocations.forEach((sl) => scene.add(sl));

  let sprites = [];
  const critters = [];
  const disabledDoodads = [];

  for (let unit of preplacedMapUnits) {
    const titanSprite = createTitanSprite();
    const unitDat = bwDat.units[unit.unitId];

    const x = pxToGameUnit.x(unit.x);
    const z = pxToGameUnit.y(unit.y);
    const y = terrainInfo.getTerrainY(x, z);

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

  for (let sprite of preplacedMapSprites) {
    const titanSprite = createTitanSprite();
    const spriteDat = bwDat.sprites[sprite.spriteId];

    const x = pxToGameUnit.x(sprite.x);
    const z = pxToGameUnit.y(sprite.y);
    const y = terrainInfo.getTerrainY(x, z);

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
      if (frame % 8 === 0) {
        scene.incrementTileAnimation();
      }
      for (let sprite of sprites) {
        sprite.update(delta);
      }
      frameElapsed = 0;
    }

    cameraRig.update(delta);
    renderMan.updateFocus(cameraRig);
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

    if (prevSettings.mapBackgroundColor !== settings.mapBackgroundColor) {
      scene.background = new Color(settings.mapBackgroundColor);
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
  };

  return {
    gameSurface,
    dispose,
  };
}

export default TitanReactorMap;
