// playground for environment
import * as THREE from "three";
import { EnvironmentOptionsGui } from "./3d-map-rendering/EnvironmentOptionsGui";
import { createStartLocation } from "./mesh/BasicObjects";
import { LoadModel } from "./mesh/LoadModels";
import { unitTypes } from "../common/bwdat/unitTypes";
import { Cameras } from "./replay/Cameras";

export const hot = module.hot ? module.hot.data : null;

export async function TitanReactorMapSandbox(context, filepath, chk, scene) {
  const gui = new EnvironmentOptionsGui();
  await gui.load(chk.tilesetName);

  var lightCameraHelper = new THREE.CameraHelper(scene.light.shadow.camera);
  lightCameraHelper.visible = false;
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(scene.light, 5);
  scene.add(lightHelper);
  lightHelper.visible = false;

  const cameras = new Cameras(context, scene.terrain.material.map);

  if (hot && hot.camera) {
    cameras.main.position.copy(hot.camera.position);
    cameras.main.rotation.copy(hot.camera.rotation);
  }
  cameras.control.update();
  scene.add(cameras.cubeCamera);

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

  const pointLight = new THREE.PointLight();
  pointLight.castShadow = true;
  scene.add(pointLight);

  const loadModel = new LoadModel();
  const mineral = await loadModel.load("_alex/mineral1.glb", "mineral", (o) => {
    o.receiveShadow = false;
    o.userData.needsEnvMap = true;
  });

  const minerals = chk.units
    .filter((unit) =>
      [unitTypes.mineral1, unitTypes.mineral2, unitTypes.mineral3].includes(
        unit.unitId
      )
    )
    .map((unit) => {
      const x = unit.x / 32 - chk.size[0] / 2;
      const y = unit.y / 32 - chk.size[1] / 2;
      const m = mineral.clone();
      m.position.set(x, terrainY(x, y), y);
      return m;
    });
  minerals.forEach((m) => scene.add(m));

  THREE.DefaultLoadingManager.onLoad = function () {
    // scene.add(splatUnits(terrain));
  };

  //#region camera controllers
  gui.controllers.camera.onChangeAny(({ fov, zoom }) => {
    cameras.main.fov = fov;
    cameras.main.zoom = zoom;

    cameras.main.updateProjectionMatrix();
  });

  gui.controllers.camera.rotate.onChange((val) => {
    cameras.control.autoRotate = val;
    // startLocations.forEach((sl) => (sl.visible = !val));
    if (val) {
      cameras.control.target = scene.terrain.position;
    } else {
      cameras.control.target = null;
    }
  });

  let cameraZoom = {
    start: 1,
    end: 1,
    i: 0,
    speed: 0.1,
    active: false,
  };

  const keyDownListener = (e) => {
    if (e.code === "Digit3") {
      console.log("go");
      cameraZoom.start = cameras.main.zoom;
      cameraZoom.end = 2.8;
      cameraZoom.active = true;
    }
  };
  document.addEventListener("keydown", keyDownListener);
  //#endregion

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
      context.renderer.toneMappingExposure = toneMappingExposure;
      context.renderer.toneMapping = THREE[toneMapping];
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

  gui.controllers.pointlight.onChangeAny(
    ({ color, decay, distance, power }) => {
      pointLight.color = new THREE.Color(parseInt(color.substr(1), 16));
      pointLight.decay = decay;
      pointLight.distance = distance;
      pointLight.power = power;
    }
  );

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

  const lostContextHandler = () => {
    context.renderer.setAnimationLoop(null);
  };
  context.addEventListener("lostcontext", lostContextHandler);

  const restoreContextHandler = () => {
    context.initRenderer(true);
    cameras.onRestoreContext(scene);
    context.renderer.setAnimationLoop(gameLoop);
  };
  context.addEventListener("lostcontext", restoreContextHandler);

  const sceneResizeHandler = () => {
    cameras.onResize();
  };
  context.addEventListener("resize", sceneResizeHandler);

  context.forceResize();

  let running = true;

  function gameLoop() {
    if (!running) return;

    if (cameraZoom.active) {
      cameras.main.zoom = THREE.MathUtils.lerp(
        cameraZoom.start,
        cameraZoom.end,
        (cameraZoom.i += cameraZoom.speed)
      );
      if (cameraZoom.i > 1) {
        cameraZoom.active = false;
        cameraZoom.i = 0;
      }
      cameras.main.updateProjectionMatrix();
    }

    pointLight.position.copy(cameras.main.position);
    pointLight.position.y += 5;

    cameras.control.update();
    // cameras.updateCubeCamera(scene);

    context.renderer.clear();
    context.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    context.renderer.render(scene, cameras.main);
  }

  context.renderer.setAnimationLoop(gameLoop);

  const dispose = () => {
    console.log("disposing");

    context.renderer.setAnimationLoop(null);
    running = false;
    context.removeEventListener("resize", sceneResizeHandler);
    context.removeEventListener("lostcontext", lostContextHandler);
    context.removeEventListener("lostcontext", restoreContextHandler);

    scene.dispose();
    context.renderer.dispose();

    cameras.dispose();
    gui.dispose();
  };

  if (module.hot) {
    module.hot.dispose((data) => {
      data.filepath = filepath;
      data.camera = {
        position: cameras.main.position.clone(),
        rotation: cameras.main.rotation.clone(),
      };
      dispose();
    });
  }

  return {
    dispose,
  };
}
