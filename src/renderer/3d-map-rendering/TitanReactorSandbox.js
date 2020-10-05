// playground for environment
import * as THREE from "three";
import { EnvironmentOptionsGui } from "./EnvironmentOptionsGui";
import { createStats } from "../utils/stats";
import { handleResize } from "../utils/resize";
import { initCamera, initCubeCamera } from "../camera-minimap/camera";
import { mapElevationsCanvasTexture } from "./textures/mapElevationsCanvasTexture";

import { sunlight, fog } from "./lights";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";

import { Terrain } from "./Terrain";
import { initRenderer } from "../renderer";
import { disposeMeshes } from "../utils/dispose";
import { TextureCache } from "./textures/TextureCache";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { render } from "react-dom";

import { getAppCachePath } from "../invoke";
import { createStartLocation } from "../utils/BasicObjects";
import { getTerrainY } from "./displacementGeometry";
import { LoadModel } from "../mesh/LoadModels";
import { Vector3, WebGLCubeRenderTarget } from "three";
import { dec } from "ramda";

export const hot = module.hot ? module.hot.data : null;

export async function TitanReactorSandbox(filepath, chk, canvas, loaded) {
  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;

  const gui = new EnvironmentOptionsGui();
  await gui.load(chk.tilesetName);

  const renderer = initRenderer({
    canvas,
    width: sceneWidth,
    height: sceneHeight,
    antialias: true,
    shadowMap: true,
  });

  const scene = (window.scene = new THREE.Scene());

  const terrainMesh = new Terrain(
    chk,
    new TextureCache(chk.title, await getAppCachePath())
  );
  const terrain = await terrainMesh.generate();
  terrain.userData.elevationsTexture = await mapElevationsCanvasTexture(chk);
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);
  bgTerrain.position.y = -1;
  scene.add(terrain);
  scene.add(bgTerrain);

  scene.fog = fog(chk.size[0], chk.size[1]);
  scene.background = scene.fog.color;

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);
  var lightCameraHelper = new THREE.CameraHelper(light.shadow.camera);
  lightCameraHelper.visible = false;
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(light, 5);
  scene.add(lightHelper);
  lightHelper.visible = false;

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 5);
  scene.add(hemi);

  const [camera, cameraControls] = initCamera(renderer.domElement);
  if (hot && hot.camera) {
    camera.position.copy(hot.camera.position);
    camera.rotation.copy(hot.camera.rotation);
  }
  cameraControls.update();

  const terrainY = getTerrainY(
    terrain.userData.displacementMap.image
      .getContext("2d")
      .getImageData(
        0,
        0,
        terrain.userData.displacementMap.image.width,
        terrain.userData.displacementMap.image.height
      ),
    terrain.userData.displacementScale,
    chk.size[0],
    chk.size[1]
  );

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

  const cubeCamera = initCubeCamera(renderer, terrain.material.map);
  scene.add(cubeCamera);

  const pointLight = new THREE.PointLight();
  pointLight.castShadow = true;
  scene.add(pointLight);

  const loadModel = new LoadModel();
  const mineral = await loadModel.load("_alex/mineral1.glb", "mineral", (o) => {
    o.receiveShadow = false;
    o.material.envMap = cubeCamera.renderTarget.texture;
  });

  const minerals = chk.units
    .filter((unit) => [176, 177, 178].includes(unit.unitId))
    .map((unit) => {
      const x = unit.x / 32 - chk.size[0] / 2;
      const y = unit.y / 32 - chk.size[1] / 2;
      const m = mineral.clone();
      m.position.set(x, terrainY(x, y), y);
      return m;
    });
  minerals.forEach((m) => scene.add(m));

  const cancelResize = handleResize(camera, renderer);

  THREE.DefaultLoadingManager.onLoad = function () {
    // scene.add(splatUnits(terrain));
    loaded();
  };

  //#region camera controllers
  gui.controllers.camera.onChangeAny(({ fov, zoom }) => {
    camera.fov = fov;
    camera.zoom = zoom;

    camera.updateProjectionMatrix();
  });

  gui.controllers.camera.rotate.onChange((val) => {
    cameraControls.autoRotate = val;
    // startLocations.forEach((sl) => (sl.visible = !val));
    if (val) {
      cameraControls.target = terrain.position;
    } else {
      cameraControls.target = null;
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
      cameraZoom.start = camera.zoom;
      cameraZoom.end = 2.8;
      cameraZoom.active = true;
    }
  };
  document.addEventListener("keydown", keyDownListener);
  //#endregion

  //#region map controllers
  gui.controllers.map.onChangeAny(
    ({ showElevations, showWireframe, showBackgroundTerrain }) => {
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
      renderer.toneMappingExposure = toneMappingExposure;
      renderer.toneMapping = THREE[toneMapping];
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
    if (value) {
      terrain.material.map = terrain.userData.displacementMap;
    } else {
      terrain.material.map = terrain.userData.originalMap;
    }
  });
  //#endregion

  // document.body.appendChild(VRButton.createButton(renderer));

  let running = true;
  let id = null;

  function gameLoop() {
    if (!running) return;

    if (cameraZoom.active) {
      camera.zoom = THREE.MathUtils.lerp(
        cameraZoom.start,
        cameraZoom.end,
        (cameraZoom.i += cameraZoom.speed)
      );
      if (cameraZoom.i > 1) {
        cameraZoom.active = false;
        cameraZoom.i = 0;
      }
      camera.updateProjectionMatrix();
    }

    pointLight.position.copy(camera.position);
    pointLight.position.y += 5;

    cameraControls.update();
    cubeCamera.position.copy(camera.position);
    cubeCamera.rotation.copy(camera.rotation);
    cubeCamera.update(renderer, scene);

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(gameLoop);

  const dispose = () => {
    console.log("disposing");

    running = false;
    cancelAnimationFrame(id);
    cancelResize();
    disposeMeshes(scene);
    renderer.dispose();

    //@todo
    // cubeCamera.dispose();

    cameraControls.dispose();
    gui.dispose();
  };

  if (module.hot) {
    module.hot.dispose((data) => {
      data.filepath = filepath;
      data.camera = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
      };
      dispose();
    });
  }

  return {
    dispose,
  };
}
