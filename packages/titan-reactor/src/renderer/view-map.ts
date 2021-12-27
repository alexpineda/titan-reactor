// playground for environment
import { debounce } from "lodash";
import { CircleGeometry, Color, Mesh, MeshBasicMaterial, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { ChkUnit, ChkSprite } from "bw-chk";

import { iscriptHeaders, unitTypes } from "../common/bwdat/enums";
import { CanvasTarget } from "../common/image";
import { IScriptSprite } from "./core"
import {
  BwDAT,
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
  bwDat: BwDAT,
  preplacedMapUnits: ChkUnit[],
  preplacedMapSprites: ChkSprite[],
  terrainInfo: TerrainInfo,
  scene: Scene,
  createTitanSprite: () => IScriptSprite
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
  document.body.appendChild(gameSurface.canvas);

  scene.background = new Color(settings.mapBackgroundColor);

  const cameraRig = new CameraRig({
    settings,
    gameSurface,
    keyboardShortcuts,
    freeControl: true,
  }
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
  if (!renderer.renderer) {
    throw new Error("Renderer not initialized");
  }
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

  const sprites: IScriptSprite[] = [];
  const critters: IScriptSprite[] = [];
  const disabledDoodads: IScriptSprite[] = [];

  for (const unit of preplacedMapUnits) {
    continue;
  }

  for (const sprite of preplacedMapSprites) {
    continue;

  }

  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

    cameraRig.updateGameScreenAspect(gameSurface.width, gameSurface.height);
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);

  let last = 0;
  let frame = 0;
  let frameElapsed = 0;
  renderer.setCanvasTarget(gameSurface);
  renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

  function gameLoop(elapsed: number) {
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

    renderer.dispose();
    scene.dispose();
    cameraRig.dispose();

    // @todo call keyboardShortcuts.dispose() ?

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleMenu,
      toggleMenuHandler
    );

    keyboardShortcuts.removeEventListener(
      InputEvents.ToggleCursor,
      toggleCursorHandler
    );
  };

  return {
    isMap: true,
    scene,
    gameSurface,
    dispose,
  };
}

export default TitanReactorMap;
