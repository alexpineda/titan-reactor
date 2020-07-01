import React from "react";
import * as THREE from "three";
import { render } from "react-dom";
import { ipcRenderer } from "electron";
import { createStats, createGui } from "./gui/gui";
import { handleResize } from "../utils/resize";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";

import { initRenderer } from "./renderer";
import { imageChk } from "../utils/loadChk";
import { gameOptions } from "../utils/gameOptions";
import { App } from "./ui";
import { sunlight } from "./environment/sunlight";

import { terrainMesh } from "./meshes/terrainMesh";
import { backgroundTerrainMesh } from "./meshes/backgroundTerrainMesh";
import { mapCanvasTexture } from "./textures/mapCanvasTexture";
import { bgMapCanvasTexture } from "./textures/bgMapCanvasTexture";
import { displacementCanvasTexture } from "./textures/displacementCanvasTexture";
import { roughnessCanvasTexture } from "./textures/roughnessCanvasTexture";
import { normalCanvasTexture } from "./textures/normalCanvasTexture";
import { mapPreviewCanvas } from "./textures/mapPreviewCanvas";
import { mapElevationsCanvasTexture } from "./textures/mapElevationsCanvasTexture";
import { createDisplacementGeometry } from "./displacementGeometry";
import { LoadModel } from "../utils/meshes/LoadModels";

console.log("3d-map-loading", new Date().toLocaleString());

render(<App />, document.getElementById("app"));

ipcRenderer.on("open-map", (event, [map]) => {
  console.log("open map");
  loadMap(map);
});

const scene = new THREE.Scene();
window.scene = scene;

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

const renderer = initRenderer({
  width: window.innerWidth,
  height: window.innerHeight,
});

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

let controls = initOrbitControls(camera, renderer.domElement, false);

camera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

controls.update();
camera.lookAt(new THREE.Vector3());

const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 3);
scene.add(hemi);

const light = sunlight(128, 128);
scene.add(light);

var lightCameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(lightCameraHelper);
var lightHelper = new THREE.DirectionalLightHelper(light, 5);
scene.add(lightHelper);

const spotlight = new THREE.SpotLight(0xffa95c, 100);
spotlight.position.y = 50;
spotlight.position.z = 80;
spotlight.castShadow = true;
spotlight.shadow.bias = -0.0001;
spotlight.shadow.mapSize.width = 1024 * 4;
spotlight.shadow.mapSize.height = 1024 * 4;
scene.add(spotlight);

const spotlightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(spotlightHelper);

var pointLight = new THREE.PointLight(0xedd89f, 1, 100);
pointLight.position.set(-64, 10, -64);
pointLight.power = 16 * Math.PI;
pointLight.decay = 2;
scene.add(pointLight);

const loadModel = new LoadModel();
const prefabs = [];
const assignModel = (id) => (model) => (prefabs[id] = model);
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

document.body.appendChild(renderer.domElement);

const stats = createStats();

let currentMapFilePath;
const loadMap = async (filepath) => {
  currentMapFilePath = filepath;
  const mapPreviewEl = document.getElementById("map--preview-canvas");
  const mapNameEl = document.getElementById("map-name");
  const mapDescriptionEl = document.getElementById("map-description");
  const loadOverlayEl = document.getElementById("load-overlay");

  // hide loading ui elements
  mapNameEl.innerText = "initializing...";
  mapDescriptionEl.innerText = "";
  mapPreviewEl.style.display = "none";
  loadOverlayEl.style.display = "flex";

  console.log("load chk", filepath);
  const chk = await imageChk(filepath, gameOptions.bwDataPath);
  console.log("chk loaded", filepath, chk);
  scene.userData.chk = chk;

  await mapPreviewCanvas(chk, mapPreviewEl);

  await new Promise((res, rej) => {
    mapNameEl.innerText = chk.title;
    document.title = `Titan Reactor - ${chk.title}`;
    // mapDescriptionEl.innerText = chk.description;
    mapDescriptionEl.innerText = chk.tilesetName;
    mapPreviewEl.style.display = "block";
    setTimeout(res, 100);
  });

  const map = await mapCanvasTexture(chk);
  const bg = await bgMapCanvasTexture(chk);
  const displace = await displacementCanvasTexture(chk);
  const roughness = await roughnessCanvasTexture(chk);
  const normal = await normalCanvasTexture(chk);

  const newFloor = terrainMesh(
    chk.size[0],
    chk.size[1],
    map,
    displace,
    roughness,
    normal
  );
  newFloor.name = "floor";
  const newFloorBg = backgroundTerrainMesh(chk.size[0], chk.size[1], bg);
  newFloorBg.name = "backing-floor";
  const elevationsTexture = await mapElevationsCanvasTexture(chk);

  const floor = findMeshByName("floor");
  const floorBg = findMeshByName("backing-floor");
  if (floor) {
    scene.remove(floor);
  }
  if (floorBg) {
    scene.remove(floorBg);
  }
  scene.add(newFloor);
  scene.add(newFloorBg);

  newFloor.userData.originalMap = newFloor.material.map;
  newFloor.userData.elevationsTexture = elevationsTexture;

  // var vertexHelper = new VertexNormalsHelper(newFloor, 2, 0x00ff00, 1);
  // scene.add(vertexHelper);

  var sampler = new MeshSurfaceSampler(newFloor)
    .setWeightAttribute("uv")
    .build();

  scene.traverse((o) => {
    if (o.userData.type === "unit") {
      scene.remove(o);
    }
  });

  prefabs.forEach((prefab) => {
    let position = new THREE.Vector3(),
      normal = new THREE.Vector3();
    sampler.sample(position, normal);
    prefab.position.set(position.x, position.z, position.y);
    prefab.userData.type = "unit";
    scene.add(prefab);
  });

  loadOverlayEl.style.display = "none";
};

const { control, controllers } = createGui();

let f = 0;
let cycle = 0;
function animate() {
  stats.begin();

  cycle++;

  if (cycle % 10) {
    spotlight.position.set(
      camera.position.x + 10,
      camera.position.y + 10,
      spotlight.position.z
    );
    f += 0.01;
    pointLight.position.x = Math.cos(f) * 64;
    pointLight.position.z = Math.sin(f) * 64;
  }

  stats.end();
  renderer.render(scene, camera);
  setTimeout(() => requestAnimationFrame(animate), 100);
}
animate();

handleResize(camera, renderer);

//#region camera controllers
controllers.camera.onChangeAny(({ fov, zoom }) => {
  camera.fov = fov;
  camera.zoom = zoom;
  camera.updateProjectionMatrix();
});

controllers.camera.free.onChange((free) => {
  controls.dispose();
  controls = initOrbitControls(camera, renderer.domElement, free);
});
//#endregion

//#region map controllers
controllers.map.onChangeAny(({ showElevations, showWireframe }) => {
  const floor = findMeshByName("floor");
  if (!floor) return;
  if (showElevations) {
    floor.material.map = newFloor.userData.elevationsTexture;
  } else {
    material.map = floor.userData.originalMap;
  }
  floor.material.wireframe = showWireframe;
});
//#endregion

//#region renderer controllers
controllers.renderer.fogColor.onChange((fogColor) => {
  scene.background = new THREE.Color(parseInt(fogColor.substr(1), 16));
  scene.fog.color = scene.background;
});

controllers.renderer.onFinishChangeAny(
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
controllers.hemilight.onChangeAny(({ intensity, skyColor, groundColor }) => {
  hemi.intensity = intensity;
  hemi.skyColor = new THREE.Color(parseInt(skyColor.substr(1), 16));
  hemi.groundColor = new THREE.Color(parseInt(groundColor.substr(1), 16));
});
//#endregion

//#region pointlight controllers
controllers.pointlight.onChangeAny(({ intensity, color, helper }) => {
  pointLight.intensity = intensity;
  pointLight.color = new THREE.Color(parseInt(color.substr(1), 16));
});

//#endregion

//#region dirlight controllers
controllers.dirlight.onChangeAny(
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

//#region spotlight controllers
controllers.spotlight.onChangeAny(
  ({
    castShadow,
    shadowBias,
    decay,
    distance,
    penumbra,
    power,
    color,
    helper,
  }) => {
    spotlight.castShadow = castShadow;
    spotlight.shadow.bias = shadowBias;
    spotlight.decay = decay;
    spotlight.distance = distance;
    spotlight.penumbra = penumbra;
    spotlight.power = power;
    spotlight.color = new THREE.Color(parseInt(color.substr(1), 16));
    spotlightHelper.visible = helper;
  }
);
//#endregion

//#region displacement base controllers
// controllers.displacementBase.elevations.onChange;

//#endregion

//#region
controllers.displacementMix.show.onChange((value) => {
  const floor = findMeshByName("floor");
  if (!floor) return;
  if (value) {
    floor.material.map = floor.userData.displacementMap;
  } else {
    material.map = floor.userData.originalMap;
  }
});
//#endregion
