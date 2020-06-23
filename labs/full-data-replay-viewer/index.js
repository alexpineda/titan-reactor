import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { loadAllTerrain } from "../3d-map-rendering/loadTerrain";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

console.log(new Date().toLocaleString());

function createFloor(mapWidth, mapHeight) {
  const w = mapWidth;
  const h = mapHeight;

  const geo = new THREE.PlaneGeometry(w, h, w, h);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: false,
    wireframeLinewidth: 10,
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.rotateX(-0.5 * Math.PI);
  return mesh;
}

function createStartLocation(mapX, mapY, color) {
  var geometry = new THREE.CircleGeometry(2, 32);
  var material = new THREE.MeshBasicMaterial({
    color,
  });
  var circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = Math.PI / -2;
  circle.position.x = mapX;
  circle.position.z = mapY;
  circle.position.y = 0.01;
  return circle;
}

const scene = new THREE.Scene();

// @ts-ignore
window.scene = scene;

let renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-js"),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const mapMesh = createFloor(128, 128, null);
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 128);

camera.position.set(0, 100, 100);
camera.lookAt(mapMesh.position);

world.add(gridHelper);
world.add(mapMesh);
world.add(startPos);
world.add(startPos2);
scene.add(world);

const clock = new THREE.Clock(true);
let frames = 10;

let cameraTarget = new THREE.Vector3();
const light = new THREE.DirectionalLight(0xffffff, 10);
scene.add(light);

loadAllTerrain("(4)Fighting Spirit.scx").then(([floor]) => {
  scene.add(floor);
  // Instantiate a exporter
  var exporter = new GLTFExporter();

  // Parse the input and generate the glTF output
  exporter.parse(scene, function (gltf) {
    fs.writeFile("./scene.gltf", gltf, () => {});
  });
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function gameLoop() {
  requestAnimationFrame(gameLoop);

  renderer.render(scene, camera);
}
handleResize(camera, renderer);
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop);
