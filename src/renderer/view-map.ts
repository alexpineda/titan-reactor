// playground for environment
import { debounce } from "lodash";
import { PerspectiveCamera } from "three";
import Chk from "bw-chk";
import CameraControls from "camera-controls";
import { RenderPass } from "postprocessing";

import { playerColors } from "common/enums";
import type {
  TerrainInfo,
} from "common/types";

import { CanvasTarget } from "./image";
import { IScriptSprite } from "./core"
import * as log from "./ipc/log"
import { Scene } from "./render";
import renderer from "./render/renderer";
import { useSettingsStore } from "./stores";
import Janitor from "./utils/janitor";
import createStartLocation from "./core/create-start-location"

async function TitanReactorMap(
  chk: Chk,
  terrainInfo: TerrainInfo,
  scene: Scene
) {
  const janitor = new Janitor();
  // const assets = gameStore().assets;

  const preplacedMapUnits = chk.units;
  // const preplacedMapSprites = chk.sprites;

  // const iscriptRunner = new IScriptRunner(assets.bwDat, chk.tileset);
  // const createIScriptSprite = () => {
  //   return new IScriptSprite(
  //     null,
  //     assets.bwDat,
  //     createIScriptSprite,
  //     createImageFactory(
  //       assets.bwDat,
  //       assets.grps,
  //       settings.spriteTextureResolution,
  //     ),
  //     iscriptRunner,
  //     (sprite: Object3D) => scene.add(sprite)
  //   );
  // };

  const { mapWidth, mapHeight } = terrainInfo;
  // const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  let settings = useSettingsStore.getState().data;
  if (!settings) {
    throw new Error("Settings not loaded");
  }

  const gameSurface = new CanvasTarget();
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  document.body.appendChild(gameSurface.canvas);
  janitor.callback(() => document.body.removeChild(gameSurface.canvas));


  // scene.background = new Color(settings.mapBackgroundColor);
  const camera = new PerspectiveCamera(55, gameSurface.width / gameSurface.height, 3, 256);
  const control = new CameraControls(
    camera,
    gameSurface.canvas,
  );
  control.mouseButtons.left = CameraControls.ACTION.TRUCK;
  control.mouseButtons.right = CameraControls.ACTION.ROTATE;
  control.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  control.dollyToCursor = true;
  control.verticalDragToForward = true;
  janitor.disposable(control);
  control.setLookAt(0, 50, 0, 0, 0, 0, true);

  const renderPass = new RenderPass(scene, camera);
  renderer.setCameraModeEffectsAndPasses({
    passes: [renderPass]
  });
  renderer.changeCamera(camera);

  const startLocations = preplacedMapUnits
    .filter((unit) => unit.unitId === 214)
    .map((unit) => {
      const x = unit.x / 32 - mapWidth / 2;
      const y = unit.y / 32 - mapHeight / 2;
      return createStartLocation(
        x,
        y,
        playerColors[unit.player].hex,
        terrainInfo.getTerrainY(x, y)
      );
    });
  startLocations.forEach((sl) => scene.add(sl));

  const sprites: IScriptSprite[] = [];
  // const critters: IScriptSprite[] = [];
  // const disabledDoodads: IScriptSprite[] = [];

  // for (const unit of preplacedMapUnits) {
  //   const titanSprite = createTitanSprite();
  //   const unitDat = bwDat.units[unit.unitId];

  //   const x = pxToGameUnit.x(unit.x);
  //   const z = pxToGameUnit.y(unit.y);
  //   const y = terrainInfo.getTerrainY(x, z);

  //   titanSprite.position.set(x, y, z);

  //   titanSprite.addImage(unitDat.flingy.sprite.image.index);

  //   titanSprite.run(
  //     unit.isDisabled ? iscriptHeaders.disable : iscriptHeaders.init
  //   );

  //   scene.add(titanSprite);
  //   sprites.push(titanSprite);

  //   if (unit.isDisabled) {
  //     disabledDoodads.push(titanSprite);
  //     titanSprite.visible = settings.showDisabledDoodads;
  //   } else if (
  //     [
  //       unitTypes.rhynadon,
  //       unitTypes.bengalaas,
  //       unitTypes.scantid,
  //       unitTypes.kakaru,
  //       unitTypes.ragnasaur,
  //       unitTypes.ursadon,
  //     ].includes(unit.unitId)
  //   ) {
  //     critters.push(titanSprite);
  //     titanSprite.visible = settings.showCritters;
  //   }
  // }

  // for (const sprite of preplacedMapSprites) {
  //   const titanSprite = createTitanSprite();
  //   const spriteDat = bwDat.sprites[sprite.spriteId];

  //   const x = pxToGameUnit.x(sprite.x);
  //   const z = pxToGameUnit.y(sprite.y);
  //   const y = terrainInfo.getTerrainY(x, z);

  //   titanSprite.position.set(x, y, z);
  //   titanSprite.addImage(spriteDat.image.index);
  //   titanSprite.run(iscriptHeaders.init);
  //   scene.add(titanSprite);
  //   sprites.push(titanSprite);
  // }


  const _sceneResizeHandler = () => {
    gameSurface.setDimensions(window.innerWidth, window.innerHeight);
    renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

    camera.aspect = gameSurface.width / gameSurface.height;
    camera.updateProjectionMatrix();
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);
  janitor.callback(() => window.removeEventListener("resize", sceneResizeHandler));


  let last = 0;
  let frameElapsed = 0;
  renderer.targetSurface = gameSurface;
  renderer.setSize(gameSurface.scaledWidth, gameSurface.scaledHeight);

  function gameLoop(elapsed: number) {
    const delta = elapsed - last;
    frameElapsed += delta;
    if (frameElapsed > 42) {
      for (const sprite of sprites) {
        sprite.update(0, 0);
      }
      frameElapsed = 0;
    }

    control.update(delta / 1000);
    renderer.render(delta);
    last = elapsed;

  }

  renderer.getWebGLRenderer().setAnimationLoop(gameLoop);
  janitor.callback(() => renderer.getWebGLRenderer().setAnimationLoop(null));

  const dispose = () => {
    log.info("disposing map viewer");
    janitor.mopUp();

  };

  return dispose;
}

export default TitanReactorMap;
