import * as THREE from "three";
import { handleResize } from "../utils/resize";
import { loadAllTerrain } from "../3d-map-loading/generateTerrainTextures";
import { initRenderer } from "../3d-map-loading/renderer";
import { initOrbitControls } from "../camera-minimap/orbitControl";
import { jssuhLoadReplay } from "../replay/loaders/JssuhLoader";

import { ipcRenderer } from "electron";

ipcRenderer.on("open-replay", (event, [replay]) => {
  jssuhLoadReplay("./bwdata", replay, "./maps/(4)Fighting Spirit.scx").then(
    console.log
  );
});

ipcRenderer.on("open-map", (event, [map]) => {
  loadMap(map);
});

console.log(new Date().toLocaleString());
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
  return circle;
}

const mapWidth = 128;
const mapHeight = 128;

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

// const camera = new THREE.OrthographicCamera(-64, 64, 64, -64, 1, 1000);

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

var axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const world = new THREE.Group();
const startPos = createStartLocation(-60, -60, 0xff0000);
const startPos2 = createStartLocation(60, 60, 0x0000ff);
const gridHelper = new THREE.GridHelper(128, 64);

const light = new THREE.DirectionalLight(0xffffff, 10);
world.add(light);

var spriteMap = new THREE.TextureLoader().load("./marine.bmp");
var spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
var sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.setScalar(20);
world.add(sprite);

world.add(gridHelper);
world.add(startPos);
world.add(startPos2);
scene.add(world);

//map
//replay
//realtime
//terrain
const loadStartingUnits = (map) => {
  replay.map.geysers.forEach(({ x, y }) => {
    world.add(createGuyser(tx(x), ty(y)));
  });

  replay.map.minerals.forEach(({ x, y }) => {
    world.add(createMineral(tx(x), ty(y)));
  });
};
const loadMap = (map) => {
  loadAllTerrain(map).then(([floor]) => {
    world.remove(gridHelper);
    world.add(floor);
    // // Instantiate a exporter
    // var exporter = new GLTFExporter();

    // // Parse the input and generate the glTF output
    // exporter.parse(scene, function (gltf) {
    //   fs.writeFile("./scene.gltf", gltf, () => {});
    // });
  });
};

const orbitControls = initOrbitControls(camera, renderer.domElement);

orbitControls.update();

function gameLoop() {
  requestAnimationFrame(gameLoop);

  renderer.clear();
  renderer.render(scene, camera);
}
handleResize(camera, renderer);
// window.document.body.appendChild(renderer.domElement)
requestAnimationFrame(gameLoop);
