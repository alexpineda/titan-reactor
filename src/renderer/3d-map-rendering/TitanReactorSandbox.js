// playground for environment
import * as THREE from "three";
import { createStats, SceneGui } from "./gui/gui";
import { handleResize } from "../utils/resize";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import { mapElevationsCanvasTexture } from "./textures/mapElevationsCanvasTexture";

import { sunlight } from "./environment/sunlight";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";

import { LoadModel } from "../utils/meshes/LoadModels";
import { Terrain } from "./Terrain";
import { initRenderer } from "./renderer";

export async function TitanReactorSandbox(chk, canvas, loaded) {
  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;

  const gui = new SceneGui();
  await gui.load(chk.tilesetName);

  const renderer = initRenderer({
    canvas,
    width: sceneWidth,
    height: sceneHeight,
    antialias: true,
    shadowMap: true,
  });

  const scene = new THREE.Scene();
  window.scene = scene;

  const terrainMesh = new Terrain(chk);
  const terrain = await terrainMesh.generate();

  const elevationsTexture = await mapElevationsCanvasTexture(chk);
  const bg = await bgMapCanvasTexture(chk);
  const bgTerrain = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);

  const findMeshByName = (name) => {
    let mesh;
    scene.traverse((o) => {
      if (o.name === name) {
        mesh = o;
        return false;
      }
    });
    return mesh;
  };

  const fogColor = new THREE.Color(0x080820);
  scene.background = fogColor;

  scene.fog = new THREE.Fog(fogColor, 256, 512);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  window.camera = camera;
  camera.position.set(13.313427680971873, 19.58336565195161, 56.716490281);
  camera.rotation.set(
    -0.9353944571799614,
    0.0735893206705483,
    0.09937435112806427
  );
  camera.lookAt(new THREE.Vector3());

  var axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const world = new THREE.Group();
  const gridHelper = new THREE.GridHelper(128, 64);

  world.add(gridHelper);
  scene.add(world);

  const light = sunlight(chk.size[0], chk.size[1]);
  scene.add(light);
  var lightCameraHelper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(lightCameraHelper);
  var lightHelper = new THREE.DirectionalLightHelper(light, 5);
  scene.add(lightHelper);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 12);
  scene.add(hemi);

  world.remove(gridHelper);
  world.add(terrain);
  world.add(bgTerrain);

  const orbitControls = initOrbitControls(camera, renderer.domElement);
  orbitControls.update();

  const cancelResize = handleResize(camera, renderer);

  const loadModel = new LoadModel();
  const units = new THREE.Object3D();
  scene.add(units);
  const assignModel = () => (model) => units.add(model);
  loadModel.load(`_alex/scvm.glb`).then(assignModel(0x7));
  loadModel.load(`_alex/probe.glb`).then(assignModel(0x40));
  loadModel.load(`_alex/supply.glb`).then(assignModel(0x6d));
  loadModel.load(`_alex/pylon.glb`).then(assignModel(0x9c));
  loadModel.load(`_alex/nexus.glb`).then(assignModel(0x9a));
  loadModel.load(`_alex/command-center.glb`).then(assignModel(0x6a));
  loadModel.load(`_alex/refinery.glb`).then(assignModel(0x6e));
  loadModel.load(`_alex/barracks.glb`).then(assignModel(0x6f));
  loadModel.load(`_alex/assimilator.glb`).then(assignModel(0x9d));
  loadModel.load(`_alex/gateway.glb`).then(assignModel(0xa0));
  loadModel.load(`_alex/dropship.glb`).then(assignModel(0xb));

  THREE.DefaultLoadingManager.onLoad = function () {
    var sampler = new MeshSurfaceSampler(terrain)
      .setWeightAttribute("uv")
      .build();

    units.children.forEach((unit) => {
      let position = new THREE.Vector3(),
        normal = new THREE.Vector3();
      sampler.sample(position, normal);
      unit.position.set(position.x, position.z, position.y);
    });

    loaded();
  };

  const stats = createStats();

  let running = true;
  let id = null;
  function gameLoop() {
    if (!running) return;
    orbitControls.update();

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    setTimeout(() => {
      id = requestAnimationFrame(gameLoop);
    }, 100);
  }

  document.body.appendChild(renderer.domElement);

  gameLoop();

  //#region camera controllers
  gui.controllers.camera.onChangeAny(({ fov, zoom }) => {
    camera.fov = fov;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  });

  gui.controllers.camera.free.onChange((free) => {
    controls.dispose();
    controls = initOrbitControls(camera, renderer.domElement, free);
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

  return {
    dispose: () => {
      running = false;
      cancelAnimationFrame(id);
      //dispose all
      cancelResize();

      //textures

      //materials

      //geometries

      //scene dispose
      scene.traverse((o) => {
        if (o.type === "Mesh") {
          if (o.material) {
            if (o.material.map) {
              o.material.map.dispose();
            }
            if (o.material.bumpMap) {
              o.material.bumpMap.dispose();
            }
            if (o.material.normalMap) {
              o.material.normalMap.dispose();
            }
            if (o.material.displacementMap) {
              o.material.displacementMap.dispose();
            }
            if (o.material.roughnessMap) {
              o.material.roughnessMap.dispose();
            }
            if (o.material.emissiveMap) {
              o.material.emissiveMap.dispose();
            }
            o.material.dispose();
          }
          o.geometry.dispose();
          o.dispose();
        }
      });
    },
  };
}
