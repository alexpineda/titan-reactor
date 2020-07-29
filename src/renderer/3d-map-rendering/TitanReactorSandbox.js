// playground for environment
import * as THREE from "three";
import { EnvironmentOptionsGui } from "./EnvironmentOptionsGui";
import { createStats } from "../utils/stats";
import { handleResize } from "../utils/resize";
import { initCamera } from "../camera-minimap/camera";
import { mapElevationsCanvasTexture } from "./textures/mapElevationsCanvasTexture";

import { sunlight, fog } from "./environment";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";

import { Terrain } from "./Terrain";
import { initRenderer } from "./renderer";
import { splatUnits } from "../utils/meshes/splatUnits";
import { disposeMeshes } from "../utils/meshes/dispose";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { render } from "react-dom";

export async function TitanReactorSandbox(chk, canvas, loaded) {
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

  const terrainMesh = new Terrain(chk);
  const terrain = await terrainMesh.generate();
  terrain.userData.elevationsTexture = await mapElevationsCanvasTexture(chk);
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);
  bgTerrain.position.y = -1;
  scene.add(terrain);
  // scene.add(bgTerrain);

  scene.fog = fog(chk.size[0], chk.size[1]);
  scene.background = scene.fog.color;

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);
  var lightCameraHelper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(light, 5);
  scene.add(lightHelper);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 12);
  scene.add(hemi);

  const [camera, cameraControls] = initCamera(renderer.domElement);
  cameraControls.update();

  const cancelResize = handleResize(camera, renderer);

  THREE.DefaultLoadingManager.onLoad = function () {
    scene.add(splatUnits(terrain));
    loaded();
  };

  const stats = createStats();

  let running = true;
  let id = null;

  function gameLoop() {
    if (!running) return;

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    stats.update();
    // setTimeout(() => {
    //   id = requestAnimationFrame(gameLoop);
    // }, 100);
  }

  document.body.appendChild(renderer.domElement);

  renderer.setAnimationLoop(gameLoop);
  // gameLoop();

  //#region camera controllers
  gui.controllers.camera.onChangeAny(({ fov, zoom }) => {
    camera.fov = fov;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  });

  //#endregion

  //#region map controllers
  gui.controllers.map.onChangeAny(({ showElevations, showWireframe }) => {
    if (showElevations) {
      terrain.material.map = terrain.userData.elevationsTexture;
    } else {
      terrain.material.map = terrain.userData.originalMap;
    }
    terrain.material.wireframe = showWireframe;
  });
  //#endregion

  //#region renderer controllers
  gui.controllers.renderer.fogColor.onChange((fogColor) => {
    scene.background = new THREE.Color(parseInt(fogColor.substr(1), 16));
    scene.fog.color = scene.background;
  });

  gui.controllers.renderer.onFinishChangeAny(
    ({ toneMappingExposure, gammaFactor, toneMapping }) => {
      renderer.toneMappingExposure = toneMappingExposure;
      renderer.gammaFactor = gammaFactor;
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

  document.body.appendChild(VRButton.createButton(renderer));

  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(id);
      //dispose all
      cancelResize();
      disposeMeshes(scene);
      //textures

      //materials

      //geometries

      //scene dispose
    },
  };
}
