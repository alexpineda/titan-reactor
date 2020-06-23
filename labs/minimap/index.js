import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { loadAllTerrain } from "../3d-map-rendering/loadTerrain";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { initRenderer } from "../3d-map-rendering/renderer";
import { Vector3, OrthographicCamera, CameraHelper } from "three";
import { Minimap } from "./Minimap";

const LAYER_MINIMAP = 9;

console.log(new Date().toLocaleString());

function createFloor(mapWidth, mapHeight) {
  const w = mapWidth;
  const h = mapHeight;

  const geo = new THREE.PlaneBufferGeometry(w, h, w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x999999,
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  mesh.layers.set(LAYER_MINIMAP);
  return mesh;
}

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

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;
// const loader = new THREE.CubeTextureLoader();
// const texture = loader.load([
//   "skybox/right.jpg",
//   "skybox/left.jpg",
//   "skybox/top.jpg",
//   "skybox/bottom.jpg",
//   "skybox/front.jpg",
//   "skybox/bacl.jpg",
// ]);
// scene.background = texture;

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

const pipCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
pipCamera.position.set(33.63475259896081, 17.37837820247766, 40.53771830914678);

const minimapCamera = new OrthographicCamera(-64, 64, 64, -64, 1, 500);
minimapCamera.position.set(0, 12, 0);
minimapCamera.lookAt(new Vector3());
minimapCamera.layers.set(LAYER_MINIMAP);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const basicFloor = createFloor(128, 128, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 128);

camera.position.set(0, 100, -100);
camera.lookAt(new THREE.Vector3());

world.add(gridHelper);
world.add(basicFloor);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const clock = new THREE.Clock(true);
let frames = 10;

let cameraTarget = new THREE.Vector3();
const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

// loadAllTerrain("(4)Fighting Spirit.scx").then(([floor]) => {
//   scene.add(floor);
//   basicFloor.material.map = floor.material.map;
//   basicFloor.material.needsUpdate = true;

//   // // Instantiate a exporter
//   // var exporter = new GLTFExporter();

//   // // Parse the input and generate the glTF output
//   // exporter.parse(scene, function (gltf) {
//   //   fs.writeFile("./scene.gltf", gltf, () => {});
//   // });
// });

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const cameraHelper = new THREE.CameraHelper(camera);
cameraHelper.layers.set(LAYER_MINIMAP);
scene.add(cameraHelper);

const updateGlobalCamera = (pos) => {
  camera.position.set(pos.x, 10, pos.z + 10);
  camera.lookAt(pos);
  controls.update();
};
const minimap = new Minimap(
  document.getElementById("minimap"),
  128,
  128,
  updateGlobalCamera
);

function gameLoop() {
  requestAnimationFrame(gameLoop);
  // pipCamera.position.x = Math.cos((pipCamera.position.x += 0.00001));
  // pipCamera.position.z = Math.sin((pipCamera.position.z += 0.00001));
  pipCamera.lookAt(new Vector3());
  // pipCamera.position.y = 20 + Math.cos(pipCamera.position.y);

  renderer.clear();
  renderer.setViewport(0, 0, sceneWidth, sceneHeight);
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.setViewport(
    sceneWidth - 300,
    0,
    300,
    (300 * sceneHeight) / sceneWidth
  );
  renderer.render(scene, pipCamera);

  renderer.setViewport(0, 0, 300, 300);
  renderer.render(scene, minimapCamera);
}
handleResize(camera, renderer);
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop);
