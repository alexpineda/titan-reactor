// playground for environment
import { debounce } from "lodash";
import { CircleGeometry, Color, Mesh, MeshBasicMaterial, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { iscriptHeaders, unitTypes } from "../common/bwdat/enums";
import { CanvasTarget, TitanSprite } from "../common/image";
import {
  BwDATType,
  ChkSpriteType,
  ChkUnitType,
  TerrainInfo,
} from "../common/types";
import { pxToMapMeter } from "../common/utils/conversions";
import CameraRig from "./camera/camera-rig";
import FogOfWar from "./fogofwar/fog-of-war";
import { InputEvents, KeyboardShortcuts } from "./input";
import { Renderer, Scene } from "./render";
import { useHudStore, useSettingsStore } from "./stores";

function createStartLocation(
  mapX: number,
  mapY: number,
  color: string,
  mapZ = 0
) {
  const geometry = new CircleGeometry(2, 32);
  const material = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });
  const circle = new Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = mapZ;
  circle.name = "StartPosition";
  return circle;
}

async function TitanReactorMap(
  bwDat: BwDATType,
  preplacedMapUnits: ChkUnitType[],
  preplacedMapSprites: ChkSpriteType[],
  terrainInfo: TerrainInfo,
  scene: Scene,
  createTitanSprite: () => TitanSprite
) {
  const { mapWidth, mapHeight } = terrainInfo;
  const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  let settings = useSettingsStore.getState().data;
  if (!settings) {
    throw new Error("Settings not loaded");
  }

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
      window.document.body.style.cursor = "";
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
  //@ts-ignore
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

  const renderer = new Renderer(settings);
  await renderer.init(cameraRig.camera);
  renderer.enableRenderPass();
  //@ts-ignore
  window.renderMan = renderer;

  const fogOfWar = new FogOfWar(mapWidth, mapHeight, renderer.fogOfWarEffect);
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

  const sprites: TitanSprite[] = [];
  const critters: TitanSprite[] = [];
  const disabledDoodads: TitanSprite[] = [];

  for (const unit of preplacedMapUnits) {
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

  for (const sprite of preplacedMapSprites) {
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
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

    cameraRig.updateGameScreenAspect(gameSurface.width, gameSurface.height);
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);

  let running = true;

  let last = 0;
  let frame = 0;
  let frameElapsed = 0;
  renderer.setCanvasTarget(gameSurface);
  renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

  function gameLoop(elapsed: number) {
    if (!running) return;

    const delta = elapsed - last;
    frameElapsed += delta;
    if (frameElapsed > 42) {
      frame++;
      if (frame % 8 === 0) {
        scene.incrementTileAnimation();
      }
      for (const sprite of sprites) {
        sprite.update(delta);
      }
      frameElapsed = 0;
    }

    cameraRig.update();
    renderer.updateFocus(cameraRig.camera);
    fogOfWar.update(cameraRig.camera);
    renderer.render(scene, cameraRig.camera, delta);
    last = elapsed;

    orbitControls.update();
  }

  renderer.renderer.setAnimationLoop(gameLoop);

  //@ts-ignore
  window.scene = scene;

  const unsub = useSettingsStore.subscribe((state, prevState) => {
    settings = state.data;
    const prevSettings = prevState.data;
    if (settings === null || prevSettings === null) return;

    if (prevSettings.showDisabledDoodads !== settings.showDisabledDoodads) {
      for (const doodad of disabledDoodads) {
        doodad.visible = settings.showDisabledDoodads;
      }
    }

    if (prevSettings.showCritters !== settings.showCritters) {
      for (const critter of critters) {
        critter.visible = settings.showCritters;
      }
    }

    if (prevSettings.mapBackgroundColor !== settings.mapBackgroundColor) {
      scene.background = new Color(settings.mapBackgroundColor);
    }
  });

  const dispose = () => {
    unsub();

    //@ts-ignore
    window.cameras = null;
    //@ts-ignore
    window.scene = null;
    //@ts-ignore
    window.renderMan = null;

    window.document.body.style.cursor = "";
    window.removeEventListener("resize", sceneResizeHandler);

    renderer.renderer.setAnimationLoop(null);
    running = false;

    scene.dispose();

    cameraRig.dispose();
    renderer.dispose();

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
