import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { initRenderer } from "../3d-map-loading/renderer";
import { Vector3, OrthographicCamera, CameraHelper } from "three";
import { Minimap } from "./Minimap";
import { initOrbitControls } from "./orbitControl";
import { loadAllTerrain } from "../3d-map-loading/generateTerrainTextures";
import { imageChk } from "../utils/loadChk";
import { loadTerrainPreset } from "../3d-map-loading/terrainPresets";
import React from "react";
import { render } from "react-dom";
import { App } from "./ui";
import { ipcRenderer } from "electron";

if (module.hot) {
  module.hot.accept();
}

const LAYER_MINIMAP = 9;

console.log(new Date().toLocaleString());

render(<App />, document.getElementById("app"));

ipcRenderer.on("open-map", (event, [map]) => {
  console.log("open map");
  loadMap(map);
});

function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleBufferGeometry(2, 32);
  var material = new THREE.MeshBasicMaterial({
    color,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  circle.layers.set(LAYER_MINIMAP);
  return circle;
}

const mapWidth = 128;
const mapHeight = 96;

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;

const sceneWidth = window.innerWidth;
const sceneHeight = window.innerHeight;

let renderer = initRenderer({
  canvas: document.getElementById("three-js"),
  width: sceneWidth,
  height: sceneHeight,
  antialias: true,
  shadowMap: true,
});

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
// camera.lookAt(new THREE.Vector3());

const pipCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
pipCamera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

const minimapCamera = new OrthographicCamera(
  -mapWidth / 2,
  mapWidth / 2,
  mapHeight / 2,
  -mapHeight / 2,
  1,
  500
);
minimapCamera.position.set(0, 12, 0);
minimapCamera.lookAt(new Vector3());
minimapCamera.layers.set(LAYER_MINIMAP);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const miniMapPlane = createMiniMapPlane(128, 128, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 64);

world.add(gridHelper);
world.add(miniMapPlane);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

async function loadMap(filepath) {
  const chk = await imageChk(filepath, "./bwdata");
  const preset = loadTerrainPreset(chk.tilesetName);
  loadAllTerrain(chk, renderer, preset).then(([floor]) => {
    world.remove(gridHelper);
    world.add(floor);
    miniMapPlane.material.map = floor.material.map;
    miniMapPlane.material.needsUpdate = true;
  });
}

const orbitControls = initOrbitControls(camera, renderer.domElement);
orbitControls.update();

const cameraHelper = new THREE.CameraHelper(camera);
cameraHelper.layers.set(LAYER_MINIMAP);
scene.add(cameraHelper);

const minimap = new Minimap(
  document.getElementById("minimap"),
  mapWidth,
  mapHeight
);

let delta = new THREE.Vector3();
minimap.updateGlobalCameraStart = (pos) => {
  delta.subVectors(orbitControls.target, camera.position);
  console.log(delta, camera.position, orbitControls.target);
};

minimap.updateGlobalCamera = (pos) => {
  orbitControls.target.copy(pos);
  camera.position.subVectors(pos, delta);
};

minimap.updateMouseHover = (pos) => {
  cameraHelper.position.set(pos.x, 10, pos.z + 10);
  cameraHelper.lookAt(pos);
};

const mapAspect = Math.max(mapWidth, mapHeight);
let canvasWidth = 300;
let canvasHeight = 300;

function gameLoop() {
  requestAnimationFrame(gameLoop);

  orbitControls.update();

  renderer.clear();
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.setViewport(
    window.innerWidth - 300,
    0,
    300,
    (300 * window.innerHeight) / window.innerWidth
  );
  renderer.render(scene, pipCamera);

  const minimapWidth = (canvasHeight * mapHeight) / mapAspect;
  const minimapHeight = (canvasWidth * mapWidth) / mapAspect;

  renderer.setViewport(
    (canvasWidth - minimapWidth) / 2,
    (canvasHeight - minimapHeight) / 2,
    minimapWidth,
    minimapHeight
  );
  renderer.render(scene, minimapCamera);
}
handleResize(camera, renderer);
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop);
