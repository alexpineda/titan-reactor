// playground for environment
import { debounce } from "lodash";
import { Color, PerspectiveCamera } from "three";
import Chk from "bw-chk";
import CameraControls from "camera-controls";
import { RenderPass } from "postprocessing";

import { playerColors } from "common/enums";
import {
  AssetTextureResolution,
  GeometryOptions,
  SceneState,
  TerrainInfo,
  UnitTileScale,
} from "common/types";

import { Surface } from "@image";
import { IScriptSprite } from "@core";
import * as log from "@ipc/log";
import { Scene, renderComposer, root } from "@render";
import { MapDisplayOptions, MapViewer } from "@render/map-options";
import { useSettingsStore } from "@stores";
import Janitor from "@utils/janitor";
import createStartLocation from "@core/create-start-location";
import { updatePostProcessingCamera } from "@utils/renderer-utils";
import chkToTerrainMesh from "@image/generate-map/chk-to-terrain-mesh";
import { defaultGeometryOptions } from "@image/generate-map";

export async function mapScene(
  chk: Chk,
  terrainInfo: TerrainInfo,
  scene: Scene,
  janitor: Janitor
): Promise<SceneState> {
  // const assets = gameStore().assets;
  scene.autoUpdate = true;
  scene.sunlight.shadow.autoUpdate = true;
  renderComposer.getWebGLRenderer().shadowMap.autoUpdate = true;

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

  const mapWidth = chk.size[0];
  const mapHeight = chk.size[1]; // const pxToGameUnit = pxToMapMeter(mapWidth, mapHeight);

  let settings = useSettingsStore.getState().data;
  if (!settings) {
    throw new Error("Settings not loaded");
  }

  const gameSurface = new Surface();
  gameSurface.setDimensions(window.innerWidth, window.innerHeight);
  document.body.appendChild(gameSurface.canvas);
  janitor.callback(() => document.body.removeChild(gameSurface.canvas));

  // scene.background = new Color(settings.mapBackgroundColor);
  const camera = new PerspectiveCamera(55, gameSurface.aspect, 0.1, 1000);

  const createControls = () => {
    const control = new CameraControls(camera, gameSurface.canvas);
    control.mouseButtons.left = CameraControls.ACTION.TRUCK;
    control.mouseButtons.right = CameraControls.ACTION.ROTATE;
    control.mouseButtons.middle = CameraControls.ACTION.DOLLY;
    control.dollyToCursor = true;
    control.verticalDragToForward = true;
    control.setLookAt(0, 50, 0, 0, 0, 0, true);
    return control;
  };
  let control = createControls();

  const renderPass = new RenderPass(scene, camera);
  const postProcessingBundle = { passes: [renderPass], effects: [] };
  updatePostProcessingCamera(postProcessingBundle, camera, true);
  renderComposer.setBundlePasses(postProcessingBundle);

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
    renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);

    camera.aspect = gameSurface.aspect;
    camera.updateProjectionMatrix();
  };
  const sceneResizeHandler = debounce(_sceneResizeHandler, 500);
  window.addEventListener("resize", sceneResizeHandler, false);
  janitor.callback(() =>
    window.removeEventListener("resize", sceneResizeHandler)
  );

  let last = 0;
  let frameElapsed = 0;
  renderComposer.targetSurface = gameSurface;
  renderComposer.setSize(gameSurface.bufferWidth, gameSurface.bufferHeight);

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
    renderComposer.render(delta);
    renderComposer.renderBuffer();
    last = elapsed;
  }

  renderComposer.getWebGLRenderer().setAnimationLoop(gameLoop);
  janitor.callback(() =>
    renderComposer.getWebGLRenderer().setAnimationLoop(null)
  );

  const dispose = () => {
    root.render(null);
    log.info("disposing map viewer");
    janitor.mopUp();
  };

  renderComposer.onRestoreContext = async () => {
    renderComposer.getWebGLRenderer().setAnimationLoop(null);
    await update(_lastSetOptions);
    log.info("restoring map viewer");
    renderComposer.getWebGLRenderer().setAnimationLoop(gameLoop);
  };

  let _lastSetOptions = defaultGeometryOptions;
  const update = debounce(async (options: GeometryOptions) => {
    scene.terrain.children.forEach((c) => {
      c.material.color = new Color(0x999999);
    });

    const { terrain } = await chkToTerrainMesh(
      chk,
      {
        textureResolution:
          settings.assets.terrain === AssetTextureResolution.SD
            ? UnitTileScale.SD
            : UnitTileScale.HD,
        anisotropy: settings.graphics.anisotropy,
        shadows: settings.graphics.terrainShadows,
      },
      options
    );

    scene.replaceTerrain(terrain.mesh);
    updateDisplayOptions(_displayOptions);
    _sceneResizeHandler();
  }, 1000);

  let _displayOptions: MapDisplayOptions = {
    wireframe: false,
    skybox: false,
    sunColor: "#ffffff",
    sunIntensity: scene.sunlight.intensity,
    sunPosition: scene.sunlight.position.clone(),
  };

  const updateDisplayOptions = (options: MapDisplayOptions) => {
    console.log(options);
    scene.terrain.children.forEach((c) => {
      c.material.wireframe = options.wireframe;
      c.material.color = new Color(0xffffff);
    });

    scene.sunlight.position.copy(options.sunPosition);
    scene.sunlight.intensity = options.sunIntensity;
    scene.sunlight.color.set(options.sunColor);
    scene.sunlight.shadow.needsUpdate = true;

    scene.hemilight.intensity;
    scene.hemilight.color;
    scene.hemilight.groundColor;
  };

  return {
    id: "@map",
    dispose,
    start: () => {
      root.render(
        <MapViewer
          onChange={update}
          onDisplayOptionsChange={(e) => {
            _displayOptions = e;
            updateDisplayOptions(e);
          }}
          displayOptions={_displayOptions}
        />
      );
    },
  };
}
