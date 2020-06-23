import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { loadAllTerrain } from "../3d-map-loading/loadTerrain";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

import { initRenderer } from "../3d-map-loading/renderer";
import { Vector3, OrthographicCamera, CameraHelper } from "three";
import { Minimap } from "./Minimap";
import { initOrbitControls } from "./orbitControl";

const LAYER_MINIMAP = 9;

console.log(new Date().toLocaleString());

function createMiniMapPlane(mapWidth, mapHeight) {
  const w = mapWidth;
  const h = mapHeight;

  const geo = new THREE.PlaneBufferGeometry(w, h, w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    toneMapped: false,
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
window.camera = camera;
// camera.position.set(1.0088583640552906, 38.49558806888612, 67.05301876386265);
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

const minimapCamera = new OrthographicCamera(-64, 64, 64, -64, 1, 500);
minimapCamera.position.set(0, 12, 0);
minimapCamera.lookAt(new Vector3());
minimapCamera.layers.set(LAYER_MINIMAP);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const basicFloor = createMiniMapPlane(128, 128, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 128);

world.add(gridHelper);
world.add(basicFloor);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

loadAllTerrain("(2)Blue Storm 1.2_iCCup.scx").then(([floor]) => {
  scene.add(floor);
  basicFloor.material.map = floor.material.map;
  basicFloor.material.needsUpdate = true;

  // // Instantiate a exporter
  // var exporter = new GLTFExporter();

  // // Parse the input and generate the glTF output
  // exporter.parse(scene, function (gltf) {
  //   fs.writeFile("./scene.gltf", gltf, () => {});
  // });
});

const orbitControls = initOrbitControls(camera, renderer.domElement);

orbitControls.update();

const cameraHelper = new THREE.CameraHelper(camera);
cameraHelper.layers.set(LAYER_MINIMAP);
scene.add(cameraHelper);

const updateGlobalCamera = (pos) => {
  camera.position.set(pos.x, 10, pos.z + 10);
  orbitControls.target.copy(pos);
};

const updateMouseHover = (pos) => {
  cameraHelper.position.set(pos.x, 10, pos.z + 10);
  cameraHelper.lookAt(pos);
};
const minimap = new Minimap(
  document.getElementById("minimap"),
  128,
  128,
  updateGlobalCamera,
  updateMouseHover
);

function gameLoop() {
  requestAnimationFrame(gameLoop);

  orbitControls.update();

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
